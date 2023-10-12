import { ExtensionContext } from 'vscode'
import { CredentialManager } from '../utils/credentials.utils'
import { Command } from './command.registry'

export class GithubTokenCommand implements Command {
  private credentialManager: CredentialManager

  constructor(context: ExtensionContext) {
    this.credentialManager = new CredentialManager(context.secrets)
  }

  async execute() {
    await this.credentialManager.openTokenInputBox('github')
  }
}
