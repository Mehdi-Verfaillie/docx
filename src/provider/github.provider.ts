import { Octokit } from 'octokit'

// {
//     "providers": {
//         "github": [
//             {
//                 "repository": "https://github.com/Lynch-cai/docx-documentations-public",
//                 "token": ""
//             }
//         ]
//     },
//     "associations": {
//         "src": ["/documentations/ifTernary.md", "/documentations/asyncAwait.md"],
//         "src/Controllers": ["/documentations/controllers.md"],
//         "src/Modules": ["/documentations/modules.md"],
//         "src/Utils/dates.ts": ["/documentations/utils/dates.md"]
//     }
// }
export class GithubProvider {
  private repositorie

  private octokit: Octokit
  private utilisateur: string
  private depot: string

  constructor(repositorie: string[]) {
    this.repositorie = repositorie
    this.octokit = new Octokit()
    this.utilisateur = 'jeremyschiap'
    this.depot = 'test-repo'
  }

  public documentation: {
    type: string
    title: string
    content: string
  }[] = []
  public async getDocumentation(dossier: string) {
    const { data } = await this.getContentGithub(dossier)
    if (Array.isArray(data)) {
      for (const element of data) {
        if (element.type === 'file' && element.name === 'README.md') {
          const contentFichier = await this.getContentGithub(element.path)
          if ('content' in contentFichier.data) {
            this.readFileGithub(contentFichier, element)
          }
        } else if (element.type === 'dir') {
          await this.getDocumentation(element.path)
        }
      }
    }
    return this.documentation
  }

  public async getContentGithub(path: string) {
    return await this.octokit.rest.repos.getContent({
      owner: this.utilisateur,
      repo: this.depot,
      path: path,
    })
  }

  public readFileGithub(contentFichier, element) {
    const contentTexte = Buffer.from(contentFichier.data.content, 'base64').toString('utf-8')

    // Analyser le content pour extraire l'type, le title et le content
    const type = element.name.split('.').pop() || 'N/A'
    const titleMatch = contentTexte.match(/^# (.+)/m)
    const title = titleMatch ? titleMatch[1] : 'title non trouvé'

    // Ajouter les informations à la liste de documentation
    this.documentation.push({
      type,
      title,
      content: contentTexte,
    })
  }
}
