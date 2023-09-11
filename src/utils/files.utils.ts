import { Uri, workspace, FileSystemError } from 'vscode'

export class FileManager {
  private fs: typeof workspace.fs

  constructor(fs: typeof workspace.fs = workspace.fs) {
    this.fs = fs
  }

  public async ensureFileExists(filePath: string): Promise<boolean> {
    try {
      await this.fs.stat(Uri.file(filePath))
      return true
    } catch (error) {
      if (error instanceof Error && error?.message === 'File not found') {
        return false
      }
      throw FileSystemError.FileNotFound(filePath)
    }
  }
}
