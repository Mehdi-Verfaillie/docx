import { window, Uri, workspace } from 'vscode'

export class WorkspaceManager {
  static getCurrentUserPath(): Uri | undefined {
    return window.activeTextEditor?.document.uri
  }

  static getWorkspaceFolder(): string {
    const workspaceFolders = workspace.workspaceFolders
    if (!workspaceFolders) {
      window.showErrorMessage("Aucun dossier n'est ouvert dans VSCode.")
      return 'FileNotFound'
    } else {
      return workspaceFolders[0].uri.fsPath
    }
  }
}
