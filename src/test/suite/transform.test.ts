import { expect } from 'chai'
import { DataTransformManager } from '../../utils/transform.utils'
import { describe, it } from 'mocha'
import { Documentation } from '../../association.manager'

describe('Data Sorter', () => {
  const transform = DataTransformManager

  it('should correctly sort data by type and then by name', () => {
    const inputData: Documentation[] = [
      { name: 'a', type: '.md', content: '' },
      // @ts-ignore
      { name: 'b', type: '.txt', content: '' },
      { name: 'c', type: '.md', content: '' },
      // @ts-ignore
      { name: 'f', type: '.rtf', content: '' },
      { name: 'r', type: '.bpmn', content: '' },
      { name: 'e', type: '.md', content: '' },
      { name: 'p', type: '.md', content: '' },
      { name: 'm', type: '.bpmn', content: '' },
      { name: 'l', type: '.bpmn', content: '' },
    ]

    const sortedData = transform.sortDataByTypeAndName(inputData)

    const expectedData: Documentation[] = [
      { name: 'l', type: '.bpmn', content: '' },
      { name: 'm', type: '.bpmn', content: '' },
      { name: 'r', type: '.bpmn', content: '' },
      { name: 'a', type: '.md', content: '' },
      { name: 'c', type: '.md', content: '' },
      { name: 'e', type: '.md', content: '' },
      { name: 'p', type: '.md', content: '' },
      // @ts-ignore
      { name: 'f', type: '.rtf', content: '' },
      // @ts-ignore
      { name: 'b', type: '.txt', content: '' },
    ]

    expect(sortedData).to.deep.equal(expectedData)
  })
})
