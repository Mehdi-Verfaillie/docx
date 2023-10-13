import { AssociationsManager } from '../association.manager'
import { DataStore } from '../data.store'
import { FileSystemManager } from '../utils/fileSystem.utils'
import { WorkspaceManager } from '../utils/workspace.utils'
import { webView } from '../webview/webview'
import { Command } from './command.registry'
import { window } from 'vscode'

export class DropdownCommand implements Command {
  private dataStore: DataStore

  constructor(private fileSystem: FileSystemManager) {
    this.dataStore = DataStore.getInstance()
    this.fileSystem = fileSystem
  }

  async execute() {
    const currentUserPath = WorkspaceManager.getCurrentUserPath()
    if (!currentUserPath) return

    const manager = new AssociationsManager()
    const filteredDocumentations = await manager.associate(
      this.dataStore.documentations,
      this.fileSystem.processFileContent(this.dataStore.jsonConfig),
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
