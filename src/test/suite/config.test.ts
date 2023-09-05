import * as assert from 'assert'
import * as fs from 'fs/promises'
import { Convert } from '../../utils/configTypeGuard'

suite('Config tests', () => {
  const filePath = '.docx.json'
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

  test('Configuration file exist', async () => {
    const checkFileExist = async (filePath: string): Promise<boolean> => {
      try {
        await fs.access(filePath, fs.constants.F_OK)
        return true
      } catch (error) {
        return false
      }
    }
    assert.strictEqual(
      await checkFileExist(filePath),
      true,
      `Configuration file "${filePath}" was not found.
      Please create a configuration file named .docx.json on the root of the project.

      ${expectedStructureError}`
    )
  })

  test('Configuration is a JSON file.', async () => {
    try {
      const config = JSON.parse(await fs.readFile(filePath, 'utf8'))
      assert.strictEqual(typeof config, 'object', 'Configuration file is not a JSON file.')
    } catch (e) {
      assert.fail(`
        Configuration file is not a JSON file.
        Error: ${(e as Error).message}

        ${expectedStructureError}
      `)
    }
  })

  test('Configuration file has good structure.', async () => {
    try {
      const configJson = await fs.readFile(filePath, 'utf8')
      const config = Convert.toConfig(configJson) // Convert JSON to Config object with typing guard.
      assert.ok(config)
    } catch (e) {
      assert.fail(`
        Configuration file has not good structure.
        Error: ${(e as Error).message}
        
        ${expectedStructureError}
      `)
    }
  })

  test('Configuration file has good keys and values.', async () => {
    try {
      const configJson = await fs.readFile(filePath, 'utf8')
      const config = Convert.toConfig(configJson) // Convert JSON to Config object with typing guard.

      const isValidPath = (str: string): void => {
        if (str.includes('\\')) {
          throw new Error(`Invalid path or url: "${str}". Expected "/" but got "\\"`)
        }
      }
      for (const [key, values] of Object.entries(config.associations)) {
        isValidPath(key)
        for (const value of values) {
          isValidPath(value)
        }
      }

      assert.ok(true)
    } catch (e) {
      assert.fail(`
        Configuration file has not good structure.
        Error: ${(e as Error).message}
      `)
    }
  })
})
