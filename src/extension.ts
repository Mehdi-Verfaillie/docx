// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import * as path from 'path'
// import DocumentFactory from './factory/doc.factory'
import { LocalProvider } from './provider/local.provider'
import { createWebView } from './createWebView/createWebView'
import { GithubProvider } from './provider/github.provider'

export async function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('my-plugin.openFile', async () => {
    const url = path.join(__dirname, '../', 'README.md')
    const url2 = 'https://api.github.com/repos/jeremyschiap/test-repo/contents/README.md'

    const localProvider = new LocalProvider(url)
    const githubProvider = new GithubProvider(url2)

    const doc = await localProvider.getDocumentString()
    const doc2 = await githubProvider.getDocumentString()

    createWebView(doc)
    createWebView(doc2)
  })

  context.subscriptions.push(disposable)
}

// This method is called when your extension is deactivated
export function deactivate() {}
