import * as vscode from 'vscode'
import * as path from 'path'
import DocumentFactory from './factory/doc.factory'

export async function activate(context: vscode.ExtensionContext) {
  const documentFactory = new DocumentFactory()

  const disposable = vscode.commands.registerCommand('my-plugin.openFile', async () => {
    // const url = path.join(__dirname, '../', 'README.md')
    // await documentFactory.getDoc({ url: url, type: 'local' })

    const url = 'https://api.github.com/repos/jeremyschiap/test-repo/contents/README.md'
    await documentFactory.getDoc({ url: url, type: 'remote' })
    context.subscriptions.push(disposable)
  })
}

export function deactivate() {}
