import { ErrorManager } from './error.utils'
import { FormatterRepo } from './formatterRepo'

export class FormatterGithub extends FormatterRepo {
  protected username?: string
  protected repo?: string
  protected token?: string

  constructor(repository: string, token?: string) {
    super(repository, 'github', token)
    const repositoryParams = this.getOwnerRepo()
    if (!repositoryParams || !repositoryParams.owner || !repositoryParams.name) {
      ErrorManager.outputError('Invalid repository information')
      return
    }

    this.username = repositoryParams.owner
    this.repo = repositoryParams.name
    this.token = token
  }

  public formate = (content: string): string => {
    const formateList = [this.formateMarkdownImg, this.formateHtmlImg]

    const formatedContent = formateList.reduce(
      (currentContent, formateFunction) => formateFunction(currentContent),
      content
    )

    return formatedContent
  }

  private formateMarkdownImg = (content: string): string => {
    const markdownImageRegex = /!\[[^\]]*\]\(([^)]+)\)/g // regex to get markdown img  ex : ![dragon](https://github.com/vincentli77/test-api/blob/main/image/drg.png)
    return this.formateToHtmlImg(content, markdownImageRegex)
  }
  protected formateToHtmlImg = (content: string, regex: RegExp) => {
    return content.replace(regex, (_, imageUrl) => {
      if (this.isGithubImageUrl(imageUrl)) {
        const path = imageUrl.split('/main')[1]
        return `<img src="${this.getRawGithubUrl(path)}"/>`
      }
      if (this.isLocalImg(imageUrl)) {
        return `<img src="${this.getRawGithubUrl(imageUrl)}"/>`
      }
      return `<img src="${imageUrl}"/>`
    })
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
}
