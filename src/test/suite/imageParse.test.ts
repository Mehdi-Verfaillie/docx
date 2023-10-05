import { expect } from 'chai'
import { describe, it } from 'mocha'
import { ImageParse } from '../../utils/imageParse.utils'

describe('ImageParse', () => {
  it('should transform markdown local github image  to github url html image tag', async () => {
    const imageParse = new ImageParse('https://github.com/user/repo')
    const content = 'Some text ![alt text](/image.jpg) some more text'
    const result = imageParse.parseImageContent(content)

    expect(result).to.include(
      '<img src="https://raw.githubusercontent.com/user/repo/main/image.jpg" alt="alt text">'
    )
  })

  it('should keep markdown external image links unchanged', async () => {
    const imageParse = new ImageParse('https://github.com/user/repo')
    const content = 'Some text ![alt text](https://external.com/image.jpg) some more text'
    const result = imageParse.parseImageContent(content)
    expect(result).to.include('<img src="https://external.com/image.jpg" alt="alt text">')
  })

  it('should keep markdown external image  github links unchanged', async () => {
    const imageParse = new ImageParse('https://notgithub.com/user/repo')
    const content = 'Some text ![alt text](https://github.com/image.jpg) some more text'
    const result = imageParse.parseImageContent(content)
    expect(result).to.include('<img src="https://github.com/image.jpg" alt="alt text">')
  })
  it('should keep external image with github  links unchanged', async () => {
    const imageParse = new ImageParse('https://github.com/user/repo')
    const content =
      "Some text <img src='https://github.com/image.jpg' alt='an image'> some more text"
    const result = imageParse.parseImageContent(content)
    expect(result).to.include('<img src="https://github.com/image.jpg" alt="an image">')
  })

  it('should transform relative paths in HTML image tags', async () => {
    const imageParse = new ImageParse('https://github.com/user/repo')
    const content = "Some text <img src='/image.jpg' alt='an image'> some more text"
    const result = imageParse.parseImageContent(content)
    expect(result).to.include(
      '<img src="https://raw.githubusercontent.com/user/repo/main/image.jpg" alt="an image">'
    )
  })

  it('should keep HTML image tags with external links unchanged', async () => {
    const imageParse = new ImageParse('https://github.com/user/repo')
    const content =
      "Some text <img src='https://external.com/image.jpg' alt='an image'> some more text"
    const result = imageParse.parseImageContent(content)
    expect(result).to.include('<img src="https://external.com/image.jpg" alt="an image">')
  })
})
