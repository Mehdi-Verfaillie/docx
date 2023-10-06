import { Documentation } from '../association.manager'
import { FileSystemManager } from '../utils/fileSystem.utils'
import { Octokit } from 'octokit'
import { ReplacerTextProvider } from '../utils/replacerText.utils'

interface GithubResponse {
  type: string
  name: string
  url: string
  // eslint-disable-next-line @typescript-eslint/naming-convention
  download_url: string
}
export class GithubProvider {
  public octokit: Octokit
  private fileSystem
  private repository
  private transformImageURL

  constructor(repository: string[], token?: string) {
    this.octokit = new Octokit({ auth: token })
    this.repository = this.getOwnerRepo(repository)
    this.fileSystem = new FileSystemManager()
    this.transformImageURL = new ReplacerTextProvider(repository[0], token)
  }

  public async getDocumentations(): Promise<Documentation[]> {
    const documentations: Documentation[] = []
    const { data } = await this.getRepoContent(
      `GET /repos/${this.repository.owner}/${this.repository.name}/contents`
    )

    await this.fetchDocumentation(data, documentations)
    return documentations
  }

  private fetchDocumentation = async (
    repositoryContents: GithubResponse[],
    documentations: Documentation[]
  ): Promise<void> => {
    for (const repositoryContent of repositoryContents) {
      if (
        repositoryContent.type === 'file' &&
        this.fileSystem.isFileOfInterest(repositoryContent.name)
      ) {
        const documentation = await this.getFile(repositoryContent)
        documentation.content = this.transformImageURL.replacer(documentation.content)
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
      path: file.url,
    }
  }

  public getOwnerRepo(repository: string[]) {
    const urlParts = repository[0].split('/')
    return { owner: urlParts[3], name: urlParts[4] }
  }
}
