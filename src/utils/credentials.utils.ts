import * as vscode from 'vscode'

export interface Token {
  provider: 'github' | 'gitlab'
  key: string
}

export class CredentialManager {
  private secretStorage: vscode.SecretStorage
  private providers: Token['provider'][]
  constructor(secretStorage: vscode.SecretStorage) {
    this.secretStorage = secretStorage
    this.providers = ['github', 'gitlab']
  }

  public openTokenInputBox = async (provider: Token['provider']) => {
    const inputValue = await vscode.window.showInputBox({
      placeHolder: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Personnal Access Token`,
    })
    if (inputValue) {
      this.saveToken({
        provider,
        key: inputValue,
      })
      vscode.window.showInformationMessage(
        `Docx ${
          provider.charAt(0).toUpperCase() + provider.slice(1)
        } Personnal Access Token has been saved successfully.
        `,
        'Close'
      )
    }
  }

  public deleteTokenAndNotify = async (provider: Token['provider']) => {
    this.deleteToken(provider)
    vscode.window.showInformationMessage(
      `Docx
      ${
        provider.charAt(0).toUpperCase() + provider.slice(1)
      } Personnal Access Token has been deleted successfully.`,
      'Close'
    )
  }

  private saveToken = async (token: Token) => {
    await this.secretStorage.store(token.provider, token.key)
  }

  private getToken = async (provider: Token['provider']): Promise<Token | undefined> => {
    const tokenKey = await this.secretStorage.get(provider)
    if (tokenKey) {
      return {
        provider,
        key: tokenKey,
      }
    }
  }

  public getTokens = async (): Promise<Token[] | undefined> => {
    const tokens: Token[] = []

    for (const provider of this.providers) {
      const token = await this.getToken(provider)
      if (token) tokens.push(token)
    }

    return tokens.length ? tokens : undefined
  }

  private deleteToken = (provider: Token['provider']) => {
    this.secretStorage.delete(provider)
  }

  public onTokenChange = (callback: () => void) => {
    this.secretStorage.onDidChange(() => {
      callback()
    })
  }
}
