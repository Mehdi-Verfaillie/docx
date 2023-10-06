import { ReplacerGithubImg } from './replacerGithubImg'

export interface ReplacerInterface {
  replace: (content: string) => string
}

export class ReplacerTextProvider {
  private replacersList: ReplacerInterface[] = []

  constructor(initialRepository: string, token?: string) {
    this.addReplacer(new ReplacerGithubImg(initialRepository, token))
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
