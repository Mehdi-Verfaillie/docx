import { expect } from 'chai'
import * as sinon from 'sinon'
import * as vscode from 'vscode'
import { describe, setup, teardown, it } from 'mocha'
import { JsonConfig, AssociationsManager } from '../../association'

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
    const jsonConfig = JSON.parse(jsonMock) as JsonConfig
    const definedDirectories = Object.keys(jsonConfig.associations)

    const results = await manager.directoriesExist(definedDirectories)

    results.forEach((result) => {
      expect(result.exists, `Directory ${result.directory} does not exist`).to.equal(true)
    })
  })

  it('should ensure all defined documentations exist', async () => {
    const jsonConfig = JSON.parse(jsonMock) as JsonConfig
    const results = await manager.documentationsExist(jsonConfig.associations)

    results.forEach((result) => {
      expect(result.exists, `Documentation ${result.documentation} does not exist`).to.equal(true)
    })
  })
})
