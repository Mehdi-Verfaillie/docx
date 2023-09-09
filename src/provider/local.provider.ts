import { Documentation } from '../association.manager'
import { WorkspaceManager } from '../utils/workspace.utils'
import { FileManager } from '../utils/files.utils'

export interface ErrorHandler {
  code: string
  message: string
}

export class LocalProvider {
  constructor() {}

  public async getDocumentations(): Promise<Documentation[]> {
    const fileManager = new FileManager()
    const directoryPath = WorkspaceManager.getWorkspaceFolder()

    const projectDirectory = directoryPath
    const projectStructure = fileManager.mapStructure(projectDirectory)

    const filter = fileManager.filterMarkdownFiles(projectStructure)

    return filter
  }
}
