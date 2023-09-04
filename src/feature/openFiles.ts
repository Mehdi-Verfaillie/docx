import * as vscode from 'vscode';

export function  openFiles(pathFolder:string) {
  vscode.workspace.openTextDocument(pathFolder)
    .then(doc => {
      vscode.window.showTextDocument(doc);
    })
}