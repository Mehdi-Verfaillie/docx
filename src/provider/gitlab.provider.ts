import { Documentation } from '../association.manager'
import { FileSystemManager } from '../utils/fileSystem.utils'
import { ReplacerTextProvider } from '../utils/replacerText.utils'

interface GitlabResponse {
  type: string
  name: string
  path: string
}

export class GitlabProvider {
  private baseUrl = 'https://gitlab.com/api/v4'
  private fileSystem
  private repository
  private transformImageURL

  constructor(repository: string[], token?: string) {
    this.repository = this.getProjectId(repository)
    this.fileSystem = new FileSystemManager()
    this.transformImageURL = new ReplacerTextProvider(repository[0], token)
  }

  public async getDocumentations(): Promise<Documentation[]> {
    const documentations: Documentation[] = []
    const data = await this.getRepoContent(
      `/projects/${this.repository.id.replace('/', '%2F')}/repository/tree?ref=main&recursive=true`
    )

    await this.fetchDocumentation(data, documentations)
    return documentations
  }

  private fetchDocumentation = async (
    repositoryContents: GitlabResponse[],
    documentations: Documentation[]
  ): Promise<void> => {
    for (const repositoryContent of repositoryContents) {
      if (
        repositoryContent.type === 'blob' &&
        this.fileSystem.isFileOfInterest(repositoryContent.name)
      ) {
        const documentation = await this.getFile(repositoryContent)
        documentation.content = this.transformImageURL.replacer(documentation.content)
        documentations.push(documentation)
      }
    }
  }

  public async getRepoContent(route: string) {
    const response = await fetch(this.baseUrl + route)
    return await response.json()
  }

  public async getFile(file: GitlabResponse): Promise<Documentation> {
    const projectIdEncoded = encodeURIComponent(this.repository.id)
    const filePathEncoded = encodeURIComponent(file.path)
    const url = `https://gitlab.com/api/v4/projects/${projectIdEncoded}/repository/files/${filePathEncoded}/raw`
    const response = await fetch(url)
    const content = await response.text()

    return {
      type: this.fileSystem.getExtension(file.name)!,
      name: file.name,
      content: content,
      path: `https://gitlab.com/${this.repository.id}/-/blob/main/${file.path}`,
    }
  }

  public getProjectId(repository: string[]) {
    const urlParts = repository[0].split('/')
    return { id: `${urlParts[3]}/${urlParts[4]}`, token: repository[1] }
  }
}
