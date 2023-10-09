import * as vscode from 'vscode'
import { webView } from './webview/webview'
import { WorkspaceManager } from './utils/workspace.utils'
import { FileSystemManager } from './utils/fileSystem.utils'
import { AssociationsManager, Documentation } from './association.manager'
import { ErrorManager } from './utils/error.utils'
import { SchemaManager } from './config/schema.manager'
import { RepositoryController } from './api/repository.controller'
import { RepositoryProviderStrategy, LocalProviderStrategy } from './api/repository.strategy'
import { CredentialManager } from './utils/credentials.utils'

export async function activate(context: vscode.ExtensionContext) {
  const configFilename = '.docx.json'
  const credentialManager = new CredentialManager(context.secrets)
  let tokens = await credentialManager.getTokens()

  ErrorManager.initialize()
  SchemaManager.initialize(
    '/.docx.json',
    'https://raw.githubusercontent.com/Mehdi-Verfaillie/docx/main/src/config/.docx.schema.json'
  )

  const fileSystem = new FileSystemManager()
  const workspaceFolder = WorkspaceManager.getWorkspaceFolder()
  const providerStrategies = [new LocalProviderStrategy(), new RepositoryProviderStrategy()]

  const refreshDocumentations = async (): Promise<[string, Documentation[]]> => {
    const jsonConfig = await fileSystem.readFile(`${workspaceFolder}/${configFilename}`)
    const repositoryController = await RepositoryController.create(
      jsonConfig,
      providerStrategies,
      tokens
    )
    const documentations = await repositoryController.getDocumentations()
    return [jsonConfig, documentations]
  }

  let [jsonConfig, documentations] = await refreshDocumentations()

  const configFileObserver = vscode.workspace.createFileSystemWatcher(
    `${workspaceFolder}/${configFilename}`
  )
  configFileObserver.onDidChange(async () => {
    ;[jsonConfig, documentations] = await refreshDocumentations()
  })

  credentialManager.onTokenChange(async () => {
    tokens = await credentialManager.getTokens()
    ;[jsonConfig, documentations] = await refreshDocumentations()
  })

  const disposable = vscode.commands.registerCommand('docx.openDropdown', async () => {
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
          webView({
            name: selectedDoc.label,
            content: selectedDoc.content,
            path: selectedDoc.path,
            type: selectedDoc.type,
          })
        }
      })
  })

  const commandGithubAddToken = vscode.commands.registerCommand(
    'docx.addGithubToken',
    async () => await credentialManager.openTokenInputBox('github')
  )

  const commandGitlabAddToken = vscode.commands.registerCommand(
    'docx.addGitlabToken',
    async () => await credentialManager.openTokenInputBox('gitlab')
  )

  const commandGithubDeleteToken = vscode.commands.registerCommand('docx.deleteGithubToken', () =>
    credentialManager.deleteTokenAndNotify('github')
  )
  const commandGitlabDeleteToken = vscode.commands.registerCommand('docx.deleteGitlabToken', () =>
    credentialManager.deleteTokenAndNotify('gitlab')
  )

  context.subscriptions.push(commandGithubAddToken)
  context.subscriptions.push(commandGitlabAddToken)
  context.subscriptions.push(commandGithubDeleteToken)
  context.subscriptions.push(commandGitlabDeleteToken)
  context.subscriptions.push(disposable)
}
export function deactivate() {}
