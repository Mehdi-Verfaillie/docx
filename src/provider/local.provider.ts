import { Documentation } from '../association.manager'
import { WorkspaceManager } from '../utils/workspace.utils'
import { FileSystemManager } from '../utils/fileSystem.utils'
import { Uri } from 'vscode'
import { log } from 'console'

export interface ErrorHandler {
  code: string
  message: string
}

export class LocalProvider {
  constructor(private fileSystem: FileSystemManager) {
    this.fileSystem = fileSystem
  }

  public async getDocumentations(): Promise<Documentation[]> {
    const directoryPath = WorkspaceManager.getWorkspaceFolderUri()
    return await this.fetchDocumentation(directoryPath)
  }

  public async fetchDocumentation(directoryUri: Uri): Promise<Documentation[]> {
    const allFiles = (await this.fileSystem.readDirectory(directoryUri.fsPath)) ?? []
    const documentationFiles = allFiles.filter(([filename]) =>
      this.fileSystem.isFileOfInterest(filename)
    )

    const documentationPromises = documentationFiles.map(async ([filename]) => {
      const filePath = Uri.joinPath(directoryUri, filename)
      const content = await this.fileSystem.readFile(filePath.fsPath)
      return {
        name: filename,
        type: this.fileSystem.getExtension(filename)!,
        content: content,
      }
    })

    return Promise.all(documentationPromises)
  }
}
