import { expect } from 'chai'
import { describe, it } from 'mocha'
import { FormatterContent } from '../../utils/formatterContent'

describe('Formatter gitlab image', () => {
  it('should transform markdown local gitlab image to gitlab url html image tag', async () => {
    const imageParse = new FormatterContent('https://gitlab.com/user/repo')
    const content = 'Some text ![alt text](/image.jpg) some more text'
    const result = imageParse.formatter(content)

    expect(result).to.include(
      'Some text <img src="https://gitlab.com/user/repo/-/raw/main/image.jpg"> some more text'
    )
  })

  it('should transform relative paths in HTML image tags', async () => {
    const imageParse = new FormatterContent('https://gitlab.com/user/repo')
    const content = "<img src='/image.jpg'>"
    const result = imageParse.formatter(content)
    expect(result).to.include('<img src="https://gitlab.com/user/repo/-/raw/main/image.jpg">')
  })
})
