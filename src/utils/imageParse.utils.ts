import { GithubImageTransformation, ImageTransformation } from './githubImageTransformation.utils'

export class ImageParse {
  private contentTransformers: ImageTransformation[] = []

  constructor(initialRepository: string) {
    this.transformContent(new GithubImageTransformation(initialRepository))
  }

  public transformContent(transformer: ImageTransformation): void {
    this.contentTransformers.push(transformer)
  }

  public parseImageContent(content: string): string {
    return this.contentTransformers.reduce(
      (currentContent, currentTransformer) => currentTransformer.transformImage(currentContent),
      content
    )
  }
}
