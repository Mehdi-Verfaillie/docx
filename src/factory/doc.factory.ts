import { URLData } from '../interface/url.data.interface'
import { getLocalDoc } from '../provider/local/local.documentation'
import { getGithubDoc } from '../provider/remote/github/github.documentation'
import * as vscode from 'vscode'
import { createWebView } from '../webview/createWebView'

class DocumentFactory {
  async getDoc(urlData: URLData): Promise<string | vscode.TextDocument> {
    try {
      if (urlData.type === 'local') {
        const doc = await getLocalDoc(urlData.url)
        vscode.window.showTextDocument(doc)
      }
      if (urlData.type === 'remote') {
        const file = await getGithubDoc(urlData.url)
        createWebView(file)
      }
      return ''
    } catch (error: unknown) {
      vscode.window.showErrorMessage(`Impossible d'ouvrir le document : ${error}`)
      return 'error'
    }
  }
}

export default DocumentFactory
