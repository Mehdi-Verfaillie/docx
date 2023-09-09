import { Uri, workspace, FileSystemError } from 'vscode'
import * as fs from 'fs'
import path = require('path')
import { Documentation } from '../association.manager'

export interface ProjectStructure {
  [key: string]: FileData | ProjectStructure
}

interface FileData {
  text: string
}

export class FileManager {
  private fs: typeof workspace.fs

  constructor(fs: typeof workspace.fs = workspace.fs) {
    this.fs = fs
  }

  public async ensureFileExists(uri: Uri): Promise<boolean> {
    try {
      await this.fs.stat(uri)
      return true
    } catch (error) {
      if (error instanceof Error && error?.message === 'File not found') {
        return false
      }
      throw FileSystemError.FileNotFound(uri)
    }
  }

  public async getFileContent(filePath: string): Promise<string> {
    try {
      const fileUint8Array = await this.fs.readFile(Uri.file(filePath))
      return new TextDecoder().decode(fileUint8Array)
    } catch (error) {
      throw new Error(`Failed to read file content: ${filePath}`)
    }
  }

  public filterMarkdownFiles(projectStructure: ProjectStructure) {
    const markdownFiles: Documentation[] = []

    function traverseStructure(obj: ProjectStructure) {
      for (const key in obj) {
        const currentValue = obj[key]

        if (currentValue && typeof currentValue === 'object') {
          if (!('text' in currentValue)) {
            traverseStructure(currentValue as ProjectStructure)
          } else if (key.endsWith('.md')) {
            const fileData = currentValue as FileData
            markdownFiles.push({ name: key, content: fileData.text, type: 'md' })
          }
        }
      }
    }

    traverseStructure(projectStructure)

    return markdownFiles
  }

  public mapStructure(directoryPath: string): ProjectStructure {
    const files = fs.readdirSync(directoryPath)

    return this.reformatStructure(directoryPath, files)
  }

  public reformatStructure(directoryPath: string, files: string[]): ProjectStructure {
    const structure: ProjectStructure = {}
    for (const file of files) {
      if (file.startsWith('.') || file === 'node_modules') {
        continue
      }
      const filePath = path.join(directoryPath, file)
      const stats = fs.statSync(filePath)

      if (stats.isDirectory()) {
        structure[file] = this.mapStructure(filePath)
      } else {
        const text = fs.readFileSync(filePath, 'utf8')
        structure[file] = { text: text }
      }
    }

    return structure
  }
  public processFileContent<T>(fileContent: string): T {
    return JSON.parse(fileContent) as T
  }
}
