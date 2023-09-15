import * as vscode from 'vscode'
import { Documentation } from '../association.manager'

export function webView(file: Documentation) {
  const panel = vscode.window.createWebviewPanel(file.name, file.name, vscode.ViewColumn.One, {})

  if (file.type === '.md')
    panel.webview.html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${file.name}</title>
    </head>
    <body>
    <pre>${file.content}</pre>
    </body>
    </html>
  `
}
