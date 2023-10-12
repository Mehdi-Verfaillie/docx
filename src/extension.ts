import * as vscode from 'vscode'
import { WorkspaceManager } from './utils/workspace.utils'
import { FileSystemManager } from './utils/fileSystem.utils'
import { Documentation } from './association.manager'
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

  // --------------------------------------------------------------

  const extensionManager = new ExtensionManager(context, documentations, jsonConfig)
  extensionManager.registerCommands(context)
}
export function deactivate() {}
