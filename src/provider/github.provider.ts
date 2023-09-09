import axios from 'axios'
import * as vscode from 'vscode'
import { ErrorHandler } from './local.provider'
import { Documentation } from '../association.manager'

export class GithubProvider {
  private repositorie
  constructor(repositorie: string[]) {
    this.repositorie = repositorie
  }

  public async getDocumentations(): Promise<Documentation[]> {
    const data: Documentation[] = []

    const fetchData = async () => {
      this.repositorie.map(async () => {
        try {
          const res = await axios.get(this.repositorie[0].toString())
          const urlDocument = await axios.get(res.data.download_url)
          data.push({ name: res.data.name, content: urlDocument.data, type: 'md' })
          // return { name: res.data.name, content: urlDocument.data, type: 'md' }
        } catch (err) {
          const error: ErrorHandler = err as ErrorHandler
          vscode.window.showErrorMessage(
            "Une erreur s'est produite lors de l'ouverture du fichier : " + error
          )
          data.push({ name: 'FileNotFound', content: 'FileNotFound', type: 'md' })

          // return { name: 'FileNotFound', content: 'FileNotFound', type: 'md' }
        }
      })
      return data
    }

    return await fetchData()
  }
}
