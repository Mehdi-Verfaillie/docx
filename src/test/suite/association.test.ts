import * as sinon from 'sinon'
import * as vscode from 'vscode'
import { describe, setup, teardown, it } from 'mocha'

describe('Associations JSON Validation', () => {
  let statStub: sinon.SinonStub
  let manager: AssociationsManager

  setup(() => {
    const workspaceFs = { ...vscode.workspace.fs }
    statStub = sinon.stub(workspaceFs, 'stat')

    statStub
      .withArgs(
        sinon.match((uri: vscode.Uri) => {
          return (
            uri.fsPath.endsWith('src') ||
            uri.fsPath.endsWith('src/Controllers') ||
            uri.fsPath.endsWith('src/Modules') ||
            uri.fsPath.endsWith('src/Utils/dates.ts')
          )
        })
      )
      .resolves()

    statStub.rejects(new Error('File not found'))

    const baseDir = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath ?? ''
    manager = new AssociationsManager(baseDir, statStub)
  })

  teardown(() => statStub.restore())
})
