import { Documentation } from '../association.manager'
import { GithubAPIUtil } from '../utils/githubApi.utils'
import { FileSystemManager } from '../utils/fileSystem.utils'
import { Octokit } from 'octokit'
import { ImageParse } from '../utils/imageParse.utils'

interface GithubResponse {
  type: string
  name: string
  url: string
  download_url: string
}
export class GithubProvider {
  private githubAPI
  public octokit: Octokit

  private fileSystem
  private repository

  private parseImage
  constructor(repository: string[], token?: string) {
    this.githubAPI = new GithubAPIUtil()
    this.octokit = token ? new Octokit({ auth: token }) : new Octokit()
    this.repository = this.githubAPI.getOwnerRepo(repository)
    this.fileSystem = new FileSystemManager()
    this.parseImage = new ImageParse(repository[0])
  }

  public async getDocumentations(): Promise<Documentation[]> {
    const documentation: Documentation[] = []
    const { data } = await this.getContent(
      `GET /repos/${this.repository.owner}/${this.repository.name}/contents`
    )

    const fetchDocumentation = async (elements: GithubResponse[]) => {
      for (const element of elements) {
        if (
          element.type === 'file' &&
          element.name.endsWith(this.fileSystem.getExtension(element.name)!)
        ) {
          const doc = await this.readFile(element)
          documentation.push(doc)
        }
        if (element.type === 'dir') {
          const { data } = await this.getContent(element.url)
          if (Array.isArray(data)) {
            await fetchDocumentation(data)
          }
        }
      }
    }

    if (Array.isArray(data)) {
      await fetchDocumentation(data)
    }
    return documentation
  }

  public async getContent(path: string) {
    return await this.octokit.request(path)
  }
  public async readFile(file: GithubResponse): Promise<Documentation> {
    const content = (await this.octokit.request(`GET ${file.download_url}`)) as unknown as {
      data: string
    }
    const parseContent = this.parseImage.readImage(content.data)

    return { type: '.md', name: file.name, content: parseContent }
  }
}
