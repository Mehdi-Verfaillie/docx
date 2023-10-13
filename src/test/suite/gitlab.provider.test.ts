import { assert } from 'chai'
import { match, stub } from 'sinon'
import { GitlabProvider } from '../../provider/gitlab.provider'
import { describe, it } from 'mocha'

describe('GitlabProvider', function () {
  describe('should get documentation .md from GitLab', function () {
    it('should fetch and return documentation from GitLab', async function () {
      const getContentGitlabStub = stub()
      getContentGitlabStub.resolves([
        {
          type: 'blob',
          name: 'example.md',
        },
      ])

      const readFileGitlabStub = stub()
      readFileGitlabStub
        .withArgs(
          match({
            type: 'blob',
            name: 'example.md',
          })
        )
        .resolves({ type: '.md', name: 'example.md', content: 'Mocked file', path: 'path.com' })

      const gitlabProvider = new GitlabProvider(['https://gitlab.com/owner/repo'])

      gitlabProvider.getRepoContent = getContentGitlabStub
      gitlabProvider.getFile = readFileGitlabStub
      const result = await gitlabProvider.getDocumentations()

      assert.isArray(result)
      assert.lengthOf(result, 1)
      assert.deepEqual(result[0], {
        type: '.md',
        name: 'example.md',
        content: 'Mocked file',
        path: 'path.com',
      })
    })
  })
})
