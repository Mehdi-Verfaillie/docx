import { describe, it } from 'mocha'

// import path = require('path')
// import { RepositoryFactory } from '../../api/repository.factory'
// import { LocalProvider } from '../../provider/local.provider'
// import { Uri } from 'vscode'
// import { WorkspaceManager } from '../../utils/workspace.utils'
import { FileManager, ProjectStructure } from '../../utils/files.utils'
// import * as sinon from 'sinon'
import { expect } from 'chai'
// import * as vscode from 'vscode'

describe('Test local documentation', function () {
  this.timeout(20000)
  // let localProvider: sinon.SinonStubbedInstance<LocalProvider>
  // let localProvider: sinon.SinonStubbedInstance<LocalProvider>
  // let fileManagerStub: sinon.SinonStubbedInstance<FileManager>

  // setup(() => {
  //   fileManagerStub = sinon.createStubInstance(FileManager)
  //   localProvider = sinon.createStubInstance(LocalProvider)

  //   localProvider.getDocumentations
  //     .withArgs(
  //       sinon.match((uri: Uri) => {
  //         return (
  //           // Folder structure mock
  //           uri.fsPath.endsWith('/docx/') ||
  //           // Documentations mock
  //           uri.fsPath.endsWith('/docx/ifTernary.md') ||
  //           uri.fsPath.endsWith('/docx/asyncAwait.md') ||
  //           uri.fsPath.endsWith('/docx/controllers.md') ||
  //           uri.fsPath.endsWith('/docx/modules.md') ||
  //           uri.fsPath.endsWith('/docx/general.md') ||
  //           uri.fsPath.endsWith('/docx/utils/dates.md')
  //         )
  //       })
  //     )
  //     .resolves()
  //   fileManagerStub.getFiles.resolves([{}])

  //   const baseDir = WorkspaceManager.getWorkspaceFolder()
  //   localProvider = new LocalProvider(baseDir, fileManagerStub)
  // })

  const fileManager = new FileManager()
  const fakeProjectStructure: ProjectStructure = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'CHANGELOG.md': {
      text: 'test',
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'test.md': {
      text: 'eeeeee',
    },
    'document': {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'eeee.md': {
        text: 'vvvvv',
      },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'xxxx.md': {
        text: 'wwww',
      },
    },
  }
  // it('should return project structure ', async () => {
  //   const f = fileManager.mapStructure('User/Project/docx/')
  //   expect(JSON.stringify(f)).to.equal(JSON.stringify(fakeProjectStructure))
  // })
  it('should return all md file', async () => {
    const test2 = [
      {
        name: 'CHANGELOG.md',
        content: 'test',
        type: 'md',
      },
      {
        name: 'test.md',
        content: 'eeeeee',
        type: 'md',
      },
      {
        name: 'eeee.md',
        content: 'vvvvv',
        type: 'md',
      },
      {
        name: 'xxxx.md',
        content: 'wwww',
        type: 'md',
      },
    ]

    const f = fileManager.filterMarkdownFiles(fakeProjectStructure)
    expect(JSON.stringify(f)).to.equal(JSON.stringify(test2))
  })
})

//Recuperer l'architecture du projet  dans un objet
// Fonction permettant de parcourir le projet et recuperer un type de fichier
// Chaque fichier sera envoyé dans un tableau avec un objet type documentation
// renvoyé

//Test 1 : test la fonction de recuperation en etant sur qu'il recupere  que des fichier readme

// si le path du dossier est correct

// si le dossier existe

// si la valeur retourné est sous le bon format

// si il retournela bonne structure
// si il retourne les fichier readme.me
// si il retourne les bon fichier
