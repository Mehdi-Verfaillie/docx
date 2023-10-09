import { Documentation } from '../association.manager'
import { WorkspaceManager } from '../utils/workspace.utils'
import { FileSystemManager } from '../utils/fileSystem.utils'
import { Uri, FileType, workspace } from 'vscode'
import { AbstractRepositoryFactory } from '../api/repository.factory'

export class LocalProvider implements AbstractRepositoryFactory {
  constructor(private fileSystem: FileSystemManager) {
    this.fileSystem = fileSystem
  }

  public async getDocumentations(): Promise<Documentation[]> {
    const directoryPath = WorkspaceManager.getWorkspaceFolderUri()
    return await this.fetchDocumentation(directoryPath)
  }

  public async fetchDocumentation(directoryUri: Uri): Promise<Documentation[]> {
    const entries = (await this.fileSystem.retrieveNonIgnoredEntries(directoryUri.fsPath)) ?? []
    let documentation: Documentation[] = []

    for (const [filename, fileType] of entries) {
      const filePath = Uri.joinPath(directoryUri, filename)

      if (fileType === FileType.Directory) {
        const nestedDocs = await this.fetchDocumentation(filePath)
        documentation = documentation.concat(nestedDocs)
      } else if (this.fileSystem.isFileOfInterest(filename)) {
        const content = await this.fileSystem.readFile(filePath.fsPath)
        documentation.push({
          name: filename,
          path: workspace.asRelativePath(filePath.path),
          type: this.fileSystem.getExtension(filename)!,
          content: content,
        })
      }
    }

    return documentation
  }
}
