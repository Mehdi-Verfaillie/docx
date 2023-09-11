import { Uri, workspace, FileSystemError } from 'vscode'

export class FileManager {
  private fs: typeof workspace.fs

  constructor(fs: typeof workspace.fs = workspace.fs) {
    this.fs = fs
  }

  public async ensureFileExists(uri: Uri): Promise<boolean> {
    try {
      await this.fs.stat(uri)
      return true
    } catch (error) {
      if (error instanceof Error && error?.message === 'File not found') {
        return false
      }
      throw FileSystemError.FileNotFound(uri)
    }
  }

  public async getFileContent(filePath: string): Promise<string> {
    try {
      const fileUint8Array = await this.fs.readFile(Uri.file(filePath))
      return new TextDecoder().decode(fileUint8Array)
    } catch (error) {
      throw new Error(`Failed to read file content: ${filePath}`)
    }
  }

  public processFileContent<T>(fileContent: string): T {
    return JSON.parse(fileContent) as T
  }
}
