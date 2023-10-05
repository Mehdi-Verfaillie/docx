import path = require('path')
import { DocAssociationsConfig, MissingEntityError } from './association.validator'
import { InvalidEntityError, StructuralValidator } from './structural.validator'
export class StructuralManager {
  private baseDir: string
  private configFileName: string
  constructor(baseDir: string) {
    this.baseDir = baseDir
    this.configFileName = '.docx.json'
  }

  public async validateConfig(
    config: DocAssociationsConfig
  ): Promise<(MissingEntityError | InvalidEntityError)[]> {
    try {
      const errors = StructuralValidator.validateConfigStructure(config)

      if (errors?.length) return errors
      return []
    } catch (error) {
      return [
        {
          errorType: 'INVALID',
          entityType: 'config',
          entityPath: path.join(this.baseDir, this.configFileName),
          errorMsg: 'Invalid JSON',
        },
      ]
    }
  }
}
