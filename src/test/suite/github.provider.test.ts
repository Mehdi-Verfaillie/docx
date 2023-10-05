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

    it('should fetch and return list documentation from GitHub', async function () {
      const getContentGithubStub = sinon.stub()
      getContentGithubStub.resolves({
        data: [
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
        ],
      })

      const readFileGithubStub = sinon.stub()

      readFileGithubStub
        .onFirstCall()
        .resolves({ type: '.md', name: 'example.md', content: 'Mocked file 1' })
        .onSecondCall()
        .resolves({ type: '.md', name: 'example2.md', content: 'Mocked file 2' })

      const githubProvider = new GithubProvider(['https://github.com/owner/repo'])

      githubProvider.getContent = getContentGithubStub
      githubProvider.readFile = readFileGithubStub
      const result = await githubProvider.getDocumentations()

      assert.isArray(result)
      assert.lengthOf(result, 2)
      assert.deepEqual(result[0], {
        type: '.md',
        name: 'example.md',
        content: 'Mocked file 1',
      })
      assert.deepEqual(result[1], {
        type: '.md',
        name: 'example2.md',
        content: 'Mocked file 2',
      })
    })
    it('should fetch and return list documentation from the file and all the files in the folder', async function () {
      const getContentGithubStub = sinon.stub()
      getContentGithubStub
        .onFirstCall()
        .resolves({
          data: [
            {
              type: 'file',
              name: 'example.md',
              url: 'https://example.com/example.md',
            },
            {
              type: 'dir',
              name: 'example',
              url: 'https://example.com/?ref=main',
            },
          ],
        })
        .onSecondCall()
        .resolves({
          data: [
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
          ],
        })

      const readFileGithubStub = sinon.stub()

      readFileGithubStub
        .onFirstCall()
        .resolves({ type: '.md', name: 'example.md', content: 'Mocked file 1' })
        .onSecondCall()
        .resolves({ type: '.md', name: 'example2.md', content: 'Mocked file 2' })
        .onThirdCall()
        .resolves({ type: '.md', name: 'example3.md', content: 'Mocked file 3' })

      const githubProvider = new GithubProvider(['https://github.com/owner/repo'])

      githubProvider.getContent = getContentGithubStub
      githubProvider.readFile = readFileGithubStub
      const result = await githubProvider.getDocumentations()

      assert.isArray(result)
      assert.lengthOf(result, 3)
      assert.deepEqual(result[0], {
        type: '.md',
        name: 'example.md',
        content: 'Mocked file 1',
      })
      assert.deepEqual(result[1], {
        type: '.md',
        name: 'example2.md',
        content: 'Mocked file 2',
      })
      assert.deepEqual(result[2], {
        type: '.md',
        name: 'example3.md',
        content: 'Mocked file 3',
      })
    })
  })
})
