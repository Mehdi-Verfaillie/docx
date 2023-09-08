import { Uri, FileStat } from 'vscode'

export interface DocAssociationsConfig {
  associations: Record<string, string[]>
}

type ProjectEntityType = 'directory' | 'documentationFile'

interface EntityError {
  errorType: 'MISSING' | 'DUPLICATE'
  entityType: ProjectEntityType
  entityPath: string
}

interface MissingEntityError extends EntityError {
  errorType: 'MISSING'
}

interface DuplicateEntityError extends EntityError {
  errorType: 'DUPLICATE'
  originalLocation: string
  duplicateLocation: string
}

export class AssociationsManager {
  private baseDir: string
  private statFunction: (uri: Uri) => Promise<FileStat>

  constructor(baseDir: string, statFunction: (uri: Uri) => Promise<FileStat>) {
    this.baseDir = baseDir
    this.statFunction = statFunction
  }

  public async validateDirectoryPaths(directories: string[]): Promise<MissingEntityError[]> {
    const errors = await Promise.all(
      directories.map((directory) => this.checkExistence(directory, 'directory'))
    )
    return errors.filter(Boolean) as MissingEntityError[]
  }

  public async validateDocumentationPaths(
    associations: Record<string, string[]>
  ): Promise<MissingEntityError[]> {
    const allDocumentPaths = Object.values(associations).flat()
    const errors = await Promise.all(
      allDocumentPaths.map((doc) => this.checkExistence(doc, 'documentationFile'))
    )
    return errors.filter(Boolean) as MissingEntityError[]
  }

  public findDuplicateDocsInDirectory(
    associations: Record<string, string[]>
  ): DuplicateEntityError[] {
    const duplicates: DuplicateEntityError[] = []
    const docLocationMapping: Record<string, string> = {}

    Object.entries(associations).forEach(([directory, docs]) => {
      docs.forEach((doc) => {
        if (docLocationMapping[doc]) {
          duplicates.push({
            errorType: 'DUPLICATE',
            entityType: 'documentationFile',
            entityPath: doc,
            originalLocation: docLocationMapping[doc],
            duplicateLocation: directory,
          })
        } else {
          docLocationMapping[doc] = directory
        }
      })
    })

    return duplicates
  }

  private async checkExistence<T extends ProjectEntityType>(
    name: string,
    type: T
  ): Promise<MissingEntityError | undefined> {
    const uri = Uri.file(`${this.baseDir}/${name}`)
    try {
      await this.statFunction(uri)
      return // Entity exists, no error
    } catch {
      return {
        errorType: 'MISSING',
        entityType: type,
        entityPath: name,
      } // Return the error
    }
  }
}
