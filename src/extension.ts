import * as vscode from 'vscode'
import { webView } from './webview/webview'

//activation de l'extension
export function activate(context: vscode.ExtensionContext) {
  // Créer le dropdown
  const disposable = vscode.commands.registerCommand('extension.openDropdown', () => {
    //commande invoqué = show dropdown avec les options
    vscode.window
      .showQuickPick(['Option 1', 'Option 2', 'Option 3'])
      //méthode use pour obtenir la valeur user selected, lorsqu'une option est selectionné
      .then((selectedOption) => {
        if (selectedOption) {
          vscode.window.showInformationMessage(`Option sélectionnée : ${selectedOption}`)
          webView(selectedOption)
        }
      })
  })

  //ref collection fourni par API vscode pour stocker toutes les ressources ki doiv resT activ pendant ddv extension et les libere si necessaire
  context.subscriptions.push(disposable)
}
export function deactivate() {}
