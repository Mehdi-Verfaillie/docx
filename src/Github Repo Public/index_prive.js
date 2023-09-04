"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function getReadme(owner, repo, token) {
    return __awaiter(this, void 0, void 0, function* () {
        const fetch = yield Promise.resolve().then(() => require('node-fetch')).then((module) => module.default);
        const url = `https://api.github.com/repos/${owner}/${repo}/readme`;
        const response = yield fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (response.status === 200) {
            const data = yield response.json();
            if (isReadmeData(data)) {
                const downloadUrl = data.download_url;
                const readmeResponse = yield fetch(downloadUrl);
                const readmeText = yield readmeResponse.text();
                return readmeText;
            }
            else {
                throw new Error('Unable to find download URL for README');
            }
        }
        else {
            throw new Error(`Unable to fetch README. Status: ${response.status}`);
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const owner = 'Mehdi-Verfaillie';
        const repo = 'docx';
        const token = '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';
        try {
            const readme = yield getReadme(owner, repo, token);
            console.log(readme);
        }
        catch (error) {
            console.error('An error occurred:', error);
        }
    });
}
main();
