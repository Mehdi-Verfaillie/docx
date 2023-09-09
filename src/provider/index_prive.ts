import axios from 'axios';
import { normalizeData } from '../normalizer/dataNormalizer';

// Interface pour les données du README
interface ReadmeData {
  download_url: string;
  // Ajoutez d'autres propriétés si nécessaire
}

class GithubApiProvider {
  private readonly baseUrl: string;
  private readonly token: string;

  constructor(token: string) {
    this.baseUrl = 'https://api.github.com';
    this.token = token;
  }

  isReadmeData(data: any): data is ReadmeData {
    if (data && typeof data === 'object') {
      // Assurez-vous que toutes les propriétés nécessaires sont présentes
      if ('content' in data && 'encoding' in data) {
        // Vérifiez que 'content' est une chaîne non vide et que 'encoding' est une chaîne
        if (typeof data.content === 'string' && typeof data.encoding === 'string' && data.content.trim() !== '') {
          return true;
        }
      }
    }
    return false;
  }

  async getReadme(owner: string, repo: string): Promise<string | undefined> {
    const readmeUrl = `${this.baseUrl}/repos/${owner}/${repo}/readme`;
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };

    try {
      const response = await axios.get(readmeUrl, { headers });

      if (response.status === 200) {
        const data: ReadmeData = response.data;
        const readmeResponse = await axios.get(data.download_url);
        const readmeText = readmeResponse.data;

        // Normalisez les données avant de les retourner
        const normalizedData = normalizeData(readmeText);

        return normalizedData;
      } else {
        throw new Error(`Unable to fetch README. Status: ${response.status}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('An error occurred:', error.message);
      }
    }
  }
}


export default GithubApiProvider;

// Appel de la fonction main pour exécuter le code
async function main() {
  const owner = 'jeremyschiap';
  const repo = 'repo_prive';

  // Remplacez 'VOTRE_TOKEN' par votre véritable token GitHub
  const token = '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';

  const githubApi = new GithubApiProvider(token);

  try {
    const readme = await githubApi.getReadme(owner, repo);
    console.log(readme);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main(); // Appel de la fonction principale
