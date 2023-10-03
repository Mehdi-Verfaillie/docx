import { expect } from 'chai'
import * as sinon from 'sinon'
import { Uri, workspace } from 'vscode'
import { describe, setup, teardown, it } from 'mocha'
import { DocAssociationsConfig, AssociationsValidator } from '../../association.validator'
import { FileSystemManager } from '../../utils/fileSystem.utils'
import { AssociationsManager, Documentation } from '../../association.manager'
import { ErrorManager } from '../../utils/error.utils'

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

  let fileSystemStub: sinon.SinonStubbedInstance<FileSystemManager>
  let validatorStub: sinon.SinonStubbedInstance<AssociationsValidator>
  let errorManagerStub: sinon.SinonStub

  let validator: AssociationsValidator
  let manager: AssociationsManager

  setup(() => {
    fileSystemStub = sinon.createStubInstance(FileSystemManager)
    validatorStub = sinon.createStubInstance(AssociationsValidator)
    errorManagerStub = sinon.stub(ErrorManager, 'outputError')

    fileSystemStub.ensureFileExists
      .withArgs(
        sinon.match((uri: Uri) => {
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

    fileSystemStub.ensureFileExists.rejects(new Error('File not found'))

    const baseDir = workspace.workspaceFolders?.[0]?.uri?.fsPath ?? ''
    validator = new AssociationsValidator(baseDir, fileSystemStub)
    manager = new AssociationsManager(baseDir, fileSystemStub)
  })

  teardown(() => {
    fileSystemStub.ensureFileExists.restore()
    errorManagerStub.restore()
  })

  it('should ensure all defined directories exist', async () => {
    const jsonConfig = JSON.parse(jsonMock) as DocAssociationsConfig
    const definedDirectories = Object.keys(jsonConfig.associations)

    const errors = await validator.validateDirectoryPaths(definedDirectories)

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

    const errors = await validator.validateDirectoryPaths(definedDirectories)

    expect(errors, `Expected missing directories not found`).to.have.length.above(0)

    expect(errors[0].entityPath).to.equal('src/Services')
    expect(errors[0].entityType).to.equal('directory')
  })

  it('should ensure all defined documentations exist', async () => {
    const jsonConfig = JSON.parse(jsonMock) as DocAssociationsConfig

    const errors = await validator.validateDocumentationPaths(jsonConfig.associations)

    expect(errors, `Some documentation files do not exist`).to.have.lengthOf(0)
  })

  it('should not find any duplicated documentation paths if none exist', () => {
    const jsonConfig = JSON.parse(jsonMock) as DocAssociationsConfig

    const duplicatesList = validator.findDuplicateDocsInDirectory(jsonConfig.associations)

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

    const duplicatesList = validator.findDuplicateDocsInDirectory(jsonConfig.associations)

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
    const duplicatesList = validator.findInheritedDuplicateDocsInDirectory(jsonConfig.associations)

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
    const duplicatesList = validator.findInheritedDuplicateDocsInDirectory(jsonConfig.associations)

    expect(duplicatesList.length, `Expected inherited documentation not found`).to.be.greaterThan(0)

    const error = duplicatesList[0]
    expect(error.errorType).to.equal('DUPLICATE')
    expect(error.entityType).to.equal('documentationFile')
  })

  it('should validate provided JSON and detect all issues', async () => {
    const faultyData = {
      associations: {
        'src': ['/docx/nonExistent.md', '/docx/asyncAwait.md'],
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'src/nonExistentDir': ['/docx/ifTernary.md'],
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'src/Controllers': ['/docx/controllers.md', '/docx/ifTernary.md'],
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'src/Modules': ['/docx/asyncAwait.md'],
      },
    }

    const errors = await validator.validateAssociations(faultyData)

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

    const inheritedDupDocErrors = validator.findInheritedDuplicateDocsInDirectory(
      faultyData.associations
    )
    expect(inheritedDupDocErrors).to.be.an('array').that.has.length.above(0)
  })

  it('should return an empty array if validation errors occur', async () => {
    validatorStub.validateAssociations.resolves([])
    const result = await manager.associate([], jsonMock, 'src')
    expect(result).to.deep.equal([])
  })

  it('should return an empty array if no associated docs for currUserPath', async () => {
    validatorStub.validateAssociations.resolves([])
    fileSystemStub.processFileContent.returns({ associations: {} })

    const result = await manager.associate([], jsonMock, 'nonexistentPath')
    expect(result).to.deep.equal([])
  })

  it('should return associated documentations for currUserPath', async () => {
    const mockDoc: Documentation[] = [
      { name: '/docx/ifTernary.md', type: '.md', content: 'content' },
      { name: '/docx/asyncAwait.md', type: '.md', content: 'content' },
      { name: '/docx/someOtherDoc.md', type: '.md', content: 'content' },
    ]

    fileSystemStub.processFileContent.returns(JSON.parse(jsonMock))

    const srcResult = await manager.associate(mockDoc, jsonMock, 'src')

    expect(srcResult).to.have.length(2)
    expect(srcResult[0].name).to.equal('/docx/asyncAwait.md')
    expect(srcResult[1].name).to.equal('/docx/ifTernary.md')

    fileSystemStub.processFileContent.returns(JSON.parse(jsonMock))
  })

  it('should return associated documentations for currUserPath including parent associations', async () => {
    const mockDoc: Documentation[] = [
      { name: '/docx/ifTernary.md', type: '.md', content: 'content' },
      { name: '/docx/asyncAwait.md', type: '.md', content: 'content' },
      { name: '/docx/controllers.md', type: '.md', content: 'content' },
      { name: '/docx/modules.md', type: '.md', content: 'content' },
      { name: '/docx/utils/dates.md', type: '.md', content: 'content' },
    ]

    fileSystemStub.processFileContent.returns(JSON.parse(jsonMock))

    // Test for a child directory. Expecting both parent (src) and its own (src/Modules) associations.
    const modulesResult = await manager.associate(mockDoc, jsonMock, 'src/Modules')

    expect(modulesResult).to.have.length(3) // Including parent's documentation
    expect(modulesResult.some((doc) => doc.name === '/docx/ifTernary.md')).to.be.equal(true)
    expect(modulesResult.some((doc) => doc.name === '/docx/asyncAwait.md')).to.be.equal(true)
    expect(modulesResult.some((doc) => doc.name === '/docx/modules.md')).to.be.equal(true)
  })
})
