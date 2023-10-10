import { ReplacerGithubImg } from './replacerGithubImg'
import { ReplacerGitLabImg } from './replacerGitlabImg'

export interface ReplacerInterface {
  replace: (content: string) => Promise<string>
}

export class ReplacerTextProvider {
  private replacersList: ReplacerInterface[] = []

  constructor(initialRepository: string, token?: string) {
    if (initialRepository.includes('github.com')) {
      this.addReplacer(new ReplacerGithubImg(initialRepository, token))
    } else if (initialRepository.includes('gitlab.com')) {
      this.addReplacer(new ReplacerGitLabImg(initialRepository, token))
    }
  }

  public addReplacer(replacer: ReplacerInterface) {
    this.replacersList.push(replacer)
  }

  public async replacer(content: string): Promise<string> {
    let replacedContent = content
    for (const replacer of this.replacersList) {
      replacedContent = await replacer.replace(replacedContent)
    }
    return replacedContent
  }
}
