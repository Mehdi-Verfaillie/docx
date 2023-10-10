import { AbstractRepositoryFactory } from '../api/repository.factory'
import { Documentation } from '../association.manager'
import { FileSystemManager } from '../utils/fileSystem.utils'
import { ReplacerTextProvider } from '../utils/replacerText.utils'

interface GitlabResponse {
  type: string
  name: string
  path: string
}

export class GitlabProvider implements AbstractRepositoryFactory {
  private baseUrl = 'https://gitlab.com/api/v4'
  private fileSystem
  private repository
  private transformImageURL
  private token: string | undefined

  constructor(repository: string[], token?: string) {
    this.token = token
    this.repository = this.getOwnerRepo(repository)
    this.fileSystem = new FileSystemManager()
    this.transformImageURL = new ReplacerTextProvider(repository[0], token)
  }

  public async getDocumentations(): Promise<Documentation[]> {
    const documentations: Documentation[] = []

    const data = await this.getRepoContent(
      `/projects/${this.repository.owner}%2F${this.repository.name}/repository/tree?ref=main&recursive=true`
    )

    await this.fetchDocumentation(data, documentations)
    return documentations
  }

  private fetchDocumentation = async (
    repositoryContents: GitlabResponse[],
    documentations: Documentation[]
  ) => {
    for (const repositoryContent of repositoryContents) {
      if (
        repositoryContent.type === 'blob' &&
        this.fileSystem.isFileOfInterest(repositoryContent.name)
      ) {
        const documentation = await this.getFile(repositoryContent)
        documentation.content = await this.transformImageURL.replacer(documentation.content)
        documentations.push(documentation)
      }
    }
  }

  public async getRepoContent(route: string) {
    const requestOptions: RequestInit = this.token
      ? { headers: { 'PRIVATE-TOKEN': this.token } }
      : {}

    const response = await fetch(this.baseUrl + route, requestOptions)
    return await response.json()
  }

  public async getFile(file: GitlabResponse): Promise<Documentation> {
    const filePathEncoded = encodeURIComponent(file.path)
    const url = `https://gitlab.com/api/v4/projects/${this.repository.owner}%2F${this.repository.name}/repository/files/${filePathEncoded}/raw`
    const requestOptions: RequestInit = this.token
      ? { headers: { 'PRIVATE-TOKEN': this.token } }
      : {}

    const response = await fetch(url, requestOptions)
    const content = await response.text()
    return {
      type: this.fileSystem.getExtension(file.name)!,
      name: file.name,
      content: content,
      path: `https://gitlab.com/${this.repository.owner}/${this.repository.name}/-/blob/main/${file.path}`,
    }
  }

  public getOwnerRepo(repository: string[]) {
    const urlParts = repository[0].split('/')
    return { owner: urlParts[3], name: urlParts[4] }
  }
}
