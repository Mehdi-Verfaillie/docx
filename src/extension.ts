import * as vscode from 'vscode'
import { webView } from './webview/webview'
import { WorkspaceManager } from './utils/workspace.utils'
import { RepositoryFactory } from './api/repository.factory'
import { FileSystemManager } from './utils/fileSystem.utils'
import { AssociationsManager } from './association.manager'

export async function activate(context: vscode.ExtensionContext) {
  const fileSystem = new FileSystemManager()

  const repository = new RepositoryFactory([{ type: 'local' }])
  const documentations = await repository.getDocumentations()

  const workspaceFolder = WorkspaceManager.getWorkspaceFolder()

  const disposable = vscode.commands.registerCommand('extension.openDropdown', async () => {
    const currentUserPath = WorkspaceManager.getCurrentUserPath()
    if (!currentUserPath) return

    const manager = new AssociationsManager(workspaceFolder, fileSystem)
    const jsonConfig = await fileSystem.readFile(`${workspaceFolder}/.docx.json`)

    const filteredDocumentations = await manager.associate(
      documentations,
      jsonConfig,
      currentUserPath
    )

    vscode.window
      .showQuickPick(filteredDocumentations.map((documentation) => documentation.name))
      .then((selectedOption) => {
        if (selectedOption) {
          const selectedDoc = documentations.find((doc) => doc.name === selectedOption)

          webView({
            name: selectedDoc?.content ?? '',
            content: selectedDoc?.content ?? '',
            type: selectedDoc?.type ?? '.md',
          })
        }
      })
  })

  context.subscriptions.push(disposable)
}
export function deactivate() {}
