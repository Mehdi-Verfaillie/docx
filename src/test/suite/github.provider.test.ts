// import { describe, it } from 'mocha'
// import { expect } from 'chai'
// import { RepositoryFactory } from '../../api/repository.factory'
// import * as vscode from 'vscode'

// describe('Test documentation', function () {
//   this.timeout(20000)
//   const url = 'https://api.github.com/repos/jeremyschiap/test-repo/contents/README.md'
//   const repositoryFactory = new RepositoryFactory([
//     {
//       type: 'github',
//       repositories: [url],
//     },
//   ])

//   it('should get github documentation', async () => {
//     const uri = vscode.Uri.parse(url)
//     const res = await repositoryFactory.getDocumentations(uri)

//     expect(res[0]).to.have.property('content')
//     expect(res[0]).to.have.property('name')
//     expect(res[0]).to.have.property('type')
//   })

//   it('should fail to get github documentation', async () => {
//     const urlFake = 'https://api.github.com/repos/jerededed'
//     const uri = vscode.Uri.parse(urlFake)
//     const res = await repositoryFactory.getDocumentations(uri)
//     const test = { name: 'FileNotFound', content: 'FileNotFound', type: 'md' }

//     expect(res[0].content).to.equal(test.content)
//     expect(res[0].name).to.equal(test.name)
//   })
// })
