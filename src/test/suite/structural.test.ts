import { expect } from 'chai'
import { describe, setup, it } from 'mocha'
import { StructuralValidator } from '../../structural.validator'
import { FileSystemManager } from '../../utils/fileSystem.utils'
import { DocAssociationsConfig } from '../../association.validator'
describe('Configuration JSON Structure Validation', () => {
  const fileSystem = new FileSystemManager()
  let jsonMock: string

  let globalFaultiesData: string[] = []
  const expectedStructureError = `
    Expected structure:

    {
      "associations": {
        {key}: [{value}]
        {key}: [{value}, {value}, ...],
      }
    }
    
    {key} are paths to files or directories that need to be documented.
    {value} are paths to documentation files.
    

    Example:

    {
      "associations": {
        "src": ["docs/global.md", "docs/global2.md"],
        "src/Services": ["docs/services.md"],
        "src/Utils/dates.ts": ["docs/utils/dates.md"]
      }
    }
  `
  setup(() => {
    jsonMock = `{
      "associations": {
        "src": ["/docx/ifTernary.md", "/docx/asyncAwait.md"],
        "src/Controllers": ["/docx/controllers.md"],
        "src/Modules": ["/docx/modules.md"],
        "src/Utils/dates.ts": ["/docx/utils/dates.md"]
      }          
    }`
  })

  it('should detect that file is not json', () => {
    const error = `Expecting file to not be json.\n\n${expectedStructureError}`
    const faultiesData = [``, `["a": "1"]`, `[1, "a", b]`, `notajson`]
    faultiesData.forEach((faultyData) => {
      expect(StructuralValidator.isJsonFile(faultyData), error).to.be.equal(false)
    })
  })

  it('should ensure that file type is json', () => {
    const error = `Some file is not json.\n\n${expectedStructureError}`
    const faultiesData = [
      `[]`,
      `["a", 1, 2, 3, "z"]`,
      `{}`,
      `{"a": "1"}`,
      `{"a": 1, "b": 2}`,
      `{
        "associations": {
          "src": ["docs/global.md", "docs/global2.md"],
          "src/Services": ["docs/services.md"],
          "src/Utils/dates.ts": ["docs/utils/dates.md"]
        }
      }`,
    ]
    faultiesData.forEach((faultyData) => {
      expect(StructuralValidator.isJsonFile(faultyData), error).to.be.equal(true)
    })
  })

  it('should detect that file has invalid associations key structure', () => {
    const errorText = `Expected file has invalid associations key structure.\n\n${expectedStructureError}`
    const faultiesMissingData = [`{"assos": ""}`, `{"link": ""}`]
    const faultiesInvalidData = [`{"associations": ""}`]
    faultiesMissingData.forEach((faultyData) => {
      const jsonConfig = fileSystem.processFileContent(faultyData) as DocAssociationsConfig
      const errors = StructuralValidator.validateAssociationsKeyStructure(jsonConfig)
      expect(errors[0].errorType, errorText).to.equal('MISSING')
      expect(errors[0].entityType, errorText).to.equal('associationsKey')
      expect(errors[0].entityPath, errorText).to.equal('')
    })

    faultiesInvalidData.forEach((faultyData) => {
      const jsonConfig = fileSystem.processFileContent(faultyData) as DocAssociationsConfig
      const errors = StructuralValidator.validateAssociationsKeyStructure(jsonConfig)

      expect(errors[0].errorType, errorText).to.equal('MISSING')
      expect(errors[0].entityType, errorText).to.equal('associationsKey')
      expect(errors[0].entityPath, errorText).to.equal('')
    })

    globalFaultiesData = globalFaultiesData.concat(faultiesMissingData).concat(faultiesInvalidData)
  })

  it('should ensure that file has valid associations key structure', async () => {
    const errorText = `Some file has invalid associations key structure.\n\n${expectedStructureError}`
    const mocksData = [
      `{"associations": {}}`,
      `{"associations": {"": [""]}}`,
      `{"associations": {"src": ["docs/global.md"]}}`,
      `{
        "associations": {
          "src": ["docs/global.md", "docs/global2.md"],
          "src/Controllers": ["docs/controllers.md"]
        }
      }`,
    ]

    mocksData.forEach((mockData) => {
      const jsonConfig = fileSystem.processFileContent(mockData) as DocAssociationsConfig
      const error = StructuralValidator.validateAssociationsKeyStructure(jsonConfig)
      expect(error, errorText).to.lengthOf(0)
    })
  })

  it('should detect that file has invalid directories structure', async () => {
    const errorText = `Expected file has invalid directories structure.\n\n${expectedStructureError}`
    const faultiesData = [
      `{ 
        "associations": {
          "": ["docs/global.md", "docs/global2.md"]
        }
      }`,
      `{
        "associations": {
          "": ["docs/global.md", "docs/global2.md"],
          "src": ["docs/global.md", "docs/global2.md"]
        }
      }`,
    ]
    faultiesData.forEach((faultyData) => {
      const jsonConfig = fileSystem.processFileContent(faultyData) as DocAssociationsConfig
      const errors = StructuralValidator.validateDirectoriesKeyStructure(jsonConfig)
      expect(errors, errorText).to.have.lengthOf(1)
      expect(errors[0].errorType, errorText).to.equal('MISSING')
      expect(errors[0].entityType, errorText).to.equal('directory')
    })

    globalFaultiesData = globalFaultiesData.concat(faultiesData)
  })

  it('should ensure that file has valid directories structure', async () => {
    const errorText = `Some file has invalid directories structure.\n\n${expectedStructureError}`
    const jsonConfig = fileSystem.processFileContent(jsonMock) as DocAssociationsConfig
    const errors = StructuralValidator.validateDirectoriesKeyStructure(jsonConfig)
    expect(errors, errorText).to.have.lengthOf(0)
  })

  it('should detect that file has invalid documentations structure', async () => {
    const errorText = `Expected file has invalid documentations structure.\n\n${expectedStructureError}`
    const faultiesInvalidData = [
      `{ "associations": { "src": "" } }`,
      `{ "associations": { "src": true } }`,
      `{ "associations": { "src": "docs/global.md" } }`,
      `{ "associations": { "src": 1 } }`,
      `{ "associations": { "src": null } }`,
      `{ "associations": ["docs/global.md", "docs/global2.md", ""] }`,
    ]

    const faultiesMissingData = [
      `{
        "associations": {
          "src": ["docs/global.md", "docs/global2.md", ""],
          "src/Controllers": ["docs/controllers.md"]
        }
      }`,
    ]

    faultiesInvalidData.forEach((faultyData) => {
      const jsonConfig = fileSystem.processFileContent(faultyData) as DocAssociationsConfig
      const errors = StructuralValidator.validateDocsValuesStructure(jsonConfig)
      expect(errors[0].errorType, errorText).to.equal('INVALID')
      expect(errors[0].entityType, errorText).to.equal('documentationFile')
    })

    faultiesMissingData.forEach((faultyData) => {
      const jsonConfig = fileSystem.processFileContent(faultyData) as DocAssociationsConfig
      const errors = StructuralValidator.validateDocsValuesStructure(jsonConfig)
      expect(errors[0].errorType, errorText).to.equal('MISSING')
      expect(errors[0].entityType, errorText).to.equal('documentationFile')
    })
    globalFaultiesData = globalFaultiesData.concat(faultiesInvalidData).concat(faultiesMissingData)
  })

  it('should ensure that file has valid documentations structure', async () => {
    const errorText = `Some file has invalid documentations structure.\n\n${expectedStructureError}`
    const jsonConfig = fileSystem.processFileContent(jsonMock) as DocAssociationsConfig
    const errors = StructuralValidator.validateDocsValuesStructure(jsonConfig)
    expect(errors, errorText).to.lengthOf(0)
  })

  it('should detect that file has backslash in path', async () => {
    const errorText = `Expected file has backslash in path.\n\n${expectedStructureError}`
    const faultyData1 = `{
        "associations": {
          "src": ["docs/global.md", "docs/global2.md"],
          "src/Services": ["docs/services.md"],
          "src\\\\Utils\\\\dates.ts": ["docs/utils/dates.md"]
        }
      }`

    const faultyData2 = `{
        "associations": {
          "src": ["docs/global.md", "docs/global2.md"],
          "src/Services": ["docs\\\\services.md"],
          "src/Utils/dates.ts": ["docs\\\\utils\\\\dates.md"]
        }
      }`

    const faultyData3 = `{
        "associations": {
          "src\\\\Utils\\\\dates.ts": ["docs\\\\utils\\\\dates.md", "docs\\\\utils\\\\dates2.md"]
        }
      }`

    const jsonConfig1 = fileSystem.processFileContent(faultyData1) as DocAssociationsConfig
    const errors1 = StructuralValidator.findBackSlashInPaths(jsonConfig1)
    expect(errors1[0].errorType, errorText).to.equal('INVALID')
    expect(errors1[0].entityType, errorText).to.equal('directory')
    expect(errors1[0].entityPath, errorText).to.equal('src\\Utils\\dates.ts')

    const jsonConfig2 = fileSystem.processFileContent(faultyData2) as DocAssociationsConfig
    const errors2 = StructuralValidator.findBackSlashInPaths(jsonConfig2)
    expect(errors2[0].errorType, errorText).to.equal('INVALID')
    expect(errors2[0].entityType, errorText).to.equal('documentationFile')
    expect(errors2[0].entityPath, errorText).to.equal('docs\\services.md')

    expect(errors2[1].errorType, errorText).to.equal('INVALID')
    expect(errors2[1].entityType, errorText).to.equal('documentationFile')
    expect(errors2[1].entityPath, errorText).to.equal('docs\\utils\\dates.md')

    const jsonConfig3 = fileSystem.processFileContent(faultyData3) as DocAssociationsConfig
    const errors3 = StructuralValidator.findBackSlashInPaths(jsonConfig3)
    expect(errors3[0].errorType, errorText).to.equal('INVALID')
    expect(errors3[0].entityType, errorText).to.equal('directory')
    expect(errors3[0].entityPath, errorText).to.equal('src\\Utils\\dates.ts')

    expect(errors3[1].errorType, errorText).to.equal('INVALID')
    expect(errors3[1].entityType, errorText).to.equal('documentationFile')
    expect(errors3[1].entityPath, errorText).to.equal('docs\\utils\\dates.md')

    expect(errors3[2].errorType, errorText).to.equal('INVALID')
    expect(errors3[2].entityType, errorText).to.equal('documentationFile')
    expect(errors3[2].entityPath, errorText).to.equal('docs\\utils\\dates2.md')
  })

  it("should ensure that file hasn't backslash in path.", async () => {
    const errorText = `Some file has backslash in path. Expected "/" but got "\\"`
    const jsonConfig = fileSystem.processFileContent(jsonMock) as DocAssociationsConfig
    const errors = StructuralValidator.findBackSlashInPaths(jsonConfig)
    expect(errors, errorText).to.lengthOf(0)
  })

  it('should detect that file has invalid structure', async () => {
    const errorText = `Expected file has invalid structure.\n\n${expectedStructureError}`
    const faultiesData = globalFaultiesData
    faultiesData.forEach((faultyData) => {
      const jsonConfig = fileSystem.processFileContent(faultyData) as DocAssociationsConfig
      const errors = StructuralValidator.validateConfigStructure(jsonConfig)
      expect(errors, errorText).to.have.lengthOf.above(0)
    })
  })

  it('should ensure that file has valid structure', async () => {
    const errorText = `Some file has invalid structure.\n\n${expectedStructureError}`
    const jsonConfig = fileSystem.processFileContent(jsonMock) as DocAssociationsConfig
    const errors = StructuralValidator.validateConfigStructure(jsonConfig)
    expect(errors, errorText).to.have.lengthOf(0)
  })

  it('should return false if validation error occurred', async () => {
    const faultyData = `{
      "associations": {
        "": ["docs/nothing.md"],
        "src": ["docs/global.md", ""],
        "src/Services": ["docs\\\\services.md"]
      }
    }`
    const jsonConfig = fileSystem.processFileContent(faultyData) as DocAssociationsConfig
    const errors = StructuralValidator.validateConfigStructure(jsonConfig)

    expect(errors).to.have.lengthOf(3)

    expect(errors[0].errorType).to.equal('MISSING')
    expect(errors[0].entityType).to.equal('directory')

    expect(errors[1].errorType).to.equal('MISSING')
    expect(errors[1].entityType).to.equal('documentationFile')

    expect(errors[2].errorType).to.equal('INVALID')
    expect(errors[2].entityType).to.equal('documentationFile')
    expect(errors[2].entityPath).to.equal('docs\\services.md')
  })

  it('should return true if no validation error occurred', async () => {
    const jsonConfig = fileSystem.processFileContent(jsonMock) as DocAssociationsConfig

    const errors = StructuralValidator.validateConfigStructure(jsonConfig)
    expect(errors).to.have.lengthOf(0)
  })
})
