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
  associations: { [key: string]: string[] }
}

class Config {
  associations: IConfig['associations']
  keys: IConfig['associations']['key']
  values: IConfig['associations'][string][]
  constructor(config: IConfig) {
    this.associations = config.associations
    this.keys = Object.keys(this.associations)
    this.values = Object.values(this.associations)
  }
  isAllTypesCorrect(): boolean {
    return (
      this.isTypeAssociationsCorrect() &&
      this.isTypeAssociationsKeysCorrect() &&
      this.isTypeAssociationsValuesCorrect()
    )
  }
  isTypeAssociationsCorrect(): boolean {
    return typeof this.associations === 'object'
  }
  isTypeAssociationsKeysCorrect(): boolean {
    return this.keys.every((key) => typeof key === 'string' && key !== '')
  }
  isTypeAssociationsValuesCorrect(): boolean {
    return this.values.every(
      (value) =>
        Array.isArray(value) && value.every((item) => typeof item === 'string' && item !== '')
    )
  }
  hasReverseSlash(): boolean {
    return !(
      this.values.every((value) => value.every((item) => !item.includes('\\'))) &&
      this.keys.every((key) => !key.includes('\\'))
    )
  }
}

suite('Config tests', () => {
  const configFilePath = '.docx.json'
  let configStr: string
  let configData: IConfig = { associations: {} }
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
  before(async () => {
    try {
      configStr = await fs.readFile(configFilePath, 'utf-8')
      configData = JSON.parse(configStr)
    } catch (e) {
      console.error(e as Error)
    }
  })

  test('Configuration file exist', async () => {
    try {
      await fs.access(configFilePath, fs.constants.F_OK)
      assert.ok(true)
    } catch (e) {
      assert.fail(
        `Configuration file "${configFilePath}" was not found.\nError: ${(e as Error).message}`
      )
    }
  })

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

  test('Check if mocks data has good structure.', async () => {
    const error = `Configuration file has not good structure.\n\n${expectedStructureError}`

    // Mock data 1 - Empty key
    const mockConfigData1 = {
      associations: {
        'src': ['docs/global.md', 'docs/global2.md'],
        'src/Services': ['docs/services.md'],
        'src/Utils/dates.ts': ['docs/utils/dates.md'],
        '': ['docs/global.md'],
      },
    }
    const config1 = new Config(mockConfigData1)
    assert.strictEqual(config1.isTypeAssociationsCorrect(), true, error)
    assert.strictEqual(config1.isTypeAssociationsKeysCorrect(), false, error)
    assert.strictEqual(config1.isTypeAssociationsValuesCorrect(), true, error)
    assert.strictEqual(config1.isAllTypesCorrect(), false, error)

    // Mock data 2 - Empty value
    const mockConfigData2 = {
      associations: {
        'src': ['docs/global.md', 'docs/global2.md'],
        'src/Services': ['docs/services.md'],
        'src/Utils/dates.ts': ['docs/utils/dates.md'],
        'src/test': [''],
      },
    }
    const config2 = new Config(mockConfigData2)
    assert.strictEqual(config2.isTypeAssociationsCorrect(), true, error)
    assert.strictEqual(config2.isTypeAssociationsKeysCorrect(), true, error)
    assert.strictEqual(config2.isTypeAssociationsValuesCorrect(), false, error)
    assert.strictEqual(config2.isAllTypesCorrect(), false, error)

    // Mock data 3 - Empty key and value
    const mockConfigData3 = {
      associations: {
        'src': ['docs/global.md', 'docs/global2.md'],
        'src/Services': ['docs/services.md'],
        'src/Utils/dates.ts': ['docs/utils/dates.md'],
        '': [''],
      },
    }
    const config3 = new Config(mockConfigData3)
    assert.strictEqual(config3.isTypeAssociationsCorrect(), true, error)
    assert.strictEqual(config3.isTypeAssociationsKeysCorrect(), false, error)
    assert.strictEqual(config3.isTypeAssociationsValuesCorrect(), false, error)
    assert.strictEqual(config3.isAllTypesCorrect(), false, error)

    // Mock data 4 - Good data
    const mockConfigData4 = {
      associations: {
        'src': ['docs/global.md', 'docs/global2.md'],
        'src/Services': ['docs/services.md'],
        'src/Utils/dates.ts': ['docs/utils/dates.md'],
      },
    }
    const config4 = new Config(mockConfigData4)
    assert.strictEqual(config4.isTypeAssociationsCorrect(), true, error)
    assert.strictEqual(config4.isTypeAssociationsKeysCorrect(), true, error)
    assert.strictEqual(config4.isTypeAssociationsValuesCorrect(), true, error)
    assert.strictEqual(config4.isAllTypesCorrect(), true, error)
  })

  test('Check if configuration file has good structure.', async () => {
    const error = `Configuration file has not good structure.\n\n${expectedStructureError}`
    const config = new Config(configData)
    assert.strictEqual(config.isTypeAssociationsCorrect(), true, error)
    assert.strictEqual(config.isTypeAssociationsKeysCorrect(), true, error)
    assert.strictEqual(config.isTypeAssociationsValuesCorrect(), true, error)
    assert.strictEqual(config.isAllTypesCorrect(), true, error)
  })

  test('Check if mocks data has reverse slash.', async () => {
    const error = `Invalid path or url. Expected "/" but got "\\"`
    // Mock data 1 - Reverse slash in key
    const mockConfigData1 = {
      associations: {
        'src': ['docs/global.md', 'docs/global2.md'],
        'src/Services': ['docs/services.md'],
        'src\\Utils\\dates.ts': ['docs/utils/dates.md'],
      },
    }
    const config1 = new Config(mockConfigData1)
    assert.strictEqual(config1.hasReverseSlash(), true, error)

    // Mock data 2 - Reverse slash in value
    const mockConfigData2 = {
      associations: {
        'src': ['docs/global.md', 'docs/global2.md'],
        'src/Services': ['docs\\services.md'],
        'src/Utils/dates.ts': ['docs\\utils\\dates.md'],
      },
    }
    const config2 = new Config(mockConfigData2)
    assert.strictEqual(config2.hasReverseSlash(), true, error)

    // Mock data 3 - Reverse slash in key and value
    const mockConfigData3 = {
      associations: {
        'src': ['docs\\global.md', 'docs\\global2.md'],
        'src\\Services': ['docs\\services.md'],
        'src\\Utils\\dates.ts': ['docs\\utils\\dates.md'],
      },
    }
    const config3 = new Config(mockConfigData3)
    assert.strictEqual(config3.hasReverseSlash(), true, error)

    // Mock data 4 - Good data
    const mockConfigData4 = {
      associations: {
        'src': ['docs/global.md', 'docs/global2.md'],
        'src/Services': ['docs/services.md'],
        'src/Utils/dates.ts': ['docs/utils/dates.md'],
      },
    }
    const config4 = new Config(mockConfigData4)
    assert.strictEqual(config4.hasReverseSlash(), false, error)
  })

  test('Check if configuration file has reverse slash.', async () => {
    const error = `Invalid path or url. Expected "/" but got "\\"`
    const config = new Config(configData)
    assert.strictEqual(config.hasReverseSlash(), false, error)
  })
})
