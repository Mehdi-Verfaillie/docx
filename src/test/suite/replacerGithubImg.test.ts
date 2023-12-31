import { expect } from 'chai'
import { describe, it } from 'mocha'
import { ReplacerTextProvider } from '../../utils/replacerText.utils'
import { ReplacerGithubImg } from '../../utils/replacerGithubImg'
import sinon = require('sinon')

describe('Replacer github image', () => {
  it('should transform markdown local github image to github url html image tag', async () => {
    const replacerGithubImg = new ReplacerGithubImg(
      'https://github.com/user/repo',
      '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'
    )
    const getGithubFileStub = sinon.stub(replacerGithubImg, 'getGithubFile')

    getGithubFileStub.resolves({
      download_url: 'https://raw.githubusercontent.com/user/repo/main/image.jpg',
    })

    const content = 'Some text ![alt text](/image.jpg) some more text'
    const result = await replacerGithubImg.replace(content)

    getGithubFileStub.restore()

    expect(result).to.include(
      'Some text <img src="https://raw.githubusercontent.com/user/repo/main/image.jpg"/> some more text'
    )
  })

  it('should keep markdown external image links unchanged', async () => {
    const imageParse = new ReplacerTextProvider('https://github.com/user/repo')
    const content = 'Some text ![alt text](https://external.com/image.jpg) some more text'
    const result = await imageParse.replacer(content)
    expect(result).to.include(
      'Some text <img src="https://external.com/image.jpg"/> some more text'
    )
  })

  it('should keep external image with github  links unchanged', async () => {
    const imageParse = new ReplacerTextProvider('https://github.com/user/repo')
    const content = '<img src="https://github.com/image.jpg"/>'
    const result = await imageParse.replacer(content)

    expect(result).to.include('<img src="https://github.com/image.jpg"/>')
  })

  it('should transform relative paths in HTML image tags', async () => {
    const replacerGithubImg = new ReplacerGithubImg(
      'https://github.com/user/repo',
      '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'
    )
    const getGithubFileStub = sinon.stub(replacerGithubImg, 'getGithubFile')

    getGithubFileStub.resolves({
      download_url: 'https://raw.githubusercontent.com/user/repo/main/image.jpg',
    })

    const content = "<img src='/image.jpg'>"
    const result = await replacerGithubImg.replace(content)

    getGithubFileStub.restore()
    expect(result).to.include(
      '<img src="https://raw.githubusercontent.com/user/repo/main/image.jpg"/>'
    )
  })

  it('should keep HTML image tags with external links unchanged', async () => {
    const replacerGithubImg = new ReplacerGithubImg(
      'https://github.com/user/repo',
      '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'
    )

    const content = '<img src="https://external.com/image.jpg"/>'
    const result = await replacerGithubImg.replace(content)

    expect(result).to.include('<img src="https://external.com/image.jpg"/>')
  })
})

describe('Markdown Image Regex', function () {
  const markdownImageRegex = /!\[[^\]]*\]\(([^)]+)\)/g

  it('should match markdown image syntax', function () {
    const input = 'ssssss sssss ![alt text](https://github.com/image.jpg) xxxxxxxxx'
    const matches = input.match(markdownImageRegex)
    expect(matches?.[0]).to.equal('![alt text](https://github.com/image.jpg)')
  })

  it('should not match non-markdown image syntax', function () {
    const input = '<img src="https://github.com/image.jpg"/>'
    const matches = input.match(markdownImageRegex)
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(matches).to.be.null
  })
})

describe('HTML Image Regex', function () {
  const htmlImageRegex = /<img src='([^']*)'(?:\s+alt='([^']*)')?\s*\/?>/g

  it('should match HTML image tag', function () {
    const input = "xxxxxxxx <img src='https://github.com/image.jpg' alt='image'/> xxxxxxxx "
    const matches = input.match(htmlImageRegex)

    expect(matches?.[0]).to.equal("<img src='https://github.com/image.jpg' alt='image'/>")
  })

  it('should not match non-HTML image tag', function () {
    const input = '![alt text](https://github.com/image.jpg)'
    const matches = input.match(htmlImageRegex)
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(matches).to.be.null
  })
})
