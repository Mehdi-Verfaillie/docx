import { Documentation } from '../association.manager'
import { Provider, RepositoryProvider } from './repository.provider'
import { ProviderConfig } from './repository.controller'

export interface AbstractRepositoryFactory {
  getDocumentations: () => Promise<Documentation[]>
}

export class RepositoryFactory implements AbstractRepositoryFactory {
  private providers: Provider[] = []
  constructor(configs: ProviderConfig[]) {
    for (const config of configs) {
      this.providers.push(new RepositoryProvider(config).instance)
    }
  }

  public async getDocumentations(): Promise<Documentation[]> {
    const allDocs: Documentation[] = []
    for (const provider of this.providers) {
      const docs = await provider.getDocumentations()
      allDocs.push(...docs)
    }
    return allDocs
  }
}
