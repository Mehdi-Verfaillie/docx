import * as vscode from 'vscode'

export function createWebView(file: string) {
  const panel = vscode.window.createWebviewPanel(
    'markdownPreview',
    'Aperçu du README',
    vscode.ViewColumn.One,
    {}
  )

  panel.webview.html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Markdown Preview</title>
    </head>
    <body>
    <pre>${file}</pre>
    </body>
    </html>
  `
}
