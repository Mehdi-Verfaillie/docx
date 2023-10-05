import { ReplacerInterface } from './replacerText.provider.utils'

export class ReplacerGithubImg implements ReplacerInterface {
  private username: string
  private repo: string
  private token: string | undefined

  constructor(repository: string, token?: string) {
    const repoInfo = this.extractRepoParams(repository)
    if (!repoInfo || !repoInfo.username || !repoInfo.repo) {
      throw new Error('Invalid repository information')
    }

    this.username = repoInfo.username
    this.repo = repoInfo.repo
    this.token = token
  }

  public replace = (content: string): string => {
    const replacements = [this.replaceMarkdownImg, this.replaceTagImg]

    const replacedContent = replacements.reduce(
      (currentContent, replacementFunction) => replacementFunction(currentContent),
      content
    )

    return replacedContent
  }
  private replaceMarkdownImg = (content: string): string => {
    const markdownImageRegex = /!\[[^\]]*\]\(([^)]+)\)/g // regex to get markdown img  ex : ![dragon](https://github.com/vincentli77/test-api/blob/main/image/drg.png)
    return this.replaceToGithubImgTag(content, markdownImageRegex)
  }
  private replaceTagImg = (content: string): string => {
    const htmlImageRegex = /<img src='([^']*)'(?:\s+alt='([^']*)')?>/g // regex to get img tag ex : <img src='/image/drg.png' alt='drag'>
    return this.replaceToGithubImgTag(content, htmlImageRegex)
  }

  private replaceToGithubImgTag = (content: string, regex: RegExp) => {
    return content.replace(regex, (_, imageUrl) => {
      if (this.isGithubImageUrl(imageUrl)) {
        const path = imageUrl.split('/main')[1]
        return `<img src="${this.getRawGithubUrl(path)}" ">`
      }
      if (this.isLocalImg(imageUrl)) {
        return `<img src="${this.getRawGithubUrl(imageUrl)}">`
      }
      return `<img src="${imageUrl}">`
    })
  }

  private extractRepoParams(url: string): { username: string; repo: string } | undefined {
    const match = url.match(/https:\/\/github\.com\/([^/]+)\/([^/]+)/) // regex to get username and repo name from github url
    if (!match) return undefined
    return { username: match?.[1], repo: match?.[2] }
  }

  private getRawGithubUrl(url: string): string {
    return (
      `https://raw.githubusercontent.com/${this.username}/${this.repo}/main${url}` +
      (this.token ? `?access_token=${this.token}` : '')
    )
  }

  private isGithubImageUrl(url: string): boolean {
    return url.startsWith(`https://github.com/${this.username}/${this.repo}/blob/main/`)
  }
  private isLocalImg(url: string): boolean {
    return url.startsWith('/')
  }
}
