import { AbstractGit } from '../provider/abstractGit.provider'
import { ErrorManager } from './error.utils'

export abstract class FormatterRepo extends AbstractGit {
  protected username?: string
  protected repo?: string
  protected token?: string
  protected platform: string

  constructor(repository: string, platform: string, token?: string) {
    super(platform, [repository])
    this.token = token
    this.platform = platform
    const repositoryParams = this.getOwnerRepo()
    if (!repositoryParams || !repositoryParams.owner || !repositoryParams.name) {
      ErrorManager.outputError('Invalid repository information')
    }
    this.username = repositoryParams?.owner
    this.repo = repositoryParams?.name
  }

  protected abstract formateToHtmlImg(content: string, regex: RegExp): string

  protected formateHtmlImg = (content: string): string => {
    const htmlImageRegex = /<img src='([^']*)'(?:\s+alt='([^']*)')?>/g // regex to get img tag ex : <img src='/image/drg.png' alt='drag'>
    return this.formateToHtmlImg(content, htmlImageRegex)
  }
  protected isLocalImg(url: string): boolean {
    return url.startsWith('/')
  }
}
