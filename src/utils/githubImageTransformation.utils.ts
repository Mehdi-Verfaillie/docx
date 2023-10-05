export interface ImageTransformation {
  transformImage: (content: string) => string
}

export class GithubImageTransformation implements ImageTransformation {
  private username: string | null
  private repo: string | null

  constructor(repository: string) {
    const repoInfo = this.extractRepoInfo(repository)
    this.username = repoInfo.username
    this.repo = repoInfo.repo
  }

  private replaceMarkdownImages = (content: string): string => {
    const markdownImageRegex = /!\[(.*?)\]\(([^)]+)\)/g

    return content.replace(markdownImageRegex, (_, altText, imageUrl) => {
      return this.isGithubImage(imageUrl)
        ? `<img src="${this.transformUrlGithub(imageUrl)}" alt="${altText}">`
        : `<img src="${imageUrl}" alt="${altText}">`
    })
  }

  private replaceLocalImg = (content: string): string => {
    const htmlImageRegex = /<img src='([^']*)' alt='([^']*)'>/g

    return content.replace(htmlImageRegex, (_, imageUrl, altText) => {
      return this.isGithubImage(imageUrl)
        ? `<img src="${this.transformUrlGithub(imageUrl)}" alt="${altText}">`
        : `<img src="${imageUrl}" alt="${altText}">`
    })
  }

  public transformImage = (content: string): string => {
    const replacements = [this.replaceMarkdownImages, this.replaceLocalImg]

    const transformedContent = replacements.reduce(
      (currentContent, replacementFunction) => replacementFunction(currentContent),
      content
    )

    return transformedContent
  }

  private extractRepoInfo(repository: string): { username: string | null; repo: string | null } {
    const match = repository.match(/https:\/\/github\.com\/([^/]+)\/([^/]+)/)
    return match ? { username: match[1], repo: match[2] } : { username: null, repo: null }
  }

  private transformUrlGithub(url: string): string {
    const path = url.includes('/main') ? url.split('/main')[1] : url
    return `https://raw.githubusercontent.com/${this.username}/${this.repo}/main${path}`
  }

  private isGithubImage(url: string): boolean {
    return (
      url.startsWith(`https://github.com/${this.username}/${this.repo}/blob/main/`) ||
      (url.startsWith('/') && !url.startsWith('https'))
    )
  }
}
