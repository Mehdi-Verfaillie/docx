import * as vscode from 'vscode'
import { Documentation } from '../association.manager'
import { WebviewUtils } from '../utils/webview.utils'

export function webView(file: Documentation) {
  const panel = vscode.window.createWebviewPanel(file.type, file.name, vscode.ViewColumn.One, {})
  const webviewUtils = new WebviewUtils()

  const htmlContent = webviewUtils.readImage(file.content)

  panel.webview.html = `
    <pre>${htmlContent}</pre>
   
  `
}
