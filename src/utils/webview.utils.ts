export class WebviewUtils {
  constructor() {}

  public readImage(content: string) {
    const imageParsesList = [this.readGithubImage]

    let htmlContent = content

    for (const imageParse of imageParsesList) {
      htmlContent = imageParse(htmlContent)
    }

    return htmlContent
  }
  public readGithubImage(content: string) {
    const markdownImageRegex = /!\[([^\]]+)\]\((https:\/\/github\.com\/[^)]+)\)/g
    const htmlContent = content.replace(markdownImageRegex, (_, altText, imageUrl) => {
      const rawImageUrl = imageUrl
        .replace('github.com', 'raw.githubusercontent.com')
        .replace('/blob/', '/')
      return `<img src="${rawImageUrl}" alt="${altText}">`
    })

    return htmlContent
  }
}
