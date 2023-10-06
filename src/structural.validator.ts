import { MissingEntityError, DocAssociationsConfig, EntityError } from './association.validator'

export interface InvalidEntityError extends EntityError {
  errorType: 'INVALID'
  errorMsg?: string
}

export class StructuralValidator {
  public static validateConfigStructure(
    config: DocAssociationsConfig
  ): (MissingEntityError | InvalidEntityError)[] {
    const associationsTypeErrors: (MissingEntityError | InvalidEntityError)[] =
      this.validateAssociationsKeyStructure(config)

    if (associationsTypeErrors.length > 0) return associationsTypeErrors

    const associationsDirectoriesErrors = this.validateDirectoriesKeyStructure(config)
    const associationsDocsErrors = this.validateDocsValuesStructure(config)
    const reverseSlashErrors = this.findBackSlashInPaths(config)

    const allErrors = [
      ...associationsTypeErrors,
      ...associationsDirectoriesErrors,
      ...associationsDocsErrors,
      ...reverseSlashErrors,
    ]

    return allErrors
  }

  public static validateAssociationsKeyStructure(
    config: DocAssociationsConfig
  ): (MissingEntityError | InvalidEntityError)[] {
    const errors: (MissingEntityError | InvalidEntityError)[] = []

    if (!config.associations) {
      errors.push({
        errorType: 'MISSING',
        entityType: 'associationsKey',
        entityPath: '',
        errorMsg: 'Expected a key named "associations" in the config file.',
      })
    } else if (typeof config.associations !== 'object' || Array.isArray(config.associations)) {
      errors.push({
        errorType: 'INVALID',
        entityType: 'associationsKey',
        entityPath: '',
        errorMsg: 'Expected an object for the "associations" key in the config file.',
      })
    }

    return errors
  }
  public static validateDirectoriesKeyStructure(
    config: DocAssociationsConfig
  ): MissingEntityError[] {
    const errors: MissingEntityError[] = []

    for (const directory of Object.keys(config.associations)) {
      if (typeof directory !== 'string' || directory === '') {
        errors.push({
          errorType: 'MISSING',
          entityType: 'directory',
          entityPath: '',
          errorMsg:
            'Expected a string for directory path. Example: "src/controllers" or "src/controllers/auth.ts".',
        })
      }
    }

    return errors
  }
  public static validateDocsValuesStructure(
    config: DocAssociationsConfig
  ): (MissingEntityError | InvalidEntityError)[] {
    const errors: (MissingEntityError | InvalidEntityError)[] = []

    for (const [directories, documentations] of Object.entries(config.associations)) {
      if (!Array.isArray(documentations)) {
        errors.push({
          errorType: 'INVALID',
          entityType: 'documentationFile',
          entityPath: '',
          errorMsg:
            'Expected an array of documentation files path. Example: ["doc1.md", "doc2.md"]',
        })
        break
      } else if (!documentations || !documentations.length) {
        errors.push({
          errorType: 'MISSING',
          entityType: 'documentationFile',
          entityPath: '',
          errorMsg: 'Missing documentation files path. Example: ["doc1.md", "doc2.md"]',
        })
        break
      }

      for (const [i, documentation] of documentations.entries()) {
        if (typeof documentation !== 'string') {
          errors.push({
            errorType: 'INVALID',
            entityType: 'documentationFile',
            entityPath: '',
            errorMsg:
              'Expected a string in the array of documentation files path. Example: ["doc1.md", "doc2.md"]',
          })
        } else if (!documentation) {
          errors.push({
            errorType: 'MISSING',
            entityType: 'documentationFile',
            entityPath: directories
              ? `directory ${directories[i]}`
              : 'not found, directory is also missing',
            errorMsg: 'Missing documentation file path. Example: ["doc1.md", "doc2.md"].',
          })
        }
      }
    }

    return errors
  }

  public static findBackSlashInPaths(
    config: DocAssociationsConfig
  ): (MissingEntityError | InvalidEntityError)[] {
    const errors: (MissingEntityError | InvalidEntityError)[] = []

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
      if (!Array.isArray(documentations) || !documentations || !documentations.length) {
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
  public static isJsonFile = (str: string): boolean => {
    try {
      JSON.parse(str)
      return true
    } catch (e) {
      return false
    }
  }
}
