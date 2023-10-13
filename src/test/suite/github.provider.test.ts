import { assert } from 'chai'
import { match, stub } from 'sinon'
import { GithubProvider } from '../../provider/github.provider'
import { describe, it } from 'mocha'

describe('GithubProvider', function () {
  describe('should get documentation .md github', function () {
    it('should fetch and return documentation from GitHub', async function () {
      const getContentGithubStub = stub()
      getContentGithubStub.resolves([
        {
          type: 'file',
          name: 'example.md',
          download_url: 'https://example.com/example.md',
        },
      ])

      const readFileGithubStub = stub()
      readFileGithubStub
        .withArgs(
          match({
            type: 'file',
            name: 'example.md',
            download_url: 'https://example.com/example.md',
          })
        )
        .resolves({ type: '.md', name: 'example.md', content: 'Mocked file', path: 'path.com' })

      const githubProvider = new GithubProvider(['https://github.com/owner/repo'])

      githubProvider.getRepoContent = getContentGithubStub
      githubProvider.getFile = readFileGithubStub
      const result = await githubProvider.getDocumentations()

      assert.isArray(result)
      assert.lengthOf(result, 1)
      assert.deepEqual(result[0], {
        type: '.md',
        name: 'example.md',
        content: 'Mocked file',
        path: 'path.com',
      })
    })

    it('should fetch and return list documentation from GitHub', async function () {
      const getContentGithubStub = stub()
      getContentGithubStub.resolves([
        {
          type: 'file',
          name: 'example.md',
          url: 'https://example.com/example.md',
        },
        {
          type: 'file',
          name: 'example2.md',
          download_url: 'https://example.com/example2.md',
        },
      ])

      const readFileGithubStub = stub()

      readFileGithubStub
        .onFirstCall()
        .resolves({ type: '.md', name: 'example.md', content: 'Mocked file 1', path: 'path.com' })
        .onSecondCall()
        .resolves({ type: '.md', name: 'example2.md', content: 'Mocked file 2', path: 'path.com' })

      const githubProvider = new GithubProvider(['https://github.com/owner/repo'])

      githubProvider.getRepoContent = getContentGithubStub
      githubProvider.getFile = readFileGithubStub
      const result = await githubProvider.getDocumentations()

      assert.isArray(result)
      assert.lengthOf(result, 2)
      assert.deepEqual(result[0], {
        type: '.md',
        name: 'example.md',
        content: 'Mocked file 1',
        path: 'path.com',
      })
      assert.deepEqual(result[1], {
        type: '.md',
        name: 'example2.md',
        content: 'Mocked file 2',
        path: 'path.com',
      })
    })
    it('should fetch and return list documentation from the file and all the files in the folder', async function () {
      const getContentGithubStub = stub()
      getContentGithubStub
        .onFirstCall()
        .resolves([
          {
            type: 'dir',
            name: 'example',
            url: 'https://example.com/?ref=main',
          },
          {
            type: 'file',
            name: 'example.md',
            url: 'https://example.com/example.md',
          },
        ])
        .onSecondCall()
        .resolves([
          {
            type: 'file',
            name: 'example2.md',
            url: 'https://example.com/example2.md',
          },
          {
            type: 'file',
            name: 'example3.md',
            url: 'https://example.com/example3.md',
          },
        ])

      const readFileGithubStub = stub()

      readFileGithubStub
        .onFirstCall()
        .resolves({ type: '.md', name: 'example.md', content: 'Mocked file 1', path: 'path.com' })
        .onSecondCall()
        .resolves({ type: '.md', name: 'example2.md', content: 'Mocked file 2', path: 'path.com' })
        .onThirdCall()
        .resolves({ type: '.md', name: 'example3.md', content: 'Mocked file 3', path: 'path.com' })

      const githubProvider = new GithubProvider(['https://github.com/owner/repo'])

      githubProvider.getRepoContent = getContentGithubStub
      githubProvider.getFile = readFileGithubStub
      const result = await githubProvider.getDocumentations()

      assert.isArray(result)
      assert.lengthOf(result, 3)
      assert.deepEqual(result[0], {
        type: '.md',
        name: 'example.md',
        content: 'Mocked file 1',
        path: 'path.com',
      })
      assert.deepEqual(result[1], {
        type: '.md',
        name: 'example2.md',
        content: 'Mocked file 2',
        path: 'path.com',
      })
      assert.deepEqual(result[2], {
        type: '.md',
        name: 'example3.md',
        content: 'Mocked file 3',
        path: 'path.com',
      })
    })
  })
})
