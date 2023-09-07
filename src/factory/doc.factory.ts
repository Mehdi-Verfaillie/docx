import { UrlRequest } from '../interface/url.request.interface'
import { getLocalDoc } from '../provider/local/local.documentation'
import * as vscode from 'vscode'

class DocumentFactory {
  async getDoc(urlData: URLData): Promise<string | vscode.TextDocument> {
    try {
      if (urlData.type === 'local') {
        const doc = await getLocalDoc(urlData.url)
        vscode.window.showTextDocument(doc)
      }
      return ''
    } catch (error: unknown) {
      vscode.window.showErrorMessage(`Impossible d'ouvrir le document : ${error}`)
      return 'error'
    }
  }
}

export default DocumentFactory
