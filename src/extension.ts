import * as vscode from 'vscode'
import { webView } from './webview/webview'
import { WorkspaceManager } from './utils/workspace.utils'
import { RepositoryFactory } from './api/repository.factory'
import { FileSystemManager } from './utils/fileSystem.utils'
import { AssociationsManager } from './association.manager'
import { ErrorManager } from './utils/error.utils'
import { SchemaManager } from './config/schema.manager'

export async function activate(context: vscode.ExtensionContext) {
  ErrorManager.initialize()
  SchemaManager.initialize(
    '/.docx.json',
    'https://raw.githubusercontent.com/Mehdi-Verfaillie/docx/main/src/config/.docx.schema.json'
  )

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
      .showQuickPick(
        filteredDocumentations.map((doc) => {
          return {
            label: doc.name,
            content: doc.content,
            path: doc.path,
            type: doc.type,
          }
        })
      )
      .then((selectedDoc) => {
        if (selectedDoc) {
          webView({
            name: selectedDoc.label,
            content: selectedDoc.content,
            path: selectedDoc.path,
            type: selectedDoc.type,
          })
        }
      })
  })

  context.subscriptions.push(disposable)
}
export function deactivate() {}
