import axios from 'axios';
import GithubApiProvider, { isReadmeData } from '../../provider/index'; // Assurez-vous du chemin correct
import { expect } from 'chai'; // Importez expect de chai
import MockAdapter from 'axios-mock-adapter';

describe('Test de la fonction getReadme', function () {
  const mock = new MockAdapter(axios);

  it('devrait récupérer le README avec succès', async function () {
    const owner = 'Mehdi-Verfaillie';
    const repo = 'docx';

    const githubApi = new GithubApiProvider('');

    mock.onGet(`https://api.github.com/repos/${owner}/${repo}/readme`).reply(200, {
      download_url: 'https://example.com/readme.txt',
    });

    mock.onGet('https://example.com/readme.txt').reply(200, 'Contenu du README');

    try {
      const readme = await githubApi.getReadme(owner, repo);

      expect(readme).to.be.a('string');
      expect(readme.length).to.be.greaterThan(0);
    } catch (error) {
      // Si une erreur se produit, le test échouera ici
      throw error;
    }
  });

  afterEach(function () {
    mock.reset();
  });
});

describe('Test de la fonction isReadmeData', function () {
  it('devrait retourner true pour une structure de données de README valide', function () {
    const validReadmeData = {
      download_url: 'https://example.com/readme.txt',
    };

    const result = isReadmeData(validReadmeData);

    expect(result).to.be.true;
  });

  it('devrait retourner false pour une structure de données de README invalide', function () {
    const invalidReadmeData = {
      download_url: 123, // download_url doit être une chaîne de caractères
    };

    const result = isReadmeData(invalidReadmeData);

    expect(result).to.be.false;
  });
});
