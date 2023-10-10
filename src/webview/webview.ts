import * as vscode from 'vscode'
import { Documentation } from '../association.manager'
import markdownItAnchor from 'markdown-it-anchor'
import markdownIt = require('markdown-it')

export function webView(file: Documentation) {
  //create and show panel and show window on the right
  const panel = vscode.window.createWebviewPanel(file.type, file.name, vscode.ViewColumn.Two)

  const md = markdownIt({ html: true }).use(markdownItAnchor)
  //add sets its HTML shows like md preview
  panel.webview.html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
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
