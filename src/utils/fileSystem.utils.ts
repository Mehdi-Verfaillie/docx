import { minimatch } from 'minimatch'
import { Uri, workspace, FileSystemError, FileSystem, FileType } from 'vscode'

const extensionsOfInterest = ['.md', '.bpmn'] as const
export type Extension = (typeof extensionsOfInterest)[number]

export class FileSystemManager {
  private ignorePatterns: string[] = []

  constructor(
    private fs: FileSystem = workspace.fs,
    ignorePatterns?: string[]
  ) {
    this.fs = fs
    if (ignorePatterns && ignorePatterns.length) this.ignorePatterns = ignorePatterns
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

  public async readFile(filePath: string): Promise<string> {
    try {
      const fileUint8Array = await this.fs.readFile(Uri.file(filePath))
      return new TextDecoder().decode(fileUint8Array)
    } catch (error) {
      throw new Error(`Failed to read file content: ${filePath}`)
    }
  }

  public async readDirectory(directoryPath: string): Promise<[string, FileType][]> {
    if (this.matchesIgnorePattern(directoryPath)) return []

    try {
      return await this.fs.readDirectory(Uri.file(directoryPath))
    } catch (error) {
      return []
    }
  }

  public processFileContent<T>(fileContent: string): T {
    return JSON.parse(fileContent) as T
  }

  public getExtension(filename: string): Extension | undefined {
    const ext = '.' + filename.split('.').pop()?.toLowerCase()
    return extensionsOfInterest.includes(ext as Extension) ? (ext as Extension) : undefined
  }

  public isFileOfInterest(filename: string): boolean {
    return !!this.getExtension(filename)
  }

  private matchesIgnorePattern(directoryPath: string): boolean {
    return this.ignorePatterns.some((pattern) => minimatch(directoryPath, pattern))
  }
}
