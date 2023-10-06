import { ProviderConfig } from './repository.controller'

export interface ProviderStrategy {
  isMatch(docLocation: string): boolean
  getProviderConfig(docLocation: string): ProviderConfig
}

export class LocalProviderStrategy implements ProviderStrategy {
  isMatch(docLocation: string): boolean {
    return !docLocation.startsWith('http')
  }
  getProviderConfig(): ProviderConfig {
    return { type: 'local' }
  }
}

export class GitHubProviderStrategy implements ProviderStrategy {
  isMatch(docLocation: string): boolean {
    return docLocation.includes('github.com')
  }
  getProviderConfig(docLocation: string): ProviderConfig {
    return { type: 'github', repositories: [docLocation] }
  }
}

export class WebProviderStrategy implements ProviderStrategy {
  isMatch(docLocation: string): boolean {
    return docLocation.startsWith('http')
  }

  getProviderConfig(docLocation: string): ProviderConfig {
    return { type: 'web', url: docLocation }
  }
}
