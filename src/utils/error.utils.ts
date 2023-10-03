import { OutputChannel, window } from 'vscode'
import { DuplicateEntityError, MissingEntityError } from '../association.validator'

export class ErrorManager {
  private static outputChannel: OutputChannel

  public static initialize() {
    this.outputChannel = window.createOutputChannel('Docx Etx Errors')
  }

  public static outputError(message: string | (MissingEntityError | DuplicateEntityError)[]) {
    if (typeof message === 'string') {
      this.outputChannel.appendLine(`Error: ${message}`)
    } else {
      const formattedErrors = this.formatEntityErrors(message)
      this.outputChannel.appendLine(formattedErrors)
    }
    this.outputChannel.show(true)
  }

  private static formatEntityErrors(errors: (MissingEntityError | DuplicateEntityError)[]): string {
    let formattedErrors = ''
    errors.forEach((error, index) => {
      formattedErrors += `Error ${index + 1}:\n`
      if (error.errorType === 'MISSING') {
        formattedErrors += `  - A required ${error.entityType} was not found at: ${error.entityPath}\n`
      } else if (error.errorType === 'DUPLICATE') {
        formattedErrors += `  - Duplicate ${error.entityType} found at: ${error.entityPath}\n`
        formattedErrors += `    Original Location: ${
          (error as DuplicateEntityError).originalLocation
        }\n`
        formattedErrors += `    Duplicate Location: ${
          (error as DuplicateEntityError).duplicateLocation
        }\n`
      }
      if (error.errorMsg) {
        formattedErrors += `  - Additional Info: ${error.errorMsg}\n`
      }
    })
    formattedErrors += `\nPlease make sure the associations are correct. Refer to the documentation for more information: https://github.com/Mehdi-Verfaillie/docx/blob/main/README.md\n`
    return formattedErrors
  }
}
