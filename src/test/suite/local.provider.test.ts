import { describe, it } from 'mocha'
import * as sinon from 'sinon'
import { expect } from 'chai'
import * as vscode from 'vscode'
import { FileSystemManager } from '../../utils/fileSystem.utils'

describe('fetchDocumentation', () => {
  let readDirectoryStub: sinon.SinonStub
  let readFileStub: sinon.SinonStub
  let manager: FileSystemManager

  setup(() => {
    const workspaceFs = { ...vscode.workspace.fs }

    // Stubbing for readDirectory
    readDirectoryStub = sinon.stub(workspaceFs, 'readDirectory')
    readDirectoryStub
      .withArgs(sinon.match((uri: vscode.Uri) => uri.fsPath.endsWith('/test-directory')))
      .resolves([
        ['document.md', vscode.FileType.File],
        ['diagram.bpmn', vscode.FileType.File],
      ])

    // Stubbing for readFile
    readFileStub = sinon.stub(workspaceFs, 'readFile')
    readFileStub
      .withArgs(vscode.Uri.file('/test-directory/document.md'))
      .resolves(new Uint8Array(Buffer.from('MD Content')))
    readFileStub
      .withArgs(vscode.Uri.file('/test-directory/diagram.bpmn'))
      .resolves(new Uint8Array(Buffer.from('BPMN Content')))

    manager = new FileSystemManager(workspaceFs)
  })

  teardown(() => {
    readDirectoryStub.restore()
    readFileStub.restore()
  })

  it('should fetch documentation for files of interest', async () => {
    const result = await manager.fetchDocumentation(vscode.Uri.file('/test-directory'))

    expect(result).to.deep.equal([
      {
        name: 'document.md',
        type: '.md',
        content: 'MD Content',
      },
      {
        name: 'diagram.bpmn',
        type: '.bpmn',
        content: 'BPMN Content',
      },
    ])
  })

  it('should return an empty array if no documentation files are found', async () => {
    readDirectoryStub
      .withArgs(sinon.match((uri: vscode.Uri) => uri.fsPath.endsWith('/empty-directory')))
      .resolves([])

    const result = await manager.fetchDocumentation(vscode.Uri.file('/empty-directory'))
    expect(result).to.deep.equal([])
  })
})
