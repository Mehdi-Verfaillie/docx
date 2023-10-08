import { ErrorManager } from '../utils/error.utils'
import { ProviderConfig } from './repository.controller'
import { Token } from '../utils/credentials.utils'

const knownRepositories = ['github.com'] as const

export interface ProviderStrategy {
  isMatch(docLocation: string): boolean
  getProviderConfig(docLocation: string, tokens: Token[]): ProviderConfig
}

export class LocalProviderStrategy implements ProviderStrategy {
  isMatch(docLocation: string): boolean {
    return !docLocation.startsWith('http')
  }
  getProviderConfig(): ProviderConfig {
    return { type: 'local' }
  }
}

export class RepositoryProviderStrategy implements ProviderStrategy {
  isMatch(docLocation: string): boolean {
    return knownRepositories.some((domain) => docLocation.includes(domain))
  }

  getProviderConfig(docLocation: string, tokens: Token[]): ProviderConfig {
    const domain = knownRepositories.find((domain) => docLocation.includes(domain))
    if (!domain) {
      ErrorManager.outputError(`Unrecognized repository domain in URL: ${docLocation}`)
      throw new Error(`Unrecognized repository domain in URL: ${docLocation}`)
    }
    const repositoryName = this.extractRepositoryName(domain)
    const token = tokens.find((token) => token.provider === repositoryName)!.key
    return {
      type: repositoryName,
      repositories: [docLocation],
      token: token,
    }
  }

  private extractRepositoryName(domain: string): 'github' | never {
    const type = domain.split('.')[0]
    if (type === 'github') return type

    ErrorManager.outputError(`Unrecognized repository type: ${type}`)
    throw new Error(`Unrecognized repository type: ${type}`)
  }
}

export class WebProviderStrategy implements ProviderStrategy {
  isMatch(docLocation: string): boolean {
    return (
      docLocation.startsWith('http') &&
      knownRepositories.every((domain) => !docLocation.includes(domain))
    )
  }

  getProviderConfig(docLocation: string): ProviderConfig {
    return { type: 'web', url: docLocation }
  }
}
