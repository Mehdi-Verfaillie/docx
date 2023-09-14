import * as vscode from 'vscode'
import { WorkspaceManager } from './utils/workspace.utils'
import { RepositoryFactory } from './api/repository.factory'
import * as path from 'path'
import { AssociationsManager } from './association.manager'
import { FileSystemManager } from './utils/fileSystem.utils'

//activation de l'extension
export function activate(context: vscode.ExtensionContext) {
  // Créer le dropdown
  const disposable = vscode.commands.registerCommand('extension.openDropdown', async () => {
    const currentPath = WorkspaceManager.getCurrentUserPath()
    // currentPath ne renvoit pas tous les le path relative obligé de rajouté la ligne en dessous
    let relativePath = vscode.workspace.asRelativePath(currentPath, false)
    /////

    const repo = new RepositoryFactory([{ type: 'local' }])
    const docs = await repo.getDocumentations()
    const workspaceFolder = vscode.workspace.workspaceFolders[0]
    if (!workspaceFolder) return
    const rootPath = workspaceFolder.uri.fsPath
    const jsonFilePath = path.join(rootPath, 'docx.json')

    // une fonction pour avoir la route du projet ?

    const file = new FileSystemManager()
    const json = await file.readFile(jsonFilePath)
    const baseDir = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath ?? ''
    const fileSystem = new FileSystemManager()
    const asso = new AssociationsManager(baseDir, fileSystem)
    const assos = await asso.associate(docs, json, relativePath)

    ////////

    const docNames = assos.map((doc) => doc.name)
    vscode.window.showQuickPick(docNames).then((selectedOption) => {
      if (selectedOption) {
        const selectedDoc = docs.find((doc) => doc.name === selectedOption)
        if (selectedDoc) {
          vscode.window.showInformationMessage(
            `Option sélectionnée : ${selectedOption}, Info de la documentation : ${selectedDoc}`
          )
        }
      }
    })
  })

  context.subscriptions.push(disposable)
}
export function deactivate() {}
