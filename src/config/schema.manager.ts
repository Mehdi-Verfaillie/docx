import { WorkspaceConfiguration, ConfigurationTarget, workspace } from 'vscode'

type SchemaConfig = {
  fileMatch: string[]
  url: string
}

export class SchemaManager {
  private static config: WorkspaceConfiguration = workspace.getConfiguration()

  public static initialize(fileMatchPattern: string, schemaUrl: string): void {
    const schemaConfig: SchemaConfig = {
      fileMatch: [fileMatchPattern],
      url: schemaUrl,
    }

    const currentSchemas: SchemaConfig[] = this.config.get<SchemaConfig[]>('json.schemas') || []

    const existingSchemaIndex = currentSchemas.findIndex((schema) =>
      schema.fileMatch.includes(fileMatchPattern)
    )

    // If no existing schema with the same fileMatchPattern, add new schema
    if (existingSchemaIndex === -1) {
      currentSchemas.push(schemaConfig)
      this.updateSchemas(currentSchemas)
      return
    }

    // If URL is the same, do nothing. Otherwise, update the URL.
    if (currentSchemas[existingSchemaIndex].url !== schemaUrl) {
      currentSchemas[existingSchemaIndex].url = schemaUrl
      this.updateSchemas(currentSchemas)
    }
  }

  private static updateSchemas(schemas: SchemaConfig[]): void {
    this.config.update('json.schemas', schemas, ConfigurationTarget.Global)
  }
}
