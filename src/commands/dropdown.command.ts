import { AssociationsManager, Documentation } from '../association.manager'
import { FileSystemManager } from '../utils/fileSystem.utils'
import { WorkspaceManager } from '../utils/workspace.utils'
import { webView } from '../webview/webview'
import { Command } from './command.registry'
import { window } from 'vscode'

export class DropdownCommand implements Command {
  private documentations: Documentation[]
  private fileSystem: FileSystemManager
  private jsonConfig: string

  constructor(documentations: Documentation[], fileSystem: FileSystemManager, jsonConfig: string) {
    this.documentations = documentations
    this.fileSystem = fileSystem
    this.jsonConfig = jsonConfig
  }

  async execute() {
    const currentUserPath = WorkspaceManager.getCurrentUserPath()
    if (!currentUserPath) return

    const manager = new AssociationsManager()

    const filteredDocumentations = await manager.associate(
      this.documentations,
      this.fileSystem.processFileContent(this.jsonConfig),
      currentUserPath
    )

    const selectedDoc = await window.showQuickPick(
      filteredDocumentations.map((doc) => {
        return { label: doc.name, content: doc.content, path: doc.path, type: doc.type }
      })
    )
    if (selectedDoc) {
      webView({
        name: selectedDoc.label,
        content: selectedDoc.content,
        path: selectedDoc.path,
        type: selectedDoc.type,
      })
    }
  }
}
