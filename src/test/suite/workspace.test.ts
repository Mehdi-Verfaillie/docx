import { Uri, window } from 'vscode'
import { expect } from 'chai'
import { describe, it, afterEach } from 'mocha'
import { WorkspaceManager } from '../../utils/workspace.utils'
import * as sinon from 'sinon'

describe('WorkspaceManager Tests', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('should return undefined when there is no active editor', async () => {
    sinon.stub(window, 'activeTextEditor').value(undefined)
    const path = WorkspaceManager.getCurrentUserPath()
    expect(path).to.be.equal(undefined)
  })

  it('should return the correct path when there is an active editor', async () => {
    const fakeDocument = {
      uri: Uri.file('/accountController.ts'),
    }
    const fakeEditor = {
      document: fakeDocument,
    }
    sinon.stub(window, 'activeTextEditor').value(fakeEditor)

    const path = WorkspaceManager.getCurrentUserPath()
    expect(path).to.equal('/accountController.ts')
  })
})
