import { ErrorManager } from './error.utils'
import { ReplacerInterface } from './replacerText.utils'

export class ReplacerGithubImg implements ReplacerInterface {
  private username?: string
  private repo?: string
  private token?: string

  constructor(repository: string, token?: string) {
    const repoInfo = this.extractRepoParams(repository)
    if (!repoInfo || !repoInfo.username || !repoInfo.repo) {
      ErrorManager.outputError('Invalid repository information')
    }

    this.username = repoInfo?.username
    this.repo = repoInfo?.repo
    this.token = token
  }

  public replace = async (content: string): Promise<string> => {
    const replacements = [this.replaceMarkdownImg, this.replaceTagImg]

    let replacedContent = content
    for (const replacementFunction of replacements) {
      replacedContent = await replacementFunction(replacedContent)
    }

    return replacedContent
  }
  private replaceMarkdownImg = async (content: string): Promise<string> => {
    const markdownImageRegex = /!\[[^\]]*\]\(([^)]+)\)/g
    return await this.replaceToGithubImgTag(content, markdownImageRegex)
  }

  private replaceTagImg = async (content: string): Promise<string> => {
    const htmlImageRegex = /<img src='([^']*)'(?:\s+alt='([^']*)')?>/g
    return await this.replaceToGithubImgTag(content, htmlImageRegex)
  }

  private replaceToGithubImgTag = async (content: string, regex: RegExp): Promise<string> => {
    const allMatchesContent = Array.from(content.matchAll(regex))
    const replaceImageSourceList = await this.replaceImageGithubToHTML(allMatchesContent)
    let result = content
    for (const { originalText, imageHTML } of replaceImageSourceList) {
      result = result.replace(originalText, imageHTML)
    }

    return result
  }

  private async replaceImageGithubToHTML(imageSources: RegExpMatchArray[]) {
    return await Promise.all(
      imageSources.map(async (imageSource) => {
        let imageHTML
        if (this.isGithubImageSource(imageSource[1])) {
          const path = imageSource[1].split('/main')[1]
          const data = await this.getGithubFile(
            `https://api.github.com/repos/${this.username}/${this.repo}/contents${path}`
          )

          imageHTML = `<img src="${data.download_url}"/>`
        } else if (this.isGithubLocalImage(imageSource[1])) {
          const data = await this.getGithubFile(
            `https://api.github.com/repos/${this.username}/${this.repo}/contents${imageSource[1]}`
          )

          imageHTML = `<img src="${data.download_url}"/>`
        } else {
          imageHTML = `<img src="${imageSource[1]}"/>`
        }

        return { originalText: imageSource[0], imageHTML }
      })
    )
  }

  public async getGithubFile(url: string) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const headers: HeadersInit = this.token ? { Authorization: `Bearer ${this.token}` } : {}
    const response = await fetch(url, { headers })

    return await response.json()
  }
  private extractRepoParams(url: string): { username: string; repo: string } | undefined {
    const match = url.match(/https:\/\/github\.com\/([^/]+)\/([^/]+)/) // regex to get username and repo name from github url
    if (!match) return undefined
    return { username: match?.[1], repo: match?.[2] }
  }

  private isGithubImageSource(url: string): boolean {
    return url.startsWith(`https://github.com/${this.username}/${this.repo}/blob/main/`)
  }
  private isGithubLocalImage(url: string): boolean {
    return url.startsWith('/')
  }
}
