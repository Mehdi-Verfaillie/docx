import { expect } from 'chai'
import { describe, it } from 'mocha'
import { ReplacerTextProvider } from '../../utils/replacerText.utils'

describe('Replacer gitlab image', () => {
  it('should transform markdown local gitlab image to gitlab url html image tag', async () => {
    const imageParse = new ReplacerTextProvider('https://gitlab.com/user/repo')
    const content = 'Some text ![alt text](/image.jpg) some more text'
    const result = await imageParse.replacer(content)

    expect(result).to.include(
      'Some text <img src="data:image/png;base64,eyJtZXNzYWdlIjoiNDA0IFByb2plY3QgTm90IEZvdW5kIn0="/> some more text'
    )
  })

  it('should transform relative paths in HTML image tags', async () => {
    const imageParse = new ReplacerTextProvider('https://gitlab.com/user/repo')
    const content = "<img src='/image.jpg'>"
    const result = await imageParse.replacer(content)
    expect(result).to.include(
      '<img src="data:image/png;base64,eyJtZXNzYWdlIjoiNDA0IFByb2plY3QgTm90IEZvdW5kIn0="/>'
    )
  })
})
