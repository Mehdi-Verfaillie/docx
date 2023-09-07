import { Uri, FileStat } from 'vscode'

export interface DocAssociationsConfig {
  associations: Record<string, string[]>
}

interface DocumentReentryError {
  docPath: string
  definedIn: string
  redefinedIn: string
}

type ProjectEntityType = 'directory' | 'documentationFile'

type ProjectEntityStatus<T extends ProjectEntityType> = { exists: boolean } & {
  [K in T]: string
}

export class AssociationsManager {
  private baseDir: string
  private statFunction: (uri: Uri) => Promise<FileStat>

  constructor(baseDir: string, statFunction: (uri: Uri) => Promise<FileStat>) {
    this.baseDir = baseDir
    this.statFunction = statFunction
  }

  public async doesDirectoriesExist(
    directories: string[]
  ): Promise<ProjectEntityStatus<'directory'>[]> {
    return Promise.all(directories.map((directory) => this.checkExistence(directory, 'directory')))
  }

  public async doesDocumentationFilesExist(
    directories: Record<string, string[]>
  ): Promise<ProjectEntityStatus<'documentationFile'>[]> {
    const allDocumentPaths = Object.values(directories).flat()
    return Promise.all(allDocumentPaths.map((doc) => this.checkExistence(doc, 'documentationFile')))
  }

  public findDuplicateDocsInDirectory(
    associations: Record<string, string[]>
  ): DocumentReentryError[] {
    const duplicates: DocumentReentryError[] = []
    const docLocationMapping: Record<string, string> = {}

    Object.entries(associations).forEach(([directory, docs]) => {
      docs.forEach((doc) => {
        if (docLocationMapping[doc]) {
          duplicates.push({
            docPath: doc,
            definedIn: docLocationMapping[doc],
            redefinedIn: directory,
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
  ): Promise<ProjectEntityStatus<T>> {
    const uri = Uri.file(`${this.baseDir}/${name}`)
    try {
      await this.statFunction(uri)
      return { [type]: name, exists: true } as ProjectEntityStatus<T>
    } catch {
      return { [type]: name, exists: false } as ProjectEntityStatus<T>
    }
  }
}
