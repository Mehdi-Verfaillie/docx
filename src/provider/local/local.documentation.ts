import * as vscode from 'vscode'

export async function getLocalDoc(path: string): Promise<vscode.TextDocument> {
  const data = await vscode.workspace.openTextDocument(path)
  return data
}
