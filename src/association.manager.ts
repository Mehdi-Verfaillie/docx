import { DocAssociationsConfig } from './association.validator'
import { Extension } from './utils/fileSystem.utils'
import { DataTransformManager } from './utils/transform.utils'

export interface Documentation {
  name: string
  path: string
  type: Extension
  content: string
}

export class AssociationsManager {
  private transform = DataTransformManager

  constructor() {}

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
    config: DocAssociationsConfig,
    currUserPath: string
  ): Promise<Documentation[]> {
    const associatedDocsPaths = this.getAssociatedDocsPaths(currUserPath, config)

    if (!associatedDocsPaths.length) return []

    return this.transform.sortDataByTypeAndName(
      documentations.filter((doc) => associatedDocsPaths.includes(doc.path))
    )
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
