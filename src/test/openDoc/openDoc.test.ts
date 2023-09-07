import { describe, it } from 'mocha'
import * as assert from 'assert'
import DocumentFactory from '../../factory/doc.factory'

import path = require('path')

const documentFactory = new DocumentFactory()
describe('Test documentation', function () {
  this.timeout(20000)
  it('get local documentation', async () => {
    const url = path.join(__dirname, '..', '..', '..', 'README.md')
    const res = await documentFactory.getDoc({ url: url, type: 'local' })
    assert.notEqual(res, 'error')
  })

  it('fail get local documentation', async () => {
    const url = 'xxxxx'
    const res = await documentFactory.getDoc({ url: url, type: 'local' })
    assert.equal(res, 'error')
  })

  it('get remote github documentation', async () => {
    const url = 'https://api.github.com/repos/jeremyschiap/test-repo/contents/README.md'
    const res = await documentFactory.getDoc({ url: url, type: 'remote' })
    assert.notEqual(res, 'error')
  })
  it('fail get remote documentation', async () => {
    const url = 'xxxxx'
    const res = await documentFactory.getDoc({ url: url, type: 'remote' })
    assert.equal(res, 'error')
  })
})
