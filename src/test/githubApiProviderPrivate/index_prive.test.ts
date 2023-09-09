import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import GithubApiProvider from '../../provider/index_prive';
import { expect } from 'chai';

const mock = new MockAdapter(axios);

describe('Test de GithubApiProvider', function () {
  const owner = 'jeremyschiap';
  const repo = 'repo_prive';
  const token = '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';

  it('devrait récupérer le README avec succès', async function () {
    const githubApi = new GithubApiProvider(token);

    mock.onGet(`https://api.github.com/repos/${owner}/${repo}/readme`).reply(200, {
      download_url: 'https://example.com/readme.txt',
    });

    mock.onGet('https://example.com/readme.txt').reply(200, 'Contenu du README');

    const readme = await githubApi.getReadme(owner, repo);

    expect(typeof readme).to.equal('string');
    expect(readme.length).to.be.greaterThan(0);
  });

  it('devrait gérer une erreur 401 correctement', async function () {
    const githubApi = new GithubApiProvider(token);

    mock.onGet(`https://api.github.com/repos/${owner}/${repo}/readme`).reply(401);

    try {
      await githubApi.getReadme(owner, repo);
    } catch (error) {
      expect(error).to.be.an.instanceOf(Error);
      expect(error.message).to.equal('Unable to fetch README. Status: 401');
      if ('response' in error) {
        expect(error.response).to.be.an('object');
        expect(error.response.status).to.equal(401);
      } else {
        throw new Error('HTTP response not available in error object');
      }
    }
  });

  it('devrait gérer une erreur 404 correctement', async function () {
    const githubApi = new GithubApiProvider(token);

    mock.onGet(`https://api.github.com/repos/${owner}/${repo}/readme`).reply(404);

    try {
      await githubApi.getReadme(owner, repo);
    } catch (error) {
      expect(error).to.be.an.instanceOf(Error);
      expect(error.message).to.equal('Unable to fetch README. Status: 404');
      if ('response' in error) {
        expect(error.response).to.be.an('object');
        expect(error.response.status).to.equal(404);
      } else {
        throw new Error('HTTP response not available in error object');
      }
    }
  });

  it('devrait gérer une erreur 500 correctement', async function () {
    const githubApi = new GithubApiProvider(token);

    mock.onGet(`https://api.github.com/repos/${owner}/${repo}/readme`).reply(500);

    try {
      await githubApi.getReadme(owner, repo);
    } catch (error) {
      expect(error).to.be.an.instanceOf(Error);
      expect(error.message).to.equal('Unable to fetch README. Status: 500');
      if ('response' in error) {
        expect(error.response).to.be.an('object');
        expect(error.response.status).to.equal(500);
      } else {
        throw new Error('HTTP response not available in error object');
      }
    }
  });

  it('devrait gérer une erreur de connexion', async function () {
    const githubApi = new GithubApiProvider(token);

    mock.onGet(`https://api.github.com/repos/${owner}/${repo}/readme`).networkError();

    try {
      await githubApi.getReadme(owner, repo);
    } catch (error) {
      expect(error.message).to.equal('Network Error');
    }
  });

  it('devrait gérer un délai d\'attente dépassé', async function () {
    const githubApi = new GithubApiProvider(token);

    mock.onGet(`https://api.github.com/repos/${owner}/${repo}/readme`).timeout();

    try {
      await githubApi.getReadme(owner, repo);
    } catch (error) {
      expect(error.message).to.equal('timeout of 0ms exceeded');
    }
  });

  it('devrait retourner true pour une structure de données de README valide', function () {
    const validReadmeData = {
      content: 'Contenu du README en base64',
      encoding: 'base64',
    };

    const githubApi = new GithubApiProvider('');

    const result = githubApi.isReadmeData(validReadmeData);

    expect(result).to.be.true;
  });

  it('devrait retourner false pour une structure de données de README avec contenu manquant', function () {
    const readmeDataMissingContent = {
      encoding: 'base64',
    };

    const githubApi = new GithubApiProvider('');

    const result = githubApi.isReadmeData(readmeDataMissingContent);

    expect(result).to.be.false;
  });

  it('devrait retourner false pour une structure de données de README avec contenu vide', function () {
    const readmeDataEmptyContent = {
      content: '',
      encoding: 'base64',
    };

    const githubApi = new GithubApiProvider('');

    const result = githubApi.isReadmeData(readmeDataEmptyContent);

    expect(result).to.be.false;
  });

  it('devrait retourner false pour une structure de données de README avec encodage incorrect', function () {
    const readmeDataIncorrectEncoding = {
      content: 'Contenu du README en base64',
      encoding: 123, // Encodage incorrect (doit être une chaîne de caractères)
    };

    const githubApi = new GithubApiProvider('');

    const result = githubApi.isReadmeData(readmeDataIncorrectEncoding);

    expect(result).to.be.false;
  });
});

