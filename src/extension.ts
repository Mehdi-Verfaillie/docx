import * as vscode from 'vscode'
import { webView } from './webview/webview'
import { WorkspaceManager } from './utils/workspace.utils'
import { FileSystemManager } from './utils/fileSystem.utils'
import { AssociationsManager } from './association.manager'
import { ErrorManager } from './utils/error.utils'
import { SchemaManager } from './config/schema.manager'
import { RepositoryController } from './api/repository.controller'
import { RepositoryProviderStrategy, LocalProviderStrategy } from './api/repository.strategy'
import * as MarkdownIt from 'markdown-it'
import { CredentialManager } from './utils/credentials.utils'

export async function activate(context: vscode.ExtensionContext) {
  const credentialManager = new CredentialManager(context.secrets)
  let tokens = await credentialManager.getTokens()

  credentialManager.onTokenChange(async () => {
    tokens = await credentialManager.getTokens()
  })

  ErrorManager.initialize()
  SchemaManager.initialize(
    '/.docx.json',
    'https://raw.githubusercontent.com/Mehdi-Verfaillie/docx/main/src/config/.docx.schema.json'
  )
  const fileSystem = new FileSystemManager()
  const workspaceFolder = WorkspaceManager.getWorkspaceFolder()
  const providerStrategies = [new LocalProviderStrategy(), new RepositoryProviderStrategy()]
  const jsonConfig = await fileSystem.readFile(`${workspaceFolder}/.docx.json`)
  const repositoryController = await RepositoryController.create(
    jsonConfig,
    providerStrategies,
    tokens
  )
  const documentations = await repositoryController.getDocumentations()

  const disposable = vscode.commands.registerCommand('extension.openDropdown', async () => {
    const currentUserPath = WorkspaceManager.getCurrentUserPath()
    if (!currentUserPath) return

    const manager = new AssociationsManager()

    const filteredDocumentations = await manager.associate(
      documentations,
      fileSystem.processFileContent(jsonConfig),
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
          // Créez une instance de markdown-it
          const md = new MarkdownIt()
          const htmlContent = md.render(selectedDoc.content)

          webView({
            name: selectedDoc.label,
            content: htmlContent,
            path: selectedDoc.path,
            type: selectedDoc.type,
          })
        }
      })
  })

  const commandGithubAddToken = vscode.commands.registerCommand(
    'Docx Github Add Token',
    async () => await credentialManager.openTokenInputBox('github')
  )

  const commandGitlabAddToken = vscode.commands.registerCommand(
    'Docx Gitlab Add Token',
    async () => await credentialManager.openTokenInputBox('gitlab')
  )

  context.subscriptions.push(commandGithubAddToken)
  context.subscriptions.push(commandGitlabAddToken)
  context.subscriptions.push(disposable)
}
export function deactivate() {}
