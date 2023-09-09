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

export function createWebViewPDF(file: string) {
  const panel = vscode.window.createWebviewPanel(
    'pdfPreview',
    'Aperçu du PDF',
    vscode.ViewColumn.One,
    {}
  )

  panel.webview.html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>PDF Preview</title>
        </head>
        
        <body>
            <h1>Exemple PDF avec iframe</h1>
          <iframe src="./test_pdf.pdf" width="100%" height="500px"> </iframe>
        </body>
        </html>
    `
}
