import { ProviderConfig } from './repository.controller'

// @ts-ignore TODO: Create a LocalProvider & GithubProvider
export type Provider = LocalProvider | GithubProvider

export class RepositoryProvider {
  private provider: Provider

  constructor(config: ProviderConfig) {
    switch (config.type) {
      case 'local':
        // @ts-ignore TODO: Create a LocalProvider
        this.provider = new LocalProvider()
        break

      case 'github':
        // @ts-ignore TODO: Create a GithubProvider
        this.provider = new GithubProvider()
        break
      default:
        break
    }
  }

  public get instance(): Provider {
    return this.provider
  }
}
