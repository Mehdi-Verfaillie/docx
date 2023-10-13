import { ExtensionContext, workspace } from 'vscode'
import { WorkspaceManager } from './utils/workspace.utils'
import { FileSystemManager } from './utils/fileSystem.utils'
import { ErrorManager } from './utils/error.utils'
import { SchemaManager } from './config/schema.manager'
import { RepositoryController } from './api/repository.controller'
import { CredentialManager } from './utils/credentials.utils'
import { ExtensionManager } from './extension.manager'
import { DataStore } from './data.store'

export async function activate(context: ExtensionContext) {
  const configFilename = '.docx.json'
  const fileSystem = new FileSystemManager()
  const workspaceFolder = WorkspaceManager.getWorkspaceFolder()

  const credentialManager = new CredentialManager(context.secrets)
  const configFileObserver = workspace.createFileSystemWatcher(
    `${workspaceFolder}/${configFilename}`
  )

  ErrorManager.initialize()
  SchemaManager.initialize(
    `/${configFilename}`,
    'https://raw.githubusercontent.com/Mehdi-Verfaillie/docx/main/src/config/.docx.schema.json'
  )

  const dataStore = DataStore.getInstance()

  let tokens = await credentialManager.getTokens()

  const refreshDocumentations = async (): Promise<void> => {
    try {
      const jsonConfig = await fileSystem.readFile(`${workspaceFolder}/${configFilename}`)
      dataStore.jsonConfig = jsonConfig

      const repositoryController = await RepositoryController.create(dataStore.jsonConfig, tokens)

      const documentations = await repositoryController.getDocumentations()
      dataStore.documentations = documentations
    } catch (error) {
      /** empty */
    }
  }

  /** Initial fetch */
  await refreshDocumentations()

  configFileObserver.onDidChange(async () => {
    await refreshDocumentations()
  })

  credentialManager.onTokenChange(async () => {
    tokens = await credentialManager.getTokens()
    await refreshDocumentations()
  })

  new ExtensionManager(context).registerCommands(context)
}
export function deactivate() {}
