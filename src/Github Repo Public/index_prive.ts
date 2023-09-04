interface ReadmeData {
  download_url: string;
  // Ajoutez d'autres propriétés si nécessaire
}

async function getReadme(owner: string, repo: string, token: string): Promise<string> {
  const fetch = await import('node-fetch').then((module) => module.default);
  const url = `https://api.github.com/repos/${owner}/${repo}/readme`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

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

async function main() {
  const owner = 'jeremyschiap';
  const repo = 'repo_prive';
  const token = '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';

  try {
    const readme = await getReadme(owner, repo, token);
    console.log(readme);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();