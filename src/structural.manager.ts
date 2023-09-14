import path = require('path')
import { DocAssociationsConfig, MissingEntityError } from './association.validator'
import { InvalidEntityError, StructuralValidator } from './structural.validator'
import { FileSystemManager } from './utils/fileSystem.utils'
export class StructuralManager {
  private baseDir: string
  private fileSystem: FileSystemManager
  private validator: StructuralValidator
  private configFileName: string
  constructor(baseDir: string, fileSystem: FileSystemManager) {
    this.baseDir = baseDir
    this.fileSystem = fileSystem
    this.validator = new StructuralValidator()
    this.configFileName = '.docx.json'
  }

  public async validateConfig(): Promise<Array<MissingEntityError | InvalidEntityError>> {
    try {
      const configJson = await this.fileSystem.readFile(
        path.join(this.baseDir, this.configFileName)
      )

      const config = JSON.parse(configJson) as DocAssociationsConfig

      const errors = this.validator.validateConfigStructure(config)

      if (errors?.length) return errors // TODO: Return the errors in the terminal
      return []
    } catch (error) {
      return [
        {
          errorType: 'INVALID',
          entityType: 'config',
          entityPath: path.join(this.baseDir, this.configFileName),
          errorMsg: 'Invalid JSON',
        },
      ] // TODO: Return the errors in the terminal
    }
  }
}
