import { window, Uri } from 'vscode'

export class WorkspaceManager {
  static getCurrentUserPath(): Uri | undefined {
    return window.activeTextEditor?.document.uri
  }
}
