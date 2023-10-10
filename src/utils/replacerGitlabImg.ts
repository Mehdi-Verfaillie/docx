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
      return
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
    return await this.replaceToGitlabImgTag(content, markdownImageRegex)
  }

  private replaceTagImg = async (content: string): Promise<string> => {
    const htmlImageRegex = /<img src='([^']*)'(?:\s+alt='([^']*)')?>/g
    return await this.replaceToGitlabImgTag(content, htmlImageRegex)
  }
  private replaceToGitlabImgTag = async (content: string, regex: RegExp): Promise<string> => {
    const allMatchesContent = Array.from(content.matchAll(regex))
    const replaceImageSourceList = await this.replaceImageGitlabToHTML(allMatchesContent)
    let result = content

    for (const { originalText, imageHTML } of replaceImageSourceList) {
      result = result.replace(originalText, imageHTML)
    }

    return result
  }

  private async replaceImageGitlabToHTML(imageSources: RegExpMatchArray[]) {
    return await Promise.all(
      imageSources.map(async (imageSource) => {
        let imageHTML

        if (this.isGitlabImageUrl(imageSource[1])) {
          const path = imageSource[1].split('/main')[1]
          const imageUrl = await this.getRawGitlabUrl(path)

          imageHTML = `<img src="${imageUrl}"/>`
        } else if (this.isLocalImg(imageSource[1])) {
          const imageUrl = await this.getRawGitlabUrl(imageSource[1])

          imageHTML = `<img src="${imageUrl}"/>`
        } else {
          imageHTML = `<img src="${imageSource[1]}"/>`
        }

        return { originalText: imageSource[0], imageHTML }
      })
    )
  }

  private async getRawGitlabUrl(url: string): Promise<string> {
    const projectId = encodeURIComponent(`${this.username}/${this.repo}`)
    const filePath = encodeURIComponent(url.replace(/^\//, ''))

    const headers: HeadersInit = this.token ? { Authorization: `Bearer ${this.token}` } : {}
    const response = await fetch(
      `https://gitlab.com/api/v4/projects/${projectId}/repository/files/${filePath}/raw?ref=main`,
      { headers }
    )

    const arrayBuffer = await response.arrayBuffer()

    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    const imageUrl = `data:image/png;base64,${base64}`

    return imageUrl
  }

  public async getGithubFile(url: string) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const headers: HeadersInit = this.token ? { Authorization: `Bearer ${this.token}` } : {}
    const response = await fetch(url, { headers })

    return await response.json()
  }
  private extractGitlabRepoParams(url: string): { username: string; repo: string } | undefined {
    const match = url.match(/https:\/\/gitlab\.com\/([^/]+)\/([^/]+)/) // regex to get username and repo name from gitlab url
    if (!match) return undefined
    return { username: match[1], repo: match[2] }
  }

  private isGitlabImageUrl(url: string): boolean {
    return url.startsWith(`https://gitlab.com/${this.username}/${this.repo}/-/raw/main/`)
  }

  private isLocalImg(url: string): boolean {
    return url.startsWith('/')
  }
}
