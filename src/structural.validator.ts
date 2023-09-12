import { MissingEntityError, DocAssociationsConfig, EntityError } from './association.validator'

export interface InvalidEntityError extends EntityError {
  errorType: 'INVALID'
  errorMsg?: string
}

export class StructuralValidator {
  public validateConfigStructure(
    config: DocAssociationsConfig
  ): Array<MissingEntityError | InvalidEntityError> | undefined {
    const associationsTypeErrors: MissingEntityError[] = this.validateAssociationsType(config)

    if (associationsTypeErrors.length > 0) return associationsTypeErrors

    const associationsDirectoriesErrors: MissingEntityError[] =
      this.validateAssociationsDirectories(config)

    const associationsDocsErrors: MissingEntityError[] = this.validateAssociationsDocs(config)
    const reverseSlashErrors: Array<MissingEntityError | InvalidEntityError> =
      this.findReverseSlashInPaths(config)

    const allErrors = [
      ...associationsTypeErrors,
      ...associationsDirectoriesErrors,
      ...associationsDocsErrors,
      ...reverseSlashErrors,
    ]

    return allErrors
  }
  public validateAssociationsType(config: DocAssociationsConfig): MissingEntityError[] {
    const errors: MissingEntityError[] = []

    if (
      !config.associations ||
      typeof config.associations !== 'object' ||
      Array.isArray(config.associations)
    ) {
      errors.push({
        errorType: 'MISSING',
        entityType: 'associationsKey',
        entityPath: '',
      })
    }

    return errors
  }
  public validateAssociationsDirectories(config: DocAssociationsConfig): MissingEntityError[] {
    const errors: MissingEntityError[] = []

    for (const directory of Object.keys(config.associations)) {
      if (typeof directory !== 'string' || directory === '') {
        errors.push({
          errorType: 'MISSING',
          entityType: 'directory',
          entityPath: '',
        })
      }
    }

    return errors
  }
  public validateAssociationsDocs(config: DocAssociationsConfig): MissingEntityError[] {
    const errors: MissingEntityError[] = []

    for (const documentations of Object.values(config.associations)) {
      if (!documentations || !documentations.length || !Array.isArray(documentations)) {
        errors.push({
          errorType: 'MISSING',
          entityType: 'documentationFile',
          entityPath: '',
        })
        break
      }
      for (const documentation of documentations) {
        if (typeof documentation !== 'string' || !documentation) {
          errors.push({
            errorType: 'MISSING',
            entityType: 'documentationFile',
            entityPath: '',
          })
        }
      }
    }

    return errors
  }
  public findReverseSlashInPaths(
    config: DocAssociationsConfig
  ): Array<MissingEntityError | InvalidEntityError> {
    const errors: Array<MissingEntityError | InvalidEntityError> = []

    for (const directory of Object.keys(config.associations)) {
      if (directory.includes('\\')) {
        errors.push({
          errorType: 'INVALID',
          entityType: 'directory',
          entityPath: directory,
          errorMsg: 'Expected forward slash (/) instead of backward slash (\\) in directory path.',
        })
      }
    }

    for (const documentations of Object.values(config.associations)) {
      if (!documentations || !documentations.length || !Array.isArray(documentations)) {
        errors.push({
          errorType: 'MISSING',
          entityType: 'documentationFile',
          entityPath: '',
        })
        break
      }
      for (const documentation of documentations) {
        if (documentation.includes('\\')) {
          errors.push({
            errorType: 'INVALID',
            entityType: 'documentationFile',
            entityPath: documentation,
            errorMsg:
              'Expected forward slash (/) instead of backward slash (\\) in documentation file path.',
          })
        }
      }
    }

    return errors
  }
  public isJsonFile = (str: string): boolean => {
    try {
      JSON.parse(str)
      console.warn(true, 'isJsonFile')
      return true
    } catch (e) {
      console.warn(false, 'isJsonFile', e)
      return false
    }
  }
}
