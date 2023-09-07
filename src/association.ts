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

  private async checkDirectory(directory: string): Promise<{ directory: string; exists: boolean }> {
    const uri = Uri.file(`${this.baseDir}/${directory}`)
    try {
      await this.statFunction(uri)
      return { directory, exists: true }
    } catch {
      return { directory, exists: false }
    }
  }
}
