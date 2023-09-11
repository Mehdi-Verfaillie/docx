import { expect } from 'chai'
import * as sinon from 'sinon'
import * as vscode from 'vscode'
import { describe, setup, teardown, it } from 'mocha'
import { FileManager } from '../../utils/files.utils'

describe('File Validation', () => {
  let readFileStub: sinon.SinonStub
  let statStub: sinon.SinonStub
  let manager: FileManager

  const jsonMock =
    '{"associations":{"src":["/docx/ifTernary.md","/docx/asyncAwait.md"],"src/Controllers":["/docx/controllers.md"],"src/Modules":["/docx/modules.md"],"src/Utils/dates.ts":["/docx/utils/dates.md"]}}'

  setup(() => {
    const workspaceFs = { ...vscode.workspace.fs }

    // Stubbing for readFile
    readFileStub = sinon.stub(workspaceFs, 'readFile')
    readFileStub
      .withArgs(sinon.match((uri: vscode.Uri) => uri.fsPath.endsWith('association.json')))
      .resolves(new Uint8Array(Buffer.from(jsonMock)))
    readFileStub.rejects(new Error('File not found'))

    // Stubbing for stat
    statStub = sinon.stub(workspaceFs, 'stat')
    statStub
      .withArgs(sinon.match((uri: vscode.Uri) => uri.fsPath.endsWith('association.json')))
      .resolves()
    statStub.rejects(new Error('File not found'))

    manager = new FileManager(workspaceFs)
  })

  teardown(() => {
    readFileStub.restore()
    statStub.restore()
  })

  it('should return true if the file exists', async () => {
    const result = await manager.ensureFileExists('association.json')
    expect(result).to.be.equal(true)
  })

  it('should return false if the file does not exist', async () => {
    const result = await manager.ensureFileExists('nonexistentfile.json')
    expect(result).to.be.equal(false)
  })

  it('should throw a FileSystemError for unexpected errors', async () => {
    try {
      // @ts-expect-error
      await manager.ensureFileExists(undefined)
      expect.fail('Expected ensureFileExists to throw, but it did not.')
    } catch (error) {
      expect(error as Error).to.be.instanceOf(vscode.FileSystemError)
    }
  })

  it('should retrieve the file content successfully', async () => {
    const result = await manager.getFileContent('association.json')
    expect(result).to.be.equal(jsonMock)
  })

  it('should throw an error if reading the file fails', async () => {
    try {
      await manager.getFileContent('nonexistentfile.json')
      expect.fail('Expected getFileContent to throw, but it did not.')
    } catch (error) {
      expect((error as Error).message).to.equal(`Failed to read file content: nonexistentfile.json`)
    }
  })
})
