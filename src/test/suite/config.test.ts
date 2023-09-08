/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai'
import { describe, setup, it } from 'mocha'
import { Config } from '../../config'
describe('Config tests', () => {
  let config: Config
  let globalMocksBadFiles: string[] = []

  const expectedStructureError = `
    Expected structure:

    {
      "associations": {
        {key}: [{value}]
        {key}: [{value}, {value}, ...],
      }
    }
    
    {key} are paths to files or directories that need to be documented.
    {value} are paths to documentation files.
    

    Example:

    {
      "associations": {
        "src": ["docs/global.md", "docs/global2.md"],
        "src/Services": ["docs/services.md"],
        "src/Utils/dates.ts": ["docs/utils/dates.md"]
      }
    }
  `
  setup(() => {
    config = new Config()
  })

  it('should ensure that file type is json', () => {
    const error = `isJsonFile function is not working correctly.\n\n${expectedStructureError}`
    const mocksBadFiles = [``, `["a": "1"]`, `[1, "a", b]`]
    const mocksGoodFiles = [
      `[]`,
      `["a", 1, 2, 3, "z"]`,
      `{}`,
      `{"a": "1"}`,
      `{"a": 1, "b": 2}`,
      `{
        "associations": {
          "src": ["docs/global.md", "docs/global2.md"],
          "src/Services": ["docs/services.md"],
          "src/Utils/dates.ts": ["docs/utils/dates.md"]
        }
      }`,
    ]
    mocksBadFiles.forEach((mockFile) => {
      expect(config.isJsonFile(mockFile), error).to.be.false
    })
    mocksGoodFiles.forEach((mockFile) => {
      expect(config.isJsonFile(mockFile), error).to.be.true
    })
  })

  it('should ensure type association is correct.', async () => {
    const error = `isTypeAssociationsCorrect method is not working correctly.\n\n${expectedStructureError}`
    const mocksBadFiles = [``, `[]`, `{}`, `1`, `true`, `false`]
    const mocksGoodFiles = [
      `{"associations": {}}`,
      `{"associations": {"": [""]}}`,
      `{"associations": {"src": ["docs/global.md"]}}`,
      `{
        "associations": {
          "src": ["docs/global.md", "docs/global2.md"],
          "src/Controllers": ["docs/controllers.md"]
        }
      }`,
    ]
    globalMocksBadFiles = globalMocksBadFiles.concat(mocksBadFiles)

    mocksBadFiles.forEach((mockFile) => {
      if (config.isJsonFile(mockFile)) {
        const mockConfigData = JSON.parse(mockFile)
        expect(config.isTypeAssociationsCorrect(mockConfigData), error).to.be.false
      }
    })

    mocksGoodFiles.forEach((mockFile) => {
      if (config.isJsonFile(mockFile)) {
        const mockConfigData = JSON.parse(mockFile)
        expect(config.isTypeAssociationsCorrect(mockConfigData), error).to.be.true
      }
    })
  })

  it('should ensure type association keys is correct.', async () => {
    const error = `isTypeAssociationsKeysCorrect method is not working correctly.\n\n${expectedStructureError}`
    const mocksBadFiles = [
      `{ 
        associations: { 
          '': ['docs/global.md', 'docs/global2.md'] 
        } 
      }`,
      `{
        associations: {
          '': ['docs/global.md', 'docs/global2.md'],
          'src': ['docs/global.md', 'docs/global2.md']
        }
      }`,
      `{
        associations: {
          '': ['docs/global.md', 'docs/global2.md'],
          'src': ['docs/global.md', 'docs/global2.md']
        }
      }`,
      `{ associations: ['docs/global.md', 'docs/global2.md'] }`,
      `{ assos: { 'src': ['docs/global.md', 'docs/global2.md'] } }`,
    ]
    const mocksGoodFiles = [
      `{
        associations: {
          'src': ['docs/global.md', 'docs/global2.md']
        }
      }`,
      `{
        associations: {
          'src': ['docs/global.md', 'docs/global2.md'],
          'src/Controllers': ['docs/controllers.md']
        }
      }`,
      `{
        associations: {
          'src': ['docs/global.md', 'docs/global2.md'],
          true: ['docs/controllers.md'],
          false: ['docs/controllers.md'],
          1: ['docs/controllers.md'],
          0: ['docs/controllers.md'],
        },
      }`,
    ]
    globalMocksBadFiles = globalMocksBadFiles.concat(mocksBadFiles)
    mocksBadFiles.forEach((mockFile) => {
      if (config.isJsonFile(mockFile)) {
        const mockConfigData = JSON.parse(mockFile)
        expect(config.isTypeAssociationsTargetsCorrect(mockConfigData), error).to.be.false
      }
    })

    mocksGoodFiles.forEach((mockFile) => {
      if (config.isJsonFile(mockFile)) {
        const mockConfigData = JSON.parse(mockFile)
        expect(config.isTypeAssociationsTargetsCorrect(mockConfigData), error).to.be.true
      }
    })
  })

  it('should ensure type association documentations is correct.', async () => {
    const error = `Configuration file has not good structure.\n\n${expectedStructureError}`
    const mocksBadFiles = [
      `{ associations: { 'src': '' } }`,
      `{ associations: { 'src': 'docs/global.md' } }`,
      `{ associations: { 'src': true } }`,
      `{ associations: { 'src': 1 } }`,
      `{ associations: { 'src': null } }`,
      `{ associations: { 'src': undefined } }`,
      `{ associations: { 'src': [] } }`,
      `{ associations: { 'src': [''] } }`,
      `{
        associations: {
          'src': ['docs/global.md', 'docs/global2.md', ''],
          'src/Controllers': ['docs/controllers.md']
        }
      }`,
      `{ associations: ['docs/global.md', 'docs/global2.md', ''] }`,
      `{ assos: { 'src': ['docs/global.md', 'docs/global2.md'] } }`,
    ]
    const mocksGoodFiles = [
      `{ associations: { 'src': ['docs/global.md'] } }`,
      `{
        associations: {
          'src': ['docs/global.md', 'docs/global2.md'],
          'src/Controllers': ['docs/controllers.md']
        }
      }`,
    ]
    globalMocksBadFiles = globalMocksBadFiles.concat(mocksBadFiles)

    mocksBadFiles.forEach((mockFile) => {
      if (config.isJsonFile(mockFile)) {
        const mockConfigData = JSON.parse(mockFile)
        expect(config.isTypeAssociationsDocsCorrect(mockConfigData), error).to.be.false
      }
    })

    mocksGoodFiles.forEach((mockFile) => {
      if (config.isJsonFile(mockFile)) {
        const mockConfigData = JSON.parse(mockFile)
        expect(config.isTypeAssociationsDocsCorrect(mockConfigData), error).to.be.true
      }
    })
  })

  it("should ensure there's no back slash in path", async () => {
    const error = `Invalid path or url. Expected "/" but got "\\"`
    const mocksBadFiles = [
      `{
        associations: {
          'src': ['docs/global.md', 'docs/global2.md'],
          'src/Services': ['docs/services.md'],
          'src\\Utils\\dates.ts': ['docs/utils/dates.md']
        }
      }`,
      `{
        associations: {
          'src': ['docs/global.md', 'docs/global2.md'],
          'src/Services': ['docs\\services.md'],
          'src/Utils/dates.ts': ['docs\\utils\\dates.md']
        }
      }`,
      `{
        associations: {
          'src': ['docs\\global.md', 'docs\\global2.md'],
          'src\\Services': ['docs\\services.md'],
          'src\\Utils\\dates.ts': ['docs\\utils\\dates.md'],
        },
      }`,
    ]

    const mocksGoodFiles = [
      `{
        associations: {
          'src': ['docs/global.md', 'docs/global2.md'],
          'src/Services': ['docs/services.md'],
          'src/Utils/dates.ts': ['docs/utils/dates.md'],
        },
      }`,
    ]
    globalMocksBadFiles = globalMocksBadFiles.concat(mocksBadFiles)

    mocksBadFiles.forEach((mockFile) => {
      if (config.isJsonFile(mockFile)) {
        const mockConfigData = JSON.parse(mockFile)
        expect(config.hasReverseSlash(mockConfigData), error).to.be.true
      }
    })

    mocksGoodFiles.forEach((mockFile) => {
      if (config.isJsonFile(mockFile)) {
        const mockConfigData = JSON.parse(mockFile)
        expect(config.hasReverseSlash(mockConfigData), error).to.be.false
      }
    })
  })

  it('should ensure structure, typing, path is correct', async () => {
    const error = `Configuration file has not good structure.\n\n${expectedStructureError}`
    const mocksBadFiles = globalMocksBadFiles
    const mocksGoodFiles = [
      `{
        associations: {
          'src': ['docs/global.md', 'docs/global2.md'],
        },
      }`,
      `{
        associations: {
          'src': ['docs/global.md', 'docs/global2.md'],
          'src/Services': ['docs/services.md'],
          'src/Utils/dates.ts': ['docs/utils/dates.md'],
        },
      }`,
    ]

    mocksBadFiles.forEach((mockFile) => {
      if (config.isJsonFile(mockFile)) {
        const mockConfigData = JSON.parse(mockFile)
        expect(config.isEverythingCorrect(mockConfigData), error).to.be.false
      }
    })

    mocksGoodFiles.forEach((mockFile) => {
      if (config.isJsonFile(mockFile)) {
        const mockConfigData = JSON.parse(mockFile)
        expect(config.isEverythingCorrect(mockConfigData), error).to.be.true
      }
    })
  })
})
