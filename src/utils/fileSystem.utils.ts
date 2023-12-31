import { minimatch } from 'minimatch'
import { Uri, workspace, FileSystemError, FileSystem, FileType } from 'vscode'
import { ErrorManager } from './error.utils'

const extensionsOfInterest = ['.md', '.bpmn', '.html'] as const
export type Extension = (typeof extensionsOfInterest)[number]

export class FileSystemManager {
  public ignorePatterns: string[] = ['.git']

  constructor(
    private fs: FileSystem = workspace.fs,
    gitignoreFilePath?: string
  ) {
    this.fs = fs
    if (gitignoreFilePath) this.loadGitignorePatterns(gitignoreFilePath)
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

  public async retrieveNonIgnoredEntries(directoryPath: string): Promise<[string, FileType][]> {
    const directoryEntries = await this.getDirectoryEntries(directoryPath)
    return directoryEntries.filter(this.filterOutIgnoredDirectories(directoryPath))
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

  public async writeFile(filePath: string, content: string | Buffer): Promise<void> {
    try {
      const uri = Uri.file(filePath)
      const contentBuffer = typeof content === 'string' ? Buffer.from(content) : content
      await this.fs.writeFile(uri, contentBuffer)
    } catch (error) {
      ErrorManager.outputError(`Failed to write to file: ${filePath}. ${error}`)
    }
  }

  private filterOutIgnoredDirectories(directoryPath: string) {
    return ([entryName, entryType]: [string, FileType]): boolean => {
      if (entryType === FileType.Directory) {
        const fullPath = this.buildFullPath(directoryPath, entryName)
        return !this.isEntryIgnored(fullPath, entryName)
      }
      return true
    }
  }

  private async getDirectoryEntries(directoryPath: string): Promise<[string, FileType][]> {
    try {
      return await this.fs.readDirectory(Uri.file(directoryPath))
    } catch (error) {
      ErrorManager.outputError(
        `Something went wrong when trying to read local directories ${error}`
      )
      return []
    }
  }

  private buildFullPath(directoryPath: string, entryName: string): string {
    return Uri.file(directoryPath).with({
      path: Uri.file(directoryPath).path + '/' + entryName,
    }).fsPath
  }

  private isEntryIgnored(fullPath: string, entryName: string): boolean {
    return this.ignorePatterns.some((pattern) =>
      this.isPatternMatching(pattern, fullPath, entryName)
    )
  }

  private isPatternMatching(pattern: string, fullPath: string, entryName: string): boolean {
    const isRootLevel = pattern.startsWith('/')
    const normalizedPattern = this.normalizePattern(pattern)
    const matchFullPath = isRootLevel
      ? fullPath.startsWith(normalizedPattern)
      : fullPath.includes(normalizedPattern)
    const matchEntryName =
      minimatch(entryName, normalizedPattern) || minimatch(fullPath, normalizedPattern)
    return matchEntryName || matchFullPath
  }

  private normalizePattern(pattern: string): string {
    return pattern.replace(/^\//, '') // Remove leading slash
  }

  private async loadGitignorePatterns(gitignoreFilePath: string) {
    try {
      const fileContent = await this.readFile(gitignoreFilePath)
      const gitignorePatterns = fileContent
        .split('\n')
        .filter((pattern) => pattern && !pattern.startsWith('#'))
      this.ignorePatterns = [...this.ignorePatterns, ...gitignorePatterns]
    } catch (error) {
      /* empty */
    }
  }
}
