import * as vscode from 'vscode'
import { Documentation } from '../association.manager'

export function webView(file: Documentation) {
  const panel = vscode.window.createWebviewPanel(file.type, file.name, vscode.ViewColumn.One, {})

  panel.webview.html = `
    <pre>${file.content}</pre>
   
  `
}
