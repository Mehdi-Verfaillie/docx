import { describe, it, setup, teardown } from 'mocha'
import * as sinon from 'sinon'
import { expect } from 'chai'
import * as vscode from 'vscode'
import { FileSystemManager } from '../../utils/fileSystem.utils'
import { LocalProvider } from '../../provider/local.provider'

describe('fetchDocumentation', () => {
  let fileSystem: FileSystemManager
  let localProvider: LocalProvider

  setup(() => {
    fileSystem = new FileSystemManager()
    localProvider = new LocalProvider(fileSystem)

    sinon
      .stub(fileSystem, 'readDirectory')
      .withArgs(vscode.Uri.file('/test-directory').fsPath)
      .resolves([
        ['document.md', vscode.FileType.File],
        ['diagram.bpmn', vscode.FileType.File],
        ['sub-directory', vscode.FileType.Directory],
      ])
      .withArgs(vscode.Uri.file('/test-directory/sub-directory').fsPath)
      .resolves([['nested-doc.md', vscode.FileType.File]])

    sinon
      .stub(fileSystem, 'readFile')
      .withArgs(vscode.Uri.file('/test-directory/document.md').fsPath)
      .resolves(Buffer.from('MD Content').toString())
      .withArgs(vscode.Uri.file('/test-directory/diagram.bpmn').fsPath)
      .resolves(Buffer.from('BPMN Content').toString())
      .withArgs(vscode.Uri.file('/test-directory/sub-directory/nested-doc.md').fsPath)
      .resolves(Buffer.from('Nested MD Content').toString())
  })

  teardown(() => sinon.restore())

  it('should fetch documentation for files of interest including nested directories', async () => {
    const result = await localProvider.fetchDocumentation(vscode.Uri.file('/test-directory'))
    expect(result).to.deep.equal([
      {
        name: '/test-directory/document.md',
        type: '.md',
        content: 'MD Content',
      },
      {
        name: '/test-directory/diagram.bpmn',
        type: '.bpmn',
        content: 'BPMN Content',
      },
      {
        name: '/test-directory/sub-directory/nested-doc.md',
        type: '.md',
        content: 'Nested MD Content',
      },
    ])
  })

  it('should return an empty array if no documentation files are found', async () => {
    const result = await localProvider.fetchDocumentation(vscode.Uri.file('/empty-directory'))
    expect(result).to.deep.equal([])
  })
})
