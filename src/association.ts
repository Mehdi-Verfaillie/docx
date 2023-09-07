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
}
