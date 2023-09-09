import axios from 'axios';
import { normalizeData } from '../normalizer/dataNormalizer';

// Interface ReadmeData
interface ReadmeData {
  download_url: string;
  // Ajoutez d'autres propriétés si nécessaire
}

// Fonction pour vérifier la structure des données du README
export function isReadmeData(data: unknown): data is ReadmeData {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof (data as ReadmeData).download_url === 'string'
  );
}

class GithubApiProvider {
  constructor(private readonly token: string) {}

  async getReadme(owner: string, repo: string): Promise<string> {
    const url = `https://api.github.com/repos/${owner}/${repo}/readme`;

    try {
      const response = await axios.get(url);

      if (response.status === 200) {
        const data = response.data;

        if (isReadmeData(data)) {
          const downloadUrl = data.download_url;
          const readmeResponse = await axios.get(downloadUrl);
          const readmeText = readmeResponse.data;
          return normalizeData(readmeText); // Normalisation des données
        } else {
          throw new Error('Unable to find download URL for README');
        }
      } else {
        throw new Error(`Unable to fetch README. Status: ${response.status}`);
      }
    } catch (error) {
      throw error;
    }
  }

  // Fonction principale
  async main() {
    const owner = 'Mehdi-Verfaillie';
    const repo = 'docx';

    try {
      const readme = await this.getReadme(owner, repo);
      console.log(readme);
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }
}

export default GithubApiProvider;
