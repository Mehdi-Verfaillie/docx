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
      /* Votre CSS personnalisé peut être ajouté ici pour le rendu Markdown. */
    </style>
  </head>
  <body>
    ${file.content}
    <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />
  </body>
  </html>
`
}
