import * as assert from 'assert'
import { before } from 'mocha'
import * as fs from 'fs/promises'

const isFileJson = (str: string): boolean => {
  try {
    JSON.parse(str)
    return true
  } catch (e) {
    return false
  }
}

interface IConfig {
  providers: { github?: { repository: string }[] }
  associations: { [key: string]: string[] }
}

class Config {
  providers: IConfig['providers']
  associations: IConfig['associations']
  targets: IConfig['associations']['key']
  documentations: IConfig['associations'][string][]
  constructor(config: IConfig) {
    this.providers = config.providers
    this.associations = config.associations
    this.targets = Object.keys(this.associations)
    this.documentations = Object.values(this.associations)
  }
  isTypeAssociationsTargetsCorrect(): boolean {
    return this.targets.every((key) => typeof key === 'string' && key !== '')
  }
  isTypeAssociationsDocumentationsCorrect(): boolean {
    return this.documentations.every(
      (value) =>
        Array.isArray(value) && value.every((item) => typeof item === 'string' && item !== '')
    )
  }

  isTypeProvidersGithubRepositoryCorrect(): boolean {
    const domainName = 'github.com'

    if (this.providers.github === undefined) {
      return true
    } else if (this.providers.github.every((item) => typeof item.repository === 'string')) {
      const providersStartUrl: string[] = this.generateStartUrls(domainName)
      return this.providers.github.every((item) => {
        if (
          item.repository === '' ||
          providersStartUrl.some((url) => item.repository.startsWith(url))
        ) {
          return true
        } else {
          return false
        }
      })
    }
    return false
  }
  hasBackSlash(): boolean {
    return !(
      this.documentations.every((value) => value.every((item) => !item.includes('\\'))) &&
      this.targets.every((key) => !key.includes('\\'))
    )
  }

  generateStartUrls = (domainName: string): string[] => {
    const startUrl: string[] = ['', 'www.', 'http://', 'https://', 'http://www.', 'https://www.']
    return startUrl.map((url) => `${url}${domainName}/`)
  }

  hasDuplicateProvidersGithubRepository(): boolean {
    const domainName = 'github.com'

    if (this.providers.github === undefined) {
      return false
    }

    const providersStartUrl: string[] = this.generateStartUrls(domainName)
    providersStartUrl.forEach((url) => {
      this.providers.github?.forEach((item) => {
        if (item.repository.startsWith(url)) {
          item.repository = item.repository.replace(url, '')
        }
      })
    })

    const repositories: string[] = this.providers.github.map((item) => item.repository)
    const uniqueRepositories: string[] = [...new Set(repositories)]
    return repositories.length !== uniqueRepositories.length
  }
}

suite('Config tests', () => {
  const configFilePath = '.docx.json'
  let configStr: string
  let configData: IConfig = { providers: {}, associations: {} }
  const expectedStructureError = `
    Expected structure:

    {
      "providers": {
        {provider}: [
          {
            "repository": {url}
          }
        ]
      }
      "associations": {
        {target}: [{documentationPath}]
        {target}: [{documentationPath}, {documentationPath}, ...],
      }
    }
    
    {provider} is a string that represents a provider name. For now, only "github" is supported.
    {target} are paths to files or directories that need to be documented.
    {documentationPath} are paths to documentation files.
    

    Example:

    {
      "providers": {
        "github": [
          {
            "repository": "https://github.com/mehdi-verfaillie/docx/"
          }
        ]
      },
      "associations": {
        "src": ["https://github.com/mehdi-verfaillie/docx/blob/main/README.md", "docs/global2.md"],
        "src/Services": ["docs/services.md"],
        "src/Utils/dates.ts": ["docs/utils/dates.md"]
      }
    }
  `
  before(async () => {
    try {
      string = await fs.readFile(configFilePath, 'utf-8')
      configData = JSON.parse(configStr)
    } catch (e) {
      console.error(e as Error)
    }
  })

  /*
    Test generate start urls function
  */
  test('Check if generate start url function works.', async () => {
    const error = `Generate start url function does not work.`
    const config = new Config({ providers: {}, associations: {} })
    const domainName = 'github.com'
    const expectedStartUrls = [
      '',
      'www.',
      `http://`,
      'https://',
      'http://www.',
      'https://www.',
    ].map((url) => `${url}${domainName}/`)
    const startUrls = config.generateStartUrls(domainName)
    assert.deepStrictEqual(startUrls, expectedStartUrls, error)
  })

  /*
  Test if configuration file exist
  */
  test('Check if configuration file exist', async () => {
    try {
      await fs.access(configFilePath, fs.constants.F_OK)
      assert.ok(true)
    } catch (e) {
      assert.fail(
        `Configuration file "${configFilePath}" was not found.\nError: ${(e as Error).message}`
      )
    }
  })

  /*
    Test if configuration file is JSON
  */
  test('Check if mocks data is JSON.', () => {
    const error = `Configuration file is not a JSON file.\n\n${expectedStructureError}`
    assert.strictEqual(isFileJson(''), false, error)
    assert.strictEqual(isFileJson('["a": "1"]'), false, error)
    assert.strictEqual(isFileJson('[1, "a", b]'), false, error)
    assert.strictEqual(isFileJson('[]'), true, error)
    assert.strictEqual(isFileJson('["a", 1, 2, 3, "z"]'), true, error)
    assert.strictEqual(isFileJson('{}'), true, error)
    assert.strictEqual(isFileJson('{"a": "1"}'), true, error)
    assert.strictEqual(isFileJson('{"a": 1, "b": 2}'), true, error)
    assert.strictEqual(
      isFileJson(`{
        "associations": {
          "src": ["docs/global.md", "docs/global2.md"],
          "src/Services": ["docs/services.md"],
          "src/Utils/dates.ts": ["docs/utils/dates.md"]
        }
      }`),
      true,
      error
    )
  })

  test('Check if configuration file data is JSON.', async () => {
    const error = `Configuration file is not a JSON file.\n\n${expectedStructureError}`
    assert.strictEqual(isFileJson(configStr), true, error)
  })

  /*
    Test if configuration file has good structure
  */
  test('Check if mocks data has good structure.', async () => {
    const error = `Configuration file has not good structure.\n\n${expectedStructureError}`

    // Mock data 1 - Empty associations
    const mockConfigData1 = {
      providers: {},
      associations: {},
    }
    const config1 = new Config(mockConfigData1)
    assert.strictEqual(config1.isTypeAssociationsTargetsCorrect(), true, error)
    assert.strictEqual(config1.isTypeAssociationsDocumentationsCorrect(), true, error)

    // Mock data 2 - Empty key
    const mockConfigData2 = {
      providers: {},
      associations: {
        '': ['docs/global.md'],
      },
    }
    const config2 = new Config(mockConfigData2)
    assert.strictEqual(config2.isTypeAssociationsTargetsCorrect(), false, error)
    assert.strictEqual(config2.isTypeAssociationsDocumentationsCorrect(), true, error)

    // Mock data 3 - Empty value
    const mockConfigData3 = {
      providers: {},
      associations: {
        'src/test': [''],
      },
    }
    const config3 = new Config(mockConfigData3)
    assert.strictEqual(config3.isTypeAssociationsTargetsCorrect(), true, error)
    assert.strictEqual(config3.isTypeAssociationsDocumentationsCorrect(), false, error)

    // Mock data 4 - Empty key and value
    const mockConfigData4 = {
      providers: {},
      associations: {
        '': [''],
      },
    }
    const config4 = new Config(mockConfigData4)
    assert.strictEqual(config4.isTypeAssociationsTargetsCorrect(), false, error)
    assert.strictEqual(config4.isTypeAssociationsDocumentationsCorrect(), false, error)

    // Mock data 5 - Good data
    const mockConfigData5 = {
      providers: {},
      associations: {
        'src': ['docs/global.md', 'docs/global2.md'],
        'src/Services': ['docs/services.md'],
        'src/Utils/dates.ts': ['docs/utils/dates.md'],
      },
    }
    const config5 = new Config(mockConfigData5)
    assert.strictEqual(config5.isTypeAssociationsTargetsCorrect(), true, error)
    assert.strictEqual(config5.isTypeAssociationsDocumentationsCorrect(), true, error)
  })

  test('Check if configuration file has good structure.', async () => {
    const error = `Configuration file has not good structure.\n\n${expectedStructureError}`
    const config = new Config(configData)
    assert.strictEqual(config.isTypeAssociationsTargetsCorrect(), true, error)
    assert.strictEqual(config.isTypeAssociationsDocumentationsCorrect(), true, error)
  })

  /*
    Test if configuration file has back slash in path
  */
  test('Check if mocks data has back slash.', async () => {
    const error = `Invalid path or url. Expected "/" but got "\\"`
    // Mock data 1 - Back slash in key
    const mockConfigData1 = {
      providers: {},
      associations: {
        'src': ['docs/global.md', 'docs/global2.md'],
        'src/Services': ['docs/services.md'],
        'src\\Utils\\dates.ts': ['docs/utils/dates.md'],
      },
    }
    const config1 = new Config(mockConfigData1)
    assert.strictEqual(config1.hasBackSlash(), true, error)

    // Mock data 2 - Back slash in value
    const mockConfigData2 = {
      providers: {},
      associations: {
        'src': ['docs/global.md', 'docs/global2.md'],
        'src/Services': ['docs\\services.md'],
        'src/Utils/dates.ts': ['docs\\utils\\dates.md'],
      },
    }
    const config2 = new Config(mockConfigData2)
    assert.strictEqual(config2.hasBackSlash(), true, error)

    // Mock data 3 - Back slash in key and value
    const mockConfigData3 = {
      providers: {},
      associations: {
        'src': ['docs\\global.md', 'docs\\global2.md'],
        'src\\Services': ['docs\\services.md'],
        'src\\Utils\\dates.ts': ['docs\\utils\\dates.md'],
      },
    }
    const config3 = new Config(mockConfigData3)
    assert.strictEqual(config3.hasBackSlash(), true, error)

    // Mock data 4 - Good data
    const mockConfigData4 = {
      providers: {},
      associations: {
        'src': ['docs/global.md', 'docs/global2.md'],
        'src/Services': ['docs/services.md'],
        'src/Utils/dates.ts': ['docs/utils/dates.md'],
      },
    }
    const config4 = new Config(mockConfigData4)
    assert.strictEqual(config4.hasBackSlash(), false, error)
  })

  test('Check if configuration file has back slash.', async () => {
    const error = `Invalid path or url. Expected "/" but got "\\"`
    const config = new Config(configData)
    assert.strictEqual(config.hasBackSlash(), false, error)
  })

  /*
    Test if configuration file has good providers structure
  */
  test('Check if mocks data has good providers structure.', async () => {
    const error = `Invalid providers structure or url.`
    // Mock data 1 - Empty providers
    const mockConfigData1 = {
      providers: {
        github: [],
      },
      associations: {
        src: ['docs/global.md', 'docs/global2.md'],
      },
    }
    const config1 = new Config(mockConfigData1)
    assert.strictEqual(config1.isTypeProvidersGithubRepositoryCorrect(), true, error)

    // Mock data 2 - Providers with empty repository
    const mockConfigData2 = {
      providers: {
        github: [{ repository: '' }, { repository: '' }],
      },
      associations: {
        src: ['docs/global.md', 'docs/global2.md'],
      },
    }
    const config2 = new Config(mockConfigData2)
    assert.strictEqual(config2.isTypeProvidersGithubRepositoryCorrect(), true, error)

    // Mock data 3 - Providers with bad repository
    const mockConfigData3 = {
      providers: {
        github: [{ repository: 'https://gitlab.com/mehdi-verfaillie/docx' }],
      },
      associations: {
        src: ['docs/global.md', 'docs/global2.md'],
      },
    }
    const config3 = new Config(mockConfigData3)
    assert.strictEqual(config3.isTypeProvidersGithubRepositoryCorrect(), false, error)

    // Mock data 4 - Providers with more bad repository
    const mockConfigData4 = {
      providers: {
        github: [{ repository: 'mehdi-verfaillie/docx' }],
      },
      associations: {
        src: ['docs/global.md', 'docs/global2.md'],
      },
    }
    const config4 = new Config(mockConfigData4)
    assert.strictEqual(config4.isTypeProvidersGithubRepositoryCorrect(), false, error)

    // Mock data 5 - Providers with more bad repository
    const mockConfigData5 = {
      providers: {
        github: [{ repository: 'https://gitlab.com/github.com/mehdi-verfaillie/docx/' }],
      },
      associations: {
        src: ['docs/global.md', 'docs/global2.md'],
      },
    }
    const config5 = new Config(mockConfigData5)
    assert.strictEqual(config5.isTypeProvidersGithubRepositoryCorrect(), false, error)

    // Mock data 6 - Providers with good repository
    const mockConfigData6 = {
      providers: {
        github: [
          { repository: '' },
          { repository: 'github.com/mehdi-verfaillie/docx' },
          { repository: 'www.github.com/mehdi-verfaillie/docx' },
          { repository: 'http://github.com/mehdi-verfaillie/docx' },
          { repository: 'https://github.com/mehdi-verfaillie/docx' },
          { repository: 'http://www.github.com/mehdi-verfaillie/docx' },
          { repository: 'https://www.github.com/mehdi-verfaillie/docx' },
        ],
      },
      associations: {
        src: ['docs/global.md', 'docs/global2.md'],
      },
    }
    const config6 = new Config(mockConfigData6)
    assert.strictEqual(config6.isTypeProvidersGithubRepositoryCorrect(), true, error)
  })

  test('Check if configuration file has good providers structure.', async () => {
    const error = `Invalid providers structure or url.`
    const config = new Config(configData)
    assert.strictEqual(config.isTypeProvidersGithubRepositoryCorrect(), true, error)
  })

  /*
    Test if configuration file has duplicate repository
  */
  test('Check if mocks data has duplicate repository.', async () => {
    // Mock data 1 - Duplicate repository
    const error = `Duplicate repository has been declared.`
    const mockConfigData1 = {
      providers: {
        github: [
          { repository: 'github.com/mehdi-verfaillie/docx' },
          { repository: '' },
          { repository: 'github.com/mehdi-verfaillie/docx' },
        ],
      },
      associations: {
        src: ['docs/global.md', 'docs/global2.md'],
      },
    }
    const config1 = new Config(mockConfigData1)
    assert.strictEqual(config1.hasDuplicateProvidersGithubRepository(), true, error)

    // Mock data 2 - Duplicate repository with different url
    const mockConfigData2 = {
      providers: {
        github: [
          { repository: 'github.com/mehdi-verfaillie/docx' },
          { repository: 'www.github.com/mehdi-verfaillie/docx' },
        ],
      },
      associations: {
        src: ['docs/global.md', 'docs/global2.md'],
      },
    }
    const config2 = new Config(mockConfigData2)
    assert.strictEqual(config2.hasDuplicateProvidersGithubRepository(), true, error)

    // Mock data 3 - Duplicate repository with more different url
    const mockConfigData3 = {
      providers: {
        github: [
          { repository: 'http://www.github.com/mehdi-verfaillie/docx' },
          { repository: 'https://github.com/mehdi-verfaillie/docx' },
        ],
      },
      associations: {
        src: ['docs/global.md', 'docs/global2.md'],
      },
    }
    const config3 = new Config(mockConfigData3)
    assert.strictEqual(config3.hasDuplicateProvidersGithubRepository(), true, error)

    // Mock data 4 - Duplicate repository with more different url
    const mockConfigData4 = {
      providers: {
        github: [
          { repository: 'https://www.github.com/mehdi-verfaillie/docx' },
          { repository: 'http://github.com/mehdi-verfaillie/docx' },
        ],
      },
      associations: {
        src: ['docs/global.md', 'docs/global2.md'],
      },
    }
    const config4 = new Config(mockConfigData4)
    assert.strictEqual(config4.hasDuplicateProvidersGithubRepository(), true, error)

    // Mock data 5 - Unique repository
    const mockConfigData5 = {
      providers: {
        github: [
          { repository: 'https://www.github.com/mehdi-verfaillie/docx' },
          { repository: 'github.com/mehdi-verfaillie/docx-2' },
        ],
      },
      associations: {
        src: ['docs/global.md', 'docs/global2.md'],
      },
    }
    const config5 = new Config(mockConfigData5)
    assert.strictEqual(config5.hasDuplicateProvidersGithubRepository(), false, error)
  })

  test('Check if configuration file has duplicate repository.', async () => {
    const error = `Duplicate repository has been declared.`
    const config = new Config(configData)
    assert.strictEqual(config.hasDuplicateProvidersGithubRepository(), false, error)
  })
})
