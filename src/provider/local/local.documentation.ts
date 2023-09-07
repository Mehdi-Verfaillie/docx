import * as vscode from 'vscode'

export async function getLocalDoc(path: string): Promise<string> {
  const doc = await vscode.workspace.openTextDocument(path)
  await vscode.window.showTextDocument(doc)
  return doc.getText()
}
