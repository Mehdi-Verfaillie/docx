import { Documentation } from '../association.manager'
import { FileSystemManager } from '../utils/fileSystem.utils'
import { ReplacerTextProvider } from '../utils/replacerText.utils'
import { AbstractRepositoryFactory } from '../api/repository.factory'
import { ErrorManager } from '../utils/error.utils'

interface GithubResponse {
  type: string
  name: string
  url: string
  // eslint-disable-next-line @typescript-eslint/naming-convention
  download_url: string
  // eslint-disable-next-line @typescript-eslint/naming-convention
  html_url: string
}
export class GithubProvider implements AbstractRepositoryFactory {
  private fileSystem
  private repository
  private transformImageURL
  private token: string | undefined

  constructor(repository: string[], token?: string) {
    this.repository = this.getOwnerRepo(repository)
    this.fileSystem = new FileSystemManager()
    this.transformImageURL = new ReplacerTextProvider(repository[0], token)
    this.token = token
  }

  public async getDocumentations(): Promise<Documentation[]> {
    const documentations: Documentation[] = []
    const data = await this.getRepoContent(
      `https://api.github.com/repos/${this.repository.owner}/${this.repository.name}/contents`
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
        documentation.content = await this.transformImageURL.replacer(documentation.content)

        documentations.push(documentation)
      }
      if (repositoryContent.type === 'dir') {
        const data = await this.getRepoContent(repositoryContent.url)
        await this.fetchDocumentation(data, documentations)
      }
    }
  }

  public async getRepoContent(route: string) {
    const headers: HeadersInit = this.token ? { Authorization: `Bearer ${this.token}` } : {}
    const response = await fetch(route, { headers })
    if (response.status === 401) {
      ErrorManager.outputError(
        "Github Bad Credential: Votre token d'authentification est invalide ou expiré."
      )
      return
    }
    return await response.json()
  }

  public async getFile(file: GithubResponse): Promise<Documentation> {
    const data = await this.getRepoContent(file.url)
    return {
      type: this.fileSystem.getExtension(file.name)!,
      name: file.name,
      content: atob(data.content),
      path: file.html_url,
    }
  }
  public getOwnerRepo(repository: string[]) {
    const urlParts = repository[0].split('/')
    return { owner: urlParts[3], name: urlParts[4] }
  }
}
