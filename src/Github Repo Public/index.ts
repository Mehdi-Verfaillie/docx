interface ReadmeData {
    download_url: string;
    // Ajoutez d'autres propriétés si nécessaire
  }
  
  async function getReadmee(owner: string, repo: string): Promise<string> {
    const url = `https://api.github.com/repos/${owner}/${repo}/readme`;
    const response = await fetch(url);
  
    if (response.status === 200) {
      const data = await response.json();
  
      if (isReadmeData(data)) {
        const downloadUrl = data.download_url;
        const readmeResponse = await fetch(downloadUrl);
        const readmeText = await readmeResponse.text();
        return readmeText;
      } else {
        throw new Error('Unable to find download URL for README');
      }
    } else {
      throw new Error(`Unable to fetch README. Status: ${response.status}`);
    }
  }
  
  function isReadmeData(data: unknown): data is ReadmeData {
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof (data as ReadmeData).download_url === 'string'
    );
  }
  
  async function mainn() {
    const owner = 'Mehdi-Verfaillie';
    const repo = 'docx';
  
    try {
      const readme = await getReadmee(owner, repo);
      console.log(readme);
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }
  
  mainn();
  