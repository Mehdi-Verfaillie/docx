import { Documentation } from '../association.manager'
import { Octokit } from 'octokit'
import { AbstractGit } from './abstractGit.provider'
import { AbstractRepositoryFactory } from '../api/repository.factory'
import { FormatterContent } from '../utils/formatterContent'

interface GithubResponse {
  type: string
  name: string
  url: string
  // eslint-disable-next-line @typescript-eslint/naming-convention
  download_url: string
  // eslint-disable-next-line @typescript-eslint/naming-convention
  html_url: string
}

export class GithubProvider extends AbstractGit implements AbstractRepositoryFactory {
  public octokit: Octokit
  protected formatterContent

  constructor(repository: string[], token?: string) {
    super('github', repository)
    this.octokit = new Octokit({ auth: token })
    this.formatterContent = new FormatterContent('github', token)
  }

  public async getDocumentations(): Promise<Documentation[]> {
    const documentations: Documentation[] = []

    const { data } = await this.getRepoContent(
      `GET /repos/${this.repositoryParams.owner}/${this.repositoryParams.name}/contents`
    )

    await this.fetchDocumentation(data, documentations)
    return documentations
  }

  private async fetchDocumentation(
    repositoryContents: GithubResponse[],
    documentations: Documentation[]
  ): Promise<void> {
    for (const repositoryContent of repositoryContents) {
      if (
        repositoryContent.type === 'file' &&
        this.fileSystem.isFileOfInterest(repositoryContent.name)
      ) {
        const documentation = await this.getFile(repositoryContent)
        documentation.content = this.formatterContent.formatter(documentation.content)
        documentations.push(documentation)
      }
      if (repositoryContent.type === 'dir') {
        const { data } = await this.getRepoContent(repositoryContent.url)
        await this.fetchDocumentation(data, documentations)
      }
    }
  }

  public async getRepoContent(route: string) {
    return await this.octokit.request(route)
  }

  public async getFile(file: GithubResponse): Promise<Documentation> {
    const content = await this.octokit.request(`GET ${file.download_url}`)

    return {
      type: this.fileSystem.getExtension(file.name)!,
      name: file.name,
      content: content.data,
      path: file.html_url,
    }
  }
}
