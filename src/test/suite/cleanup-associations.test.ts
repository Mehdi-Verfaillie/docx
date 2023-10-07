/* eslint-disable @typescript-eslint/naming-convention */
import * as assert from 'assert'
import { cleanupAssociations } from '../../utils/cleanup-associations.utils'

suite('Cleanup Associations Test Suite', () => {
  test('Should remove empty associations', () => {
    const associations = {
      'src': ['/documentations/ifTernary.md', '/documentations/asyncAwait.md'],
      'src/Controllers': [],
      'src/Modules': ['/documentations/modules.md'],
      'src/Utils/dates.ts': [],
    }

    const expected = {
      'src': ['/documentations/ifTernary.md', '/documentations/asyncAwait.md'],
      'src/Modules': ['/documentations/modules.md'],
    }

    const result = cleanupAssociations(associations)
    assert.deepStrictEqual(result, expected)
  })
})
