import { Uri, workspace, FileSystemError, FileSystem, FileType } from 'vscode'
import { Documentation } from '../association.manager'
import * as vscode from 'vscode'

const extensionsOfInterest = ['.md', '.bpmn'] as const
export type Extension = (typeof extensionsOfInterest)[number]

export class FileSystemManager {
  constructor(private fs: FileSystem = workspace.fs) {
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

  public async readFile(filePath: string): Promise<string> {
    try {
      const fileUint8Array = await this.fs.readFile(Uri.file(filePath))
      return new TextDecoder().decode(fileUint8Array)
    } catch (error) {
      throw new Error(`Failed to read file content: ${filePath}`)
    }
  }

  public async readDirectory(directoryPath: string): Promise<[string, FileType][]> {
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

  public async fetchDocumentation(directoryUri: vscode.Uri): Promise<Documentation[]> {
    const allFiles = (await this.readDirectory(directoryUri.fsPath)) ?? []
    const documentationFiles = allFiles.filter(([filename]) => this.isFileOfInterest(filename))

    const documentationPromises = documentationFiles.map(async ([filename]) => {
      const filePath = vscode.Uri.joinPath(directoryUri, filename)
      const content = await this.readFile(filePath.fsPath)
      return {
        name: filename,
        type: this.getExtension(filename)!,
        content: content,
      }
    })

    return Promise.all(documentationPromises)
  }
}
