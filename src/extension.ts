import * as vscode from 'vscode'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { openDoc } from './controller/openDoc'

dotenv.config({ path: path.join(__dirname, '..', '.env') })

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('my-plugin.openFile', () => {
    openDoc()
  })

  context.subscriptions.push(disposable)
}

export function deactivate() {}
