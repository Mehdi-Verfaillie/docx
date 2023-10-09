import { FormatterGithub } from './formatterGithub'
import { FormatterGitlab } from './formatterGitlab'

export interface FormatterContentInterface {
  formate: (content: string) => string
}

export class FormatterContent {
  private replacersList: FormatterContentInterface[] = []

  constructor(type: string, token?: string) {
    if (type.includes('github.com')) {
      this.addFormatter(new FormatterGithub(type, token))
    } else if (type.includes('gitlab.com')) {
      this.addFormatter(new FormatterGitlab(type, token))
    }
  }

  public addFormatter(replacer: FormatterContentInterface) {
    this.replacersList.push(replacer)
  }

  public formatter(content: string): string {
    return this.replacersList.reduce(
      (currentContent, currentReplacer) => currentReplacer.formate(currentContent),
      content
    )
  }
}
