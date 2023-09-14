import { AssociationsValidator, DocAssociationsConfig } from './association.validator'
import { FileSystemManager } from './utils/fileSystem.utils'

export interface Documentation {
  name: string
  type: 'md'
  content: string
}

export class AssociationsManager {
  private fileSystem: FileSystemManager
  private validator: AssociationsValidator

  constructor(baseDir: string, fileSystem: FileSystemManager) {
    this.fileSystem = fileSystem
    this.validator = new AssociationsValidator(baseDir, fileSystem)
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
    const config = this.fileSystem.processFileContent<DocAssociationsConfig>(json)

    if (!config || !config.associations) return [] // TODO: Return the errors in the terminal

    const errors = await this.validator.validateAssociations(config)

    if (errors?.length) return [] // TODO: Return the errors in the terminal

    const associatedDocsPaths = this.getAssociatedDocsPaths(currUserPath, config)

    if (!associatedDocsPaths.length) return []

    return documentations.filter((doc) => associatedDocsPaths.includes(doc.name))
  }

  /**
   * Retrieves all associated document paths for a given directory, including inherited ones.
   *
   * @private
   * @param {string} currUserPath - The current user path.
   * @param {Object} config - Contain the associations object mapping directories to their document paths.
   * @returns {string[]} - A list of document paths associated with the given user path.
   */
  private getAssociatedDocsPaths(currUserPath: string, config: DocAssociationsConfig): string[] {
    let docsPaths: string[] = config.associations[currUserPath] || []

    for (const [dir, docs] of Object.entries(config.associations)) {
      if (currUserPath.startsWith(dir) && currUserPath !== dir) {
        // If dir is a parent of currUserPath
        docsPaths = [...docsPaths, ...docs]
      }
    }

    // Remove duplicates
    return [...new Set(docsPaths)]
  }
}
