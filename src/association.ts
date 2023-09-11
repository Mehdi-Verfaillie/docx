import { Uri } from 'vscode'
import { FileManager } from './utils/files.utils'

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
  private fileManager: FileManager

  constructor(baseDir: string, fileManager: FileManager) {
    this.baseDir = baseDir
    this.fileManager = fileManager
  }

    const allErrors = [...dirErrors, ...docErrors, ...dupDocErrors, ...inheritedDupDocErrors]

    if (allErrors.length > 0) {
      return allErrors
    }
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

    Object.entries(associations).forEach(([directory, docs]) => {
      const seenDocs: Set<string> = new Set()

      docs.forEach((doc) => {
        if (seenDocs.has(doc)) {
          duplicates.push({
            errorType: 'DUPLICATE',
            entityType: 'documentationFile',
            entityPath: doc,
            originalLocation: directory,
            duplicateLocation: directory,
          })
        } else {
          seenDocs.add(doc)
        }
      })
    })

    return duplicates
  }

  public findInheritedDuplicateDocsInDirectory(associations: {
    [key: string]: string[]
  }): DuplicateEntityError[] {
    const errors: DuplicateEntityError[] = []

    for (const [parentDir, parentDocs] of Object.entries(associations)) {
      for (const [childDir, childDocs] of Object.entries(associations)) {
        if (childDir.startsWith(parentDir) && childDir !== parentDir) {
          for (const doc of parentDocs) {
            if (childDocs.includes(doc)) {
              errors.push({
                errorType: 'DUPLICATE',
                entityType: 'documentationFile',
                entityPath: doc,
                originalLocation: parentDir,
                duplicateLocation: childDir,
              })
            }
          }
        }
      }
    }

    return errors
  }

  private async checkExistence<T extends ProjectEntityType>(
    name: string,
    type: T
  ): Promise<MissingEntityError | undefined> {
    const uri = Uri.file(`${this.baseDir}/${name}`)
    try {
      await this.fileManager.ensureFileExists(uri)
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
