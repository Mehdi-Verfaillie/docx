import { ReplacerGithubImg } from './replacerGithubImg'
import { ReplacerGitLabImg } from './replacerGitlabImg'

export interface ReplacerInterface {
  replace: (content: string) => string
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

  public replacer(content: string): string {
    return this.replacersList.reduce(
      (currentContent, currentReplacer) => currentReplacer.replace(currentContent),
      content
    )
  }
}
