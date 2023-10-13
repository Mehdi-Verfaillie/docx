import { expect } from 'chai'
import { SinonStub, match, stub, assert } from 'sinon'
import { FileSystemError, FileType, Uri, workspace } from 'vscode'
import { describe, setup, teardown, it, before } from 'mocha'
import { FileSystemManager } from '../../utils/fileSystem.utils'
import { ErrorManager } from '../../utils/error.utils'

describe('File Validation', () => {
  let readFileStub: SinonStub
  let statStub: SinonStub
  let fileSystem: FileSystemManager

  const jsonMock =
    '{"associations":{"src":["/docx/ifTernary.md","/docx/asyncAwait.md"],"src/Controllers":["/docx/controllers.md"],"src/Modules":["/docx/modules.md"],"src/Utils/dates.ts":["/docx/utils/dates.md"]}}'

  setup(() => {
    const workspaceFs = { ...workspace.fs }

    // Stubbing for readFile
    readFileStub = stub(workspaceFs, 'readFile')
    readFileStub
      .withArgs(match((uri: Uri) => uri.fsPath.endsWith('association.json')))
      .resolves(new Uint8Array(Buffer.from(jsonMock)))
    readFileStub.rejects(new Error('File not found'))

    // Stubbing for stat
    statStub = stub(workspaceFs, 'stat')
    statStub.withArgs(match((uri: Uri) => uri.fsPath.endsWith('association.json'))).resolves()
    statStub.rejects(new Error('File not found'))

    fileSystem = new FileSystemManager(workspaceFs)
  })

  teardown(() => {
    readFileStub.restore()
    statStub.restore()
  })

  it('should return true if the file exists', async () => {
    const result = await fileSystem.ensureFileExists(Uri.file('association.json'))
    expect(result).to.be.equal(true)
  })

  it('should return false if the file does not exist', async () => {
    const result = await fileSystem.ensureFileExists(Uri.file('nonexistentfile.json'))
    expect(result).to.be.equal(false)
  })

  it('should throw a FileSystemError for unexpected errors', async () => {
    try {
      // @ts-expect-error
      await fileSystem.ensureFileExists(undefined)
      expect.fail('Expected ensureFileExists to throw, but it did not.')
    } catch (error) {
      expect(error as Error).to.be.instanceOf(FileSystemError)
    }
  })

  it('should retrieve the file content successfully', async () => {
    const result = await fileSystem.readFile('association.json')
    expect(result).to.be.equal(jsonMock)
  })

  it('should throw an error if reading the file fails', async () => {
    try {
      await fileSystem.readFile('nonexistentfile.json')
      expect.fail('Expected getFileContent to throw, but it did not.')
    } catch (error) {
      expect((error as Error).message).to.equal(`Failed to read file content: nonexistentfile.json`)
    }
  })

  it('should correctly parse valid JSON content', () => {
    const mockContent = '{"name":"John","age":30,"city":"New York"}'
    const expectedOutput = { name: 'John', age: 30, city: 'New York' }

    const result = fileSystem.processFileContent<typeof expectedOutput>(mockContent)
    expect(result).to.deep.equal(expectedOutput)
  })

  it('should throw an error for invalid JSON content', () => {
    // Missing quote -> "name":"John <--
    const mockContent = '{"name":"John,"age":30,"city":"New York"}'
    const expectedOutput = { name: 'John', age: 30, city: 'New York' }

    expect(() => fileSystem.processFileContent<typeof expectedOutput>(mockContent)).to.throw()
  })

  it('should correctly return the extension for files of interest', () => {
    expect(fileSystem.getExtension('document.md')).to.be.equal('.md')
    expect(fileSystem.getExtension('diagram.bpmn')).to.be.equal('.bpmn')
  })

  it('should return undefined for files not of interest', () => {
    expect(fileSystem.getExtension('image.ts')).to.be.equal(undefined)
    expect(fileSystem.getExtension('audio.yml')).to.be.equal(undefined)
  })

  it('should handle filenames without extensions', () => {
    expect(fileSystem.getExtension('README')).to.be.equal(undefined)
  })

  it('should return true for files of interest', () => {
    expect(fileSystem.isFileOfInterest('document.md')).to.be.equal(true)
    expect(fileSystem.isFileOfInterest('diagram.bpmn')).to.be.equal(true)
  })

  it('should return false for files not of interest', () => {
    expect(fileSystem.isFileOfInterest('image.png')).to.be.equal(false)
    expect(fileSystem.isFileOfInterest('audio.mp3')).to.be.equal(false)
  })

  it('should handle filenames without extensions', () => {
    expect(fileSystem.isFileOfInterest('README')).to.be.equal(false)
  })
})

describe('Folder Validation', () => {
  let readDirectoryStub: SinonStub
  let manager: FileSystemManager

  setup(() => {
    const workspaceFs = { ...workspace.fs }

    // Stubbing for readDirectory
    readDirectoryStub = stub(workspaceFs, 'readDirectory')
    readDirectoryStub
      .withArgs(match((uri: Uri) => uri.fsPath.endsWith('/test-directory')))
      .resolves([
        ['file1.txt', FileType.File],
        ['subdir', FileType.Directory],
      ])

    readDirectoryStub
      .withArgs(match((uri: Uri) => uri.fsPath.endsWith('/empty-directory')))
      .resolves([])

    readDirectoryStub.rejects(new Error('Directory not found'))

    manager = new FileSystemManager(workspaceFs)
  })

  teardown(() => {
    readDirectoryStub.restore()
  })

  it('should correctly read the directory content', async () => {
    const result = await manager.retrieveNonIgnoredEntries('/test-directory')

    expect(result).to.deep.equal([
      ['file1.txt', FileType.File],
      ['subdir', FileType.Directory],
    ])
  })

  it('should return an empty array for an empty directory', async () => {
    const result = await manager.retrieveNonIgnoredEntries('/empty-directory')
    expect(result).to.deep.equal([])
  })
})

describe('File Writing', () => {
  let writeFileStub: SinonStub
  let errorOutputStub: SinonStub
  let fileSystem: FileSystemManager
  let fsWrapper

  before(() => {
    ErrorManager.initialize()
  })

  setup(() => {
    fsWrapper = {
      ...workspace.fs,
      writeFile: async (uri: Uri, content: Uint8Array) => {
        return workspace.fs.writeFile(uri, content)
      },
    }

    writeFileStub = stub(fsWrapper, 'writeFile')
    errorOutputStub = stub(ErrorManager, 'outputError')

    fileSystem = new FileSystemManager(fsWrapper)
  })

  teardown(() => {
    writeFileStub.restore()
    errorOutputStub.restore()
  })

  it('should handle write errors gracefully', async () => {
    writeFileStub.rejects(new Error('Some write error'))

    await fileSystem.writeFile('some/file/path', 'some content')

    assert.calledWith(
      errorOutputStub,
      'Failed to write to file: some/file/path. Error: Some write error'
    )
  })

  it('should write to the file successfully', async () => {
    const uri = Uri.file('some/file/path.txt')
    const content = 'Hello, world!'

    await fileSystem.writeFile(uri.fsPath, content)

    assert.calledWith(
      writeFileStub,
      uri,
      match.instanceOf(Buffer).and(match.has('length', Buffer.from(content).length))
    )
  })
})
