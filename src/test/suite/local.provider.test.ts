import { describe, it, setup, teardown } from 'mocha'
import * as sinon from 'sinon'
import { expect } from 'chai'
import * as vscode from 'vscode'
import { FileSystemManager } from '../../utils/fileSystem.utils'

describe('fetchDocumentation', () => {
  let fileSystem: FileSystemManager

  setup(() => {
    fileSystem = new FileSystemManager()

    sinon
      .stub(fileSystem, 'readDirectory')
      .withArgs(vscode.Uri.file('/test-directory').fsPath)
      .resolves([
        ['document.md', vscode.FileType.File],
        ['diagram.bpmn', vscode.FileType.File],
      ])

    sinon
      .stub(fileSystem, 'readFile')
      .withArgs(vscode.Uri.file('/test-directory/document.md').fsPath)
      .resolves(Buffer.from('MD Content').toString())
      .withArgs(vscode.Uri.file('/test-directory/diagram.bpmn').fsPath)
      .resolves(Buffer.from('BPMN Content').toString())
  })

  teardown(() => sinon.restore())

  it('should fetch documentation for files of interest', async () => {
    const result = await fileSystem.fetchDocumentation(vscode.Uri.file('/test-directory'))
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
    const result = await fileSystem.fetchDocumentation(vscode.Uri.file('/empty-directory'))
    expect(result).to.deep.equal([])
  })
})
