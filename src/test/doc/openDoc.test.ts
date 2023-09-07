import { describe, it } from 'mocha'
import * as assert from 'assert'
import { getLocalDoc } from '../../provider/local/local.documentation'

describe('Test documentation', function () {
  this.timeout(20000)
  it('get local documentation', async () => {
    const url = '/Users/vincentli/Documents/GitHub/docx/README.md'
    const res = await getLocalDoc(url)
    assert.equal(typeof res, 'string')
  })
})
