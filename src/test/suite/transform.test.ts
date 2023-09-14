import { expect } from 'chai'
import { DataTransformManager } from '../../utils/transform.utils'
import { describe, it } from 'mocha'

describe('Data Sorter', () => {
  const transform = DataTransformManager

  it('should correctly sort data by type and then by name', () => {
    const inputData = [
      { name: 'a', type: 'md' },
      { name: 'b', type: 'txt' },
      { name: 'c', type: 'md' },
      { name: 'f', type: 'rtf' },
      { name: 'r', type: 'bpmn' },
      { name: 'e', type: 'md' },
      { name: 'p', type: 'md' },
      { name: 'm', type: 'bpmn' },
      { name: 'l', type: 'bpmn' },
    ]

    const sortedData = transform.sortDataByTypeAndName(inputData)

    const expectedData = [
      { name: 'l', type: 'bpmn' },
      { name: 'm', type: 'bpmn' },
      { name: 'r', type: 'bpmn' },
      { name: 'a', type: 'md' },
      { name: 'c', type: 'md' },
      { name: 'e', type: 'md' },
      { name: 'p', type: 'md' },
      { name: 'f', type: 'rtf' },
      { name: 'b', type: 'txt' },
    ]

    expect(sortedData).to.deep.equal(expectedData)
  })
})
