import { Documentation } from '../association.manager'
import { WorkspaceManager } from '../utils/workspace.utils'
import { FileSystemManager } from '../utils/fileSystem.utils'

export interface ErrorHandler {
  code: string
  message: string
}

export class LocalProvider {
  constructor() {}

  public async getDocumentations(): Promise<Documentation[]> {
    const fileSystemManager = new FileSystemManager()
    const directoryPath = WorkspaceManager.getWorkspaceFolderUri()
    return await fileSystemManager.fetchDocumentation(directoryPath)
  }
}
