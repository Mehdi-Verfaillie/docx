import { window } from 'vscode'

export interface Notifier {
  notifySuccess(message: string): void
  notifyError(message: string): void
}

export class VsCodeNotifier implements Notifier {
  notifySuccess(message: string): void {
    window.showInformationMessage(message)
  }

  notifyError(message: string): void {
    window.showErrorMessage(message)
  }
}
