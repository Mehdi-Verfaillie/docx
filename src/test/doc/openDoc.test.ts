import { describe, it } from 'mocha'
import * as assert from 'assert'
import { getLocalDoc } from '../../provider/local/local.documentation'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '../..', '.env') })

describe('Test documentation', function () {
  this.timeout(20000)
  it('get local documentation', async () => {
    const url = process.env.LOCAL_DOCUMENTATION_URL
    const res = await getLocalDoc(url)
    assert.equal(typeof res, 'string')
    assert.notEqual(res, 'error')
  })
  it('fail get local documentation', async () => {
    const url = process.env.LOCAL_DOCUMENTATION_URL + 'eeee'
    const res = await getLocalDoc(url)
    assert.equal(res, 'error')
  })
})
