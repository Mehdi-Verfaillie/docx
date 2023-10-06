import * as vscode from 'vscode'
import { Documentation } from '../association.manager'

export function webView(file: Documentation) {
  //create and show panel and show window on the right
  const panel = vscode.window.createWebviewPanel(file.type, file.name, vscode.ViewColumn.Two, {})

  //add sets its HTML shows like md preview
  panel.webview.html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Markdown Preview</title>
    <style>
    </style>
  </head>
  <body>
    ${file.content}
  </body>
  </html>
`
}
