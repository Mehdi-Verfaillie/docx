import * as vscode from 'vscode'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { openFiles } from './feature/openFiles'

dotenv.config({ path: path.join(__dirname, '..', '.env') })

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('my-plugin.openFile', () => {
    const path = process.env.MY_PATH + '/readme.md'
    openFiles(path)
  })

  context.subscriptions.push(disposable)
}

export function deactivate() {}
