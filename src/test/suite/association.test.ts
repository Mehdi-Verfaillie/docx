import { expect } from 'chai'
import * as sinon from 'sinon'
import * as vscode from 'vscode'
import { describe, setup, teardown, it } from 'mocha'
import { DocAssociationsConfig, AssociationsManager } from '../../association'

describe('Associations JSON Validation', () => {
  const jsonMock = JSON.stringify({
    associations: {
      'src': ['/docx/ifTernary.md', '/docx/asyncAwait.md'],
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'src/Controllers': ['/docx/controllers.md'],
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'src/Modules': ['/docx/modules.md'],
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'src/Utils/dates.ts': ['/docx/utils/dates.md'],
    },
  })

  let statStub: sinon.SinonStub
  let manager: AssociationsManager

  setup(() => {
    const workspaceFs = { ...vscode.workspace.fs }
    statStub = sinon.stub(workspaceFs, 'stat')

    statStub
      .withArgs(
        sinon.match((uri: vscode.Uri) => {
          return (
            // Folder structure mock
            uri.fsPath.endsWith('src') ||
            uri.fsPath.endsWith('src/Controllers') ||
            uri.fsPath.endsWith('src/Modules') ||
            uri.fsPath.endsWith('src/Utils/dates.ts') ||
            // Documentations mock
            uri.fsPath.endsWith('/docx/ifTernary.md') ||
            uri.fsPath.endsWith('/docx/asyncAwait.md') ||
            uri.fsPath.endsWith('/docx/controllers.md') ||
            uri.fsPath.endsWith('/docx/modules.md') ||
            uri.fsPath.endsWith('/docx/general.md') ||
            uri.fsPath.endsWith('/docx/utils/dates.md')
          )
        })
      )
      .resolves()

    statStub.rejects(new Error('File not found'))

    const baseDir = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath ?? ''
    manager = new AssociationsManager(baseDir, statStub)
  })

  teardown(() => statStub.restore())

  it('should ensure all defined directories exist', async () => {
    const jsonConfig = JSON.parse(jsonMock) as DocAssociationsConfig
    const definedDirectories = Object.keys(jsonConfig.associations)

    const errors = await manager.validateDirectoryPaths(definedDirectories)

    expect(errors, `Some directories do not exist`).to.have.lengthOf(0)
  })

  it('should detect and return the undefined directories', async () => {
    const jsonMockWithMissingDirectory = JSON.stringify({
      associations: {
        ...JSON.parse(jsonMock).associations,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'src/Services': ['/docx/services.md'],
      },
    })
    const jsonConfig = JSON.parse(jsonMockWithMissingDirectory) as DocAssociationsConfig
    const definedDirectories = Object.keys(jsonConfig.associations)

    const errors = await manager.validateDirectoryPaths(definedDirectories)

    expect(errors, `Expected missing directories not found`).to.have.length.above(0)

    expect(errors[0].entityPath).to.equal('src/Services')
    expect(errors[0].entityType).to.equal('directory')
  })

  it('should ensure all defined documentations exist', async () => {
    const jsonConfig = JSON.parse(jsonMock) as DocAssociationsConfig

    const errors = await manager.validateDocumentationPaths(jsonConfig.associations)

    expect(errors, `Some documentation files do not exist`).to.have.lengthOf(0)
  })

  it('should not find any duplicated documentation paths if none exist', () => {
    const jsonConfig = JSON.parse(jsonMock) as DocAssociationsConfig

    const duplicatesList = manager.findDuplicateDocsInDirectory(jsonConfig.associations)

    expect(duplicatesList.length, 'No duplicates should exist but found some').to.equal(0)
  })

  it('should detect and return duplicated documentation paths', () => {
    const jsonMockWithDuplications = JSON.stringify({
      associations: {
        ...JSON.parse(jsonMock).associations,
        src: ['/docx/general.md', '/docx/ifTernary.md', '/docx/asyncAwait.md', '/docx/general.md'],
      },
    })

    const jsonConfig = JSON.parse(jsonMockWithDuplications) as DocAssociationsConfig

    const duplicatesList = manager.findDuplicateDocsInDirectory(jsonConfig.associations)

    expect(duplicatesList.length, `Expected duplicates not found`).to.be.greaterThan(0)
    const duplicateError = duplicatesList[0]
    expect(duplicateError.errorType).to.equal('DUPLICATE')
    expect(duplicateError.entityType).to.equal('documentationFile')
    expect(duplicateError.entityPath).to.equal('/docx/general.md')
    expect(duplicateError.originalLocation).to.equal('src')
    expect(duplicateError.duplicateLocation).to.equal('src')
  })

  it('should ensure no documentation is inherited in child directories', () => {
    const jsonConfig = JSON.parse(jsonMock) as DocAssociationsConfig
    const duplicatesList = manager.findInheritedDuplicateDocsInDirectory(jsonConfig.associations)

    expect(duplicatesList.length, `Documentation inherited in child directories`).to.equal(0)
  })

  it('should return an error object if a documentation is inherited in child directories', () => {
    const jsonMockWithInheritedDocs = JSON.stringify({
      associations: {
        ...JSON.parse(jsonMock).associations,
        'src': ['/docx/general.md', '/docx/ifTernary.md', '/docx/asyncAwait.md'],
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'src/Controllers': ['/docx/controllers.md', '/docx/general.md'],
      },
    })
    const jsonConfig = JSON.parse(jsonMockWithInheritedDocs) as DocAssociationsConfig
    const duplicatesList = manager.findInheritedDuplicateDocsInDirectory(jsonConfig.associations)

    expect(duplicatesList.length, `Expected inherited documentation not found`).to.be.greaterThan(0)

    const error = duplicatesList[0]
    expect(error.errorType).to.equal('DUPLICATE')
    expect(error.entityType).to.equal('documentationFile')
  })

  it('should validate provided JSON and detect all issues', async () => {
    const faultyJson = JSON.stringify({
      associations: {
        'src': ['/docx/nonExistent.md', '/docx/asyncAwait.md'],
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'src/nonExistentDir': ['/docx/ifTernary.md'],
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'src/Controllers': ['/docx/controllers.md', '/docx/ifTernary.md'],
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'src/Modules': ['/docx/asyncAwait.md'],
      },
    })

    const errors = await manager.validateAssociationsFromJson(faultyJson)

    expect(errors).to.be.an('array').that.has.length.above(0)

    const missingDocErrors =
      errors?.filter(
        (err) => err.errorType === 'MISSING' && err.entityType === 'documentationFile'
      ) ?? []
    expect(missingDocErrors).to.have.lengthOf(1)
    expect(missingDocErrors[0].entityPath).to.equal('/docx/nonExistent.md')

    const missingDirErrors =
      errors?.filter((err) => err.errorType === 'MISSING' && err.entityType === 'directory') ?? []
    expect(missingDirErrors).to.have.lengthOf(1)
    expect(missingDirErrors[0].entityPath).to.equal('src/nonExistentDir')

    const duplicateDocErrors = errors?.filter((err) => err.errorType === 'DUPLICATE')

    expect(duplicateDocErrors).to.have.lengthOf(1)

    const inheritedDupDocErrors = manager.findInheritedDuplicateDocsInDirectory(
      JSON.parse(faultyJson).associations
    )
    expect(inheritedDupDocErrors).to.be.an('array').that.has.length.above(0)
  })
})
