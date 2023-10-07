import { ErrorManager } from './error.utils'
import { ReplacerInterface } from './replacerText.utils'

export class ReplacerGitLabImg implements ReplacerInterface {
  private username?: string
  private repo?: string
  private token?: string

  constructor(repository: string, token?: string) {
    const repoInfo = this.extractGitlabRepoParams(repository)
    if (!repoInfo || !repoInfo.username || !repoInfo.repo) {
      ErrorManager.outputError('Invalid repository information')
    }

    this.username = repoInfo?.username
    this.repo = repoInfo?.repo
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
    return this.replaceToGilabImgTag(content, markdownImageRegex)
  }
  private replaceTagImg = (content: string): string => {
    const htmlImageRegex = /<img src='([^']*)'(?:\s+alt='([^']*)')?>/g // regex to get img tag ex : <img src='/image/drg.png' alt='drag'>
    return this.replaceToGilabImgTag(content, htmlImageRegex)
  }

  private replaceToGilabImgTag = (content: string, regex: RegExp) => {
    return content.replace(regex, (_, imageUrl) => {
      if (this.isGithubImageUrl(imageUrl)) {
        const path = imageUrl.split('/main')[1]
        return `<img src="${this.getRawGitlabUrl(path)}" ">`
      }
      if (this.isLocalImg(imageUrl)) {
        return `<img src="${this.getRawGitlabUrl(imageUrl)}">`
      }
      return `<img src="${imageUrl}">`
    })
  }

  private extractGitlabRepoParams(url: string): { username: string; repo: string } | undefined {
    const match = url.match(/https:\/\/gitlab\.com\/([^/]+)\/([^/]+)/) // regex to get username and repo name from gitlab url
    if (!match) return undefined
    return { username: match[1], repo: match[2] }
  }

  private getRawGitlabUrl(url: string): string {
    return (
      `https://gitlab.com/${this.username}/${this.repo}/-/raw/main${url}` +
      (this.token ? `?private_token=${this.token}` : '')
    )
  }

  private isGithubImageUrl(url: string): boolean {
    return url.startsWith(`https://gitlab.com/${this.username}/${this.repo}/-/blob/main/`)
  }
  private isLocalImg(url: string): boolean {
    return url.startsWith('/')
  }
}
