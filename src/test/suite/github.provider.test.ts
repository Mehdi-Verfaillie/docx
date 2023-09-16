import { assert } from 'chai'
import * as sinon from 'sinon'
import { GithubProvider } from '../../provider/github.provider'
import { describe, it } from 'mocha'

describe('GithubProvider', function () {
  describe('should get documentation .md github', function () {
    it('should fetch and return documentation from GitHub', async function () {
      const getContentGithubStub = sinon.stub()
      getContentGithubStub.resolves({
        data: [
          {
            type: 'file',
            name: 'example.md',
            download_url: 'https://example.com/example.md',
          },
        ],
      })

      const readFileGithubStub = sinon.stub()
      readFileGithubStub
        .withArgs(
          sinon.match({
            type: 'file',
            name: 'example.md',
            download_url: 'https://example.com/example.md',
          })
        )
        .resolves({ type: '.md', name: 'example.md', content: 'Mocked file' })

      const githubProvider = new GithubProvider(['https://github.com/owner/repo'])

      githubProvider.getContent = getContentGithubStub
      githubProvider.readFile = readFileGithubStub
      const result = await githubProvider.getDocumentations()

      assert.isArray(result)
      assert.lengthOf(result, 1)
      assert.deepEqual(result[0], {
        type: '.md',
        name: 'example.md',
        content: 'Mocked file',
      })
    })
  })
})
