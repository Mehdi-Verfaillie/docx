import { expect } from 'chai'
import { DataTransformManager } from '../../utils/transform.utils'
import { describe, it } from 'mocha'
import { Documentation } from '../../association.manager'

describe('Data Sorter', () => {
  const transform = DataTransformManager

  it('should correctly sort data by type and then by name', () => {
    const inputData: Documentation[] = [
      { name: 'a', path: 'a', type: '.md', content: '' },
      // @ts-ignore
      { name: 'b', path: 'b', type: '.txt', content: '' },
      { name: 'c', path: 'c', type: '.md', content: '' },
      // @ts-ignore
      { name: 'f', path: 'f', type: '.rtf', content: '' },
      { name: 'r', path: 'r', type: '.bpmn', content: '' },
      { name: 'e', path: 'e', type: '.md', content: '' },
      { name: 'p', path: 'p', type: '.md', content: '' },
      { name: 'm', path: 'm', type: '.bpmn', content: '' },
      { name: 'l', path: 'l', type: '.bpmn', content: '' },
    ]

    const sortedData = transform.sortDataByTypeAndName(inputData)

    const expectedData: Documentation[] = [
      { name: 'l', path: 'l', type: '.bpmn', content: '' },
      { name: 'm', path: 'm', type: '.bpmn', content: '' },
      { name: 'r', path: 'r', type: '.bpmn', content: '' },
      { name: 'a', path: 'a', type: '.md', content: '' },
      { name: 'c', path: 'c', type: '.md', content: '' },
      { name: 'e', path: 'e', type: '.md', content: '' },
      { name: 'p', path: 'p', type: '.md', content: '' },
      // @ts-ignore
      { name: 'f', path: 'f', type: '.rtf', content: '' },
      // @ts-ignore
      { name: 'b', path: 'b', type: '.txt', content: '' },
    ]

    expect(sortedData).to.deep.equal(expectedData)
  })

  it('should remove params from an url', () => {
    const url = 'https://test.com/test?param1=1&param2=2'
    const expectedUrl = 'https://test.com/test'

    const result = transform.removeQueryParamsFromUrl(url)

    expect(result).to.equal(expectedUrl)
  })
})
