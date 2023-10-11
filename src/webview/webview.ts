import * as vscode from 'vscode'
import { Documentation } from '../association.manager'
import markdownItAnchor from 'markdown-it-anchor'
import markdownIt = require('markdown-it')
import cssStyles from './webviewStyle'

export function webView(file: Documentation) {
  //create and show panel and show window on the right
  const panel = vscode.window.createWebviewPanel(file.type, file.name, vscode.ViewColumn.Two, {
    enableScripts: true,
  })

  const md = markdownIt({ html: true }).use(markdownItAnchor)

  panel.webview.html =
    file.type === '.html'
      ? file.content
      : `
  <!DOCTYPE html>
  <html lang="en">
  <head>
  <style>
  ${cssStyles}
  </style>
  </head>
  <body>
    <div>
      ${md.render(file.content)}
    </div>
  </body>
  <script>
</script>
  </html>
`
}
