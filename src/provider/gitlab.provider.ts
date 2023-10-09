import { AbstractRepositoryFactory } from '../api/repository.factory'
import { Documentation } from '../association.manager'
import { FormatterContent } from '../utils/formatterContent'
import { AbstractGit } from './abstractGit.provider'

interface GitlabResponse {
  type: string
  name: string
  path: string
}

export class GitlabProvider extends AbstractGit implements AbstractRepositoryFactory {
  private baseUrl = 'https://gitlab.com/api/v4'
  protected formatterContent

  constructor(repository: string[], token?: string) {
    super('gitlab', repository)
    this.formatterContent = new FormatterContent('gitlab', token)
  }

  public async getDocumentations(): Promise<Documentation[]> {
    const documentations: Documentation[] = []
    const data = await this.getRepoContent(
      `/projects/${this.repositoryParams.owner}%2F${this.repositoryParams.name}/repository/tree?ref=main&recursive=true`
    )

    await this.fetchDocumentation(data, documentations)
    return documentations
  }

  private async fetchDocumentation(
    repositoryContents: GitlabResponse[],
    documentations: Documentation[]
  ): Promise<void> {
    for (const repositoryContent of repositoryContents) {
      if (
        repositoryContent.type === 'blob' &&
        this.fileSystem.isFileOfInterest(repositoryContent.name)
      ) {
        const documentation = await this.getFile(repositoryContent)
        documentation.content = this.formatterContent.formatter(documentation.content)
        documentations.push(documentation)
      }
    }
  }

  public async getRepoContent(route: string) {
    const response = await fetch(this.baseUrl + route)
    return await response.json()
  }

  public async getFile(file: GitlabResponse): Promise<Documentation> {
    const filePathEncoded = encodeURIComponent(file.path)
    const url = `${this.baseUrl}/projects/${this.repositoryParams.owner}%2F${this.repositoryParams.name}/repository/files/${filePathEncoded}/raw`
    const response = await fetch(url)
    const content = await response.text()

    return {
      type: this.fileSystem.getExtension(file.name)!,
      name: file.name,
      content: content,
      path: `https://gitlab.com/${this.repositoryParams.owner}/${this.repositoryParams.name}/-/blob/main/${file.path}`,
    }
  }
}
