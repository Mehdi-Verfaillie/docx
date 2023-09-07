import { Uri, FileStat } from 'vscode'

export interface JsonConfig {
  associations: {
    [key: string]: string[]
  }
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
  ): Promise<{ directory: string; exists: boolean }[]> {
    return Promise.all(directories.map((directory) => this.checkDirectory(directory)))
  }

  public async documentationsExist(directories: {
    [key: string]: string[]
  }): Promise<{ documentation: string; exists: boolean }[]> {
    const allDocs = Object.values(directories).flat()
    return Promise.all(allDocs.map((doc) => this.checkFile(doc)))
  }

  private async checkDirectory(directory: string): Promise<{ directory: string; exists: boolean }> {
    const uri = Uri.file(`${this.baseDir}/${directory}`)
    try {
      await this.statFunction(uri)
      return { directory, exists: true }
    } catch {
      return { directory, exists: false }
    }
  }

  private async checkFile(file: string): Promise<{ documentation: string; exists: boolean }> {
    const uri = Uri.file(`${this.baseDir}/${file}`)
    try {
      await this.statFunction(uri)
      return { documentation: file, exists: true }
    } catch {
      return { documentation: file, exists: false }
    }
  }
}
