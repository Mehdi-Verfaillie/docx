/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai'
import * as sinon from 'sinon'
import { describe, setup, it } from 'mocha'
import { StructuralValidator } from '../../structural.validator'
import { FileSystemManager } from '../../utils/fileSystem.utils'
import { StructuralManager } from '../../structural.manager'
import { workspace } from 'vscode'
import { DocAssociationsConfig } from '../../association.validator'
describe('Config structure tests', () => {
  let fileSystemStub: sinon.SinonStubbedInstance<FileSystemManager>
  let jsonMock: string

  const validator: StructuralValidator = new StructuralValidator()
  let manager: StructuralManager

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
    fileSystemStub = sinon.createStubInstance(FileSystemManager)
    jsonMock = `{
      "associations": {
        "src": ["/docx/ifTernary.md", "/docx/asyncAwait.md"],
        "src/Controllers": ["/docx/controllers.md"],
        "src/Modules": ["/docx/modules.md"],
        "src/Utils/dates.ts": ["/docx/utils/dates.md"]
      }          
    }`

    const baseDir = workspace.workspaceFolders?.[0]?.uri?.fsPath ?? ''
    manager = new StructuralManager(baseDir, fileSystemStub)
  })

  teardown(() => fileSystemStub.readFile.restore())

  it('should detect that file is not json', () => {
    const error = `Expecting file to not be json.\n\n${expectedStructureError}`
    const faultiesData = [``, `["a": "1"]`, `[1, "a", b]`, `notajson`]
    faultiesData.forEach((faultyData) => {
      expect(validator.isJsonFile(faultyData), error).to.be.false
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
      expect(validator.isJsonFile(faultyData), error).to.be.true
    })
  })

  it('should detect that file has invalid associations key type', () => {
    const errorText = `Expected file has invalid associations key type.\n\n${expectedStructureError}`
    const faultiesData = [`{"assos": ""}`, `{"link": ""}`]
    faultiesData.forEach((faultyData) => {
      const jsonConfig = JSON.parse(faultyData) as DocAssociationsConfig
      const errors = validator.validateAssociationsType(jsonConfig)
      expect(errors[0].errorType, errorText).to.equal('MISSING')
      expect(errors[0].entityType, errorText).to.equal('associationsKey')
      expect(errors[0].entityPath, errorText).to.equal('')
    })

    globalFaultiesData = globalFaultiesData.concat(faultiesData)
  })

  it('should ensure that file has valid associations key type.', async () => {
    const errorText = `Some file has invalid associations key type.\n\n${expectedStructureError}`
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
      const jsonConfig = JSON.parse(mockData) as DocAssociationsConfig
      const error = validator.validateAssociationsType(jsonConfig)
      expect(error, errorText).to.lengthOf(0)
    })
  })

  it('should detect that file has invalid associations directories type.', async () => {
    const errorText = `Expected file has invalid associations directories type.\n\n${expectedStructureError}`
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
      const jsonConfig = JSON.parse(faultyData) as DocAssociationsConfig
      const errors = validator.validateAssociationsDirectories(jsonConfig)
      expect(errors, errorText).to.have.lengthOf(1)
      expect(errors[0].errorType, errorText).to.equal('MISSING')
      expect(errors[0].entityType, errorText).to.equal('directory')
    })

    globalFaultiesData = globalFaultiesData.concat(faultiesData)
  })

  it('should ensure that file has valid associations directories type.', async () => {
    const errorText = `Some file has invalid associations directories type.\n\n${expectedStructureError}`
    const jsonConfig = JSON.parse(jsonMock) as DocAssociationsConfig
    const errors = validator.validateAssociationsDirectories(jsonConfig)
    expect(errors, errorText).to.have.lengthOf(0)
  })

  it('should detect that file has invalid associations documentations type.', async () => {
    const errorText = `Expected file has invalid associations documentations type.\n\n${expectedStructureError}`
    const faultiesData = [
      `{ "associations": { "src": "" } }`,
      `{ "associations": { "src": "docs/global.md" } }`,
      `{ "associations": { "src": true } }`,
      `{ "associations": { "src": 1 } }`,
      `{ "associations": { "src": null } }`,
      `{ "associations": { "src": [] } }`,
      `{ "associations": { "src": [""] } }`,
      `{
        "associations": {
          "src": ["docs/global.md", "docs/global2.md", ""],
          "src/Controllers": ["docs/controllers.md"]
        }
      }`,
      `{ "associations": ["docs/global.md", "docs/global2.md", ""] }`,
    ]

    faultiesData.forEach((faultyData) => {
      const jsonConfig = JSON.parse(faultyData) as DocAssociationsConfig
      const errors = validator.validateAssociationsDocs(jsonConfig)
      expect(errors[0].errorType, errorText).to.equal('MISSING')
      expect(errors[0].entityType, errorText).to.equal('documentationFile')
    })
    globalFaultiesData = globalFaultiesData.concat(faultiesData)
  })

  it('should ensure that file has valid associations documentations type.', async () => {
    const errorText = `Some file has invalid associations documentations type.\n\n${expectedStructureError}`
    const jsonConfig = JSON.parse(jsonMock) as DocAssociationsConfig
    const errors = validator.validateAssociationsDocs(jsonConfig)
    expect(errors, errorText).to.lengthOf(0)
  })

  it('should detect that file has backslash in path.', async () => {
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

    const jsonConfig1 = JSON.parse(faultyData1)
    const errors1 = validator.findReverseSlashInPaths(jsonConfig1)
    expect(errors1[0].errorType, errorText).to.equal('INVALID')
    expect(errors1[0].entityType, errorText).to.equal('directory')
    expect(errors1[0].entityPath, errorText).to.equal('src\\Utils\\dates.ts')

    const jsonConfig2 = JSON.parse(faultyData2)
    const errors2 = validator.findReverseSlashInPaths(jsonConfig2)
    expect(errors2[0].errorType, errorText).to.equal('INVALID')
    expect(errors2[0].entityType, errorText).to.equal('documentationFile')
    expect(errors2[0].entityPath, errorText).to.equal('docs\\services.md')

    expect(errors2[1].errorType, errorText).to.equal('INVALID')
    expect(errors2[1].entityType, errorText).to.equal('documentationFile')
    expect(errors2[1].entityPath, errorText).to.equal('docs\\utils\\dates.md')

    const jsonConfig3 = JSON.parse(faultyData3)
    const errors3 = validator.findReverseSlashInPaths(jsonConfig3)
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
    const jsonConfig = JSON.parse(jsonMock) as DocAssociationsConfig
    const errors = validator.findReverseSlashInPaths(jsonConfig)
    expect(errors, errorText).to.lengthOf(0)
  })

  it('should detect that file has invalid structure.', async () => {
    const errorText = `Expected file has invalid structure.\n\n${expectedStructureError}`
    const faultiesData = globalFaultiesData
    faultiesData.forEach((faultyData) => {
      const jsonConfig = JSON.parse(faultyData) as DocAssociationsConfig
      const errors = validator.validateConfigStructure(jsonConfig)
      expect(errors, errorText).to.have.lengthOf.above(0)
    })
  })

  it('should ensure that file has valid structure.', async () => {
    const errorText = `Some file has invalid structure.\n\n${expectedStructureError}`
    const jsonConfig = JSON.parse(jsonMock) as DocAssociationsConfig
    const errors = validator.validateConfigStructure(jsonConfig)
    expect(errors, errorText).to.have.lengthOf(0)
  })

  it('should return false if validation error occurred.', async () => {
    const faultyData = `{
      "associations": {
        "": ["docs/nothing.md"],
        "src": ["docs/global.md", ""],
        "src/Services": ["docs\\\\services.md"]
      }
    }`
    fileSystemStub.readFile.resolves(faultyData)
    const errors = await manager.validateConfig()

    expect(errors).to.have.lengthOf(3)

    expect(errors[0].errorType).to.equal('MISSING')
    expect(errors[0].entityType).to.equal('directory')

    expect(errors[1].errorType).to.equal('MISSING')
    expect(errors[1].entityType).to.equal('documentationFile')

    expect(errors[2].errorType).to.equal('INVALID')
    expect(errors[2].entityType).to.equal('documentationFile')
    expect(errors[2].entityPath).to.equal('docs\\services.md')
  })

  it('should return true if no validation error occurred.', async () => {
    fileSystemStub.readFile.resolves(jsonMock)
    const errors = await manager.validateConfig()
    expect(errors).to.have.lengthOf(0)
  })
})
