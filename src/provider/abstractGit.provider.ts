import { FileSystemManager } from '../utils/fileSystem.utils'

export abstract class AbstractGit {
  protected fileSystem = new FileSystemManager()
  protected repositoryParams

  private type: string
  private repository: string
  constructor(type: string, repository: string[]) {
    this.type = type
    this.repository = repository[0]
    this.repositoryParams = this.getOwnerRepo()
  }

  public getOwnerRepo(): { owner: string; name: string } {
    const regex =
      this.type === 'github'
        ? /https:\/\/github\.com\/([^/]+)\/([^/]+)/
        : /https:\/\/gitlab\.com\/([^/]+)\/([^/]+)/
    const match = this.repository.match(regex)!
    return { owner: match[1], name: match[2] }
  }
}
