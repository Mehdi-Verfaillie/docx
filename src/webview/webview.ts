import * as vscode from 'vscode'
import { Documentation } from '../association.manager'
import markdownItAnchor from 'markdown-it-anchor'
import markdownIt = require('markdown-it')
import path = require('path')
import { createBpmnWebview } from './_bpmn_webview'

export function webView(file: Documentation) {
  const panel = vscode.window.createWebviewPanel(file.type, file.name, vscode.ViewColumn.Two, {
    enableScripts: true,
    localResourceRoots: [vscode.Uri.file(path.join(__dirname, '../../'))],
  })

  const md = markdownIt({ html: true }).use(markdownItAnchor)

  panel.webview.html =
    file.type === '.html'
      ? file.content
      : file.type === '.bpmn'
      ? createBpmnWebview(panel, file)
      : `
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
