import { ErrorManager } from '../utils/error.utils'
import { ProviderConfig } from './repository.controller'
import { Token } from '../utils/credentials.utils'

const knownRepositories = ['github.com', 'gitlab.com'] as const

export interface ProviderStrategy {
  isMatch(docLocation: string): boolean
  getProviderConfig(
    docLocation: string,
    tokens?: Token[],
    ignorePatterns?: string[]
  ): ProviderConfig
}

export class LocalProviderStrategy implements ProviderStrategy {
  isMatch(docLocation: string): boolean {
    return !docLocation.startsWith('http')
  }
  getProviderConfig(
    docLocation: string,
    tokens?: Token[],
    ignorePatterns?: string[]
  ): ProviderConfig {
    return { type: 'local', ignorePatterns }
  }
}

export class RepositoryProviderStrategy implements ProviderStrategy {
  isMatch(docLocation: string): boolean {
    return knownRepositories.some((domain) => docLocation.includes(domain))
  }

  getProviderConfig(docLocation: string, tokens?: Token[]): ProviderConfig {
    const domain = knownRepositories.find((domain) => docLocation.includes(domain))
    if (!domain) {
      ErrorManager.outputError(`Unrecognized repository domain in URL: ${docLocation}`)
      throw new Error(`Unrecognized repository domain in URL: ${docLocation}`)
    }
    const repositoryName = this.extractRepositoryName(domain)

    let token
    if (tokens && tokens.length > 0) {
      token = tokens.find((token) => token.provider === repositoryName)?.key
    }
    return {
      type: repositoryName,
      repositories: [docLocation],
      token,
    }
  }

  private extractRepositoryName(domain: string): 'github' | 'gitlab' | never {
    const type = domain.split('.')[0]
    if (type === 'github') return type
    if (type === 'gitlab') return type

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
