import * as assert from 'assert';
import { describe } from 'mocha';
import { openFiles } from '../../feature/openFiles';

describe('File Utils Test Suite', () => {
  test('Open file in VS Code', async () => {
    const filePath = process.env.MY_PATH+ '/readme.md';
    try {
      await openFiles(filePath);
      console.log('Le test a réussi : Le fichier a été ouvert avec succès dans VS Code.');
    } catch (error) {
      assert.fail(`Failed to open file in VS Code: ${error}`);
    }
  });
});





