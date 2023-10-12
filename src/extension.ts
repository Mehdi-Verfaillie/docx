import * as vscode from 'vscode'
import { webView } from './webview/webview'
import { WorkspaceManager } from './utils/workspace.utils'
import { FileSystemManager } from './utils/fileSystem.utils'
import { AssociationsManager, Documentation } from './association.manager'
import { ErrorManager } from './utils/error.utils'
import { SchemaManager } from './config/schema.manager'
import { RepositoryController } from './api/repository.controller'
import {
  RepositoryProviderStrategy,
  LocalProviderStrategy,
  WebProviderStrategy,
} from './api/repository.strategy'
import { CredentialManager } from './utils/credentials.utils'
import { ExtensionManager } from './extension.manager'

export async function activate(context: vscode.ExtensionContext) {
  const configFilename = '.docx.json'
  const fileSystem = new FileSystemManager()
  const workspaceFolder = WorkspaceManager.getWorkspaceFolder()
  const providerStrategies = [
    new LocalProviderStrategy(),
    new RepositoryProviderStrategy(),
    new WebProviderStrategy(),
  ]
  const credentialManager = new CredentialManager(context.secrets)
  const configFileObserver = vscode.workspace.createFileSystemWatcher(
    `${workspaceFolder}/${configFilename}`
  )
  ErrorManager.initialize()
  SchemaManager.initialize(
    `/${configFilename}`,
    'https://raw.githubusercontent.com/Mehdi-Verfaillie/docx/main/src/config/.docx.schema.json'
  )

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

  let tokens = await credentialManager.getTokens()
  let [jsonConfig, documentations] = await refreshDocumentations()

  configFileObserver.onDidChange(async () => {
    ;[jsonConfig, documentations] = await refreshDocumentations()
  })

  credentialManager.onTokenChange(async () => {
    tokens = await credentialManager.getTokens()
    ;[jsonConfig, documentations] = await refreshDocumentations()
  })

  const commandOpenDropdown = vscode.commands.registerCommand('docx.openDropdown', async () => {
    const currentUserPath = WorkspaceManager.getCurrentUserPath()
    if (!currentUserPath) return

    const manager = new AssociationsManager()

    const filteredDocumentations = await manager.associate(
      documentations,
      fileSystem.processFileContent(jsonConfig),
      currentUserPath
    )

    const selectedDoc = await vscode.window.showQuickPick(
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
  })

  for (const provider of ['Github', 'Gitlab']) {
    const providerLowerCase: 'github' | 'gitlab' = provider.toLowerCase() as 'github' | 'gitlab'

    const commandAdd = vscode.commands.registerCommand(`docx.add${provider}Token`, async () => {
      await credentialManager.openTokenInputBox(providerLowerCase)
    })
    const commandDelete = vscode.commands.registerCommand(`docx.delete${provider}Token`, () => {
      credentialManager.deleteTokenAndNotify(providerLowerCase)
    })

    context.subscriptions.push(commandAdd)
    context.subscriptions.push(commandDelete)
  }

  context.subscriptions.push(commandOpenDropdown)

  // --------------------------------------------------------------

  const extensionManager = new ExtensionManager()
  extensionManager.registerCommands(context)
}
export function deactivate() {}
