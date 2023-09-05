import { describe, it } from 'mocha'
import * as assert from 'assert'
import { getLocalDoc } from '../../provider/local/local.documentation'
import { getGithubDoc } from '../../provider/remote/github/github.documentation'

describe('Test documentation', function () {
  this.timeout(20000)
  it('get local documentation', async () => {
    const url = '/Users/vincentli/Documents/GitHub/docx/README.md'
    const res = await getLocalDoc(url)
    assert.equal(typeof res, 'string')
  })
  it('get github documentation', async () => {
    const url = 'https://api.github.com/repos/jeremyschiap/test-repo/readme'
    const res = await getGithubDoc(url)
    assert.equal(typeof res, 'string')
  })
  it('get github documentation with wrong url ', async () => {
    const url = 'https://asspi.github.com/repos/jere????myschiap/test-repo/readme'
    const res = await getGithubDoc(url)
    assert.equal(res.code, 'ERR_BAD_REQUEST')
  })
})
