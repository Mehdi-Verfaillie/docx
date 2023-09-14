import { expect } from 'chai'
import { sortDataByTypeAndName } from '../../utils/nomalize.utils'
import { describe, it } from 'mocha'

describe('Data Sorter', () => {
  it('should correctly sort data by type and then by name', () => {
    const inputData = [
      { name: 'a', type: 'md' },
      { name: 'b', type: 'txt' },
      { name: 'c', type: 'md' },
    ]

    const sortedData = sortDataByTypeAndName(inputData)

    const expectedData = [
      { name: 'a', type: 'md' },
      { name: 'c', type: 'md' },
      { name: 'b', type: 'txt' },
    ]

    expect(sortedData).to.deep.equal(expectedData)
  })
})
