import { AssociationsValidator, DocAssociationsConfig } from './association.validator'
import { FileManager } from './utils/files.utils'

export interface Documentation {
  name: string
  type: 'md'
  content: string
}

export class AssociationsManager {
  private fileManager: FileManager
  private validator: AssociationsValidator

  constructor(baseDir: string, fileManager: FileManager) {
    this.fileManager = fileManager
    this.validator = new AssociationsValidator(baseDir, fileManager)
  }

  /**
   * Associates the given documentations based on the provided JSON configuration and user path.
   *
   * The function processes the configuration, validates it, and returns the associated documentations
   * for the current user path, including those inherited from parent directories.
   *
   * @public
   * @param {Documentation[]} documentations - The list of all available documentations.
   * @param {string} json - The JSON string containing the documentation associations configuration.
   * @param {string} currUserPath - The current user path.
   * @returns {Promise<Documentation[]>} - A promise that resolves to a list of associated documentations.
   */
  public async associate(
    documentations: Documentation[],
    json: string,
    currUserPath: string
  ): Promise<Documentation[]> {
    const config = this.fileManager.processFileContent<DocAssociationsConfig>(json)

    if (!config || !config.associations) return [] // TODO: Return the errors in the terminal

    const errors = await this.validator.validateAssociations(config)

    if (errors?.length) return [] // TODO: Return the errors in the terminal

    const associatedDocsPaths = this.getAssociatedDocsPaths(currUserPath, config.associations)

    if (!associatedDocsPaths.length) return []

    return documentations.filter((doc) => associatedDocsPaths.includes(doc.name))
  }

  /**
   * Retrieves all associated document paths for a given directory, including inherited ones.
   *
   * @private
   * @param {string} currUserPath - The current user path.
   * @param {Object} associations - The associations object mapping directories to their document paths.
   * @returns {string[]} - A list of document paths associated with the given user path.
   */
  private getAssociatedDocsPaths(
    currUserPath: string,
    associations: { [key: string]: string[] }
  ): string[] {
    let docsPaths: string[] = associations[currUserPath] || []

    for (const [dir, docs] of Object.entries(associations)) {
      if (currUserPath.startsWith(dir) && currUserPath !== dir) {
        // If dir is a parent of currUserPath
        docsPaths = [...docsPaths, ...docs]
      }
    }

    // Remove duplicates
    return [...new Set(docsPaths)]
  }
}
