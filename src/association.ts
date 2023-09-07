import { Uri, FileStat } from 'vscode'

export interface JsonConfig {
  associations: Record<string, string[]>
}

interface DocumentReentryError {
  docPath: string
  definedIn: string
  redefinedIn: string
}
type ExistenceType = 'directory' | 'documentation'

type ExistenceCheckResult<T extends ExistenceType> = { exists: boolean } & {
  [K in T]: string
}

export class AssociationsManager {
  private baseDir: string
  private statFunction: (uri: Uri) => Promise<FileStat>

  constructor(baseDir: string, statFunction: (uri: Uri) => Promise<FileStat>) {
    this.baseDir = baseDir
    this.statFunction = statFunction
  }

  public async directoriesExist(
    directories: string[]
  ): Promise<ExistenceCheckResult<'directory'>[]> {
    return Promise.all(directories.map((directory) => this.checkExistence(directory, 'directory')))
  }

  public async documentationsExist(
    directories: Record<string, string[]>
  ): Promise<ExistenceCheckResult<'documentation'>[]> {
    const allDocs = Object.values(directories).flat()
    return Promise.all(allDocs.map((doc) => this.checkExistence(doc, 'documentation')))
  }

  public checkDuplicateDocsInDirectory(
    associations: Record<string, string[]>
  ): DocumentReentryError[] {
    const duplicates: DocumentReentryError[] = []
    const docToDirMap: Record<string, string> = {}

    Object.entries(associations).forEach(([directory, docs]) => {
      docs.forEach((doc) => {
        if (docToDirMap[doc]) {
          duplicates.push({
            docPath: doc,
            definedIn: docToDirMap[doc],
            redefinedIn: directory,
          })
        } else {
          docToDirMap[doc] = directory
        }
      })
    })

    return duplicates
  }

  private async checkExistence<T extends ExistenceType>(
    name: string,
    type: T
  ): Promise<ExistenceCheckResult<T>> {
    const uri = Uri.file(`${this.baseDir}/${name}`)
    try {
      await this.statFunction(uri)
      return { [type]: name, exists: true } as ExistenceCheckResult<T>
    } catch {
      return { [type]: name, exists: false } as ExistenceCheckResult<T>
    }
  }
}
