import * as vscode from 'vscode'
import { createWebView } from '../webview/createWebView'
import { getLocalDoc } from '../provider/local/local.documentation'
import { getGithubDoc } from '../provider/remote/github/github.documentation'

const url = process.env.API_URL || 'https://api.github.com/repos/jeremyschiap/test-repo/readme'
export async function openDoc(pathFile?: string) {
  if (pathFile) {
    const file = await getLocalDoc(url)
    return file
  }
  try {
    const file = await getGithubDoc(url)
    createWebView(file)
    return file
  } catch (error) {
    vscode.window.showErrorMessage("Une erreur s'est produite")
  }
}
