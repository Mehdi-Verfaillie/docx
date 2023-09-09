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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var axios_mock_adapter_1 = require("axios-mock-adapter");
var index_prive_1 = require("../../provider/index_prive");
var chai_1 = require("chai");
var mocha_1 = require("mocha");
var mock = new axios_mock_adapter_1.default(axios_1.default);
(0, mocha_1.describe)('Test de GithubApiProvider', function () {
    var owner = 'jeremyschiap';
    var repo = 'repo_prive';
    var token = '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';
    (0, mocha_1.it)('devrait récupérer le README avec succès', function () {
        return __awaiter(this, void 0, void 0, function () {
            var githubApi, readme;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        githubApi = new index_prive_1.default(token);
                        mock.onGet("https://api.github.com/repos/".concat(owner, "/").concat(repo, "/readme")).reply(200, {
                            download_url: 'https://example.com/readme.txt',
                        });
                        mock.onGet('https://example.com/readme.txt').reply(200, 'Contenu du README');
                        return [4 /*yield*/, githubApi.getReadme(owner, repo)];
                    case 1:
                        readme = _a.sent();
                        (0, chai_1.expect)(typeof readme).to.equal('string');
                        (0, chai_1.expect)(readme.length).to.be.greaterThan(0);
                        return [2 /*return*/];
                }
            });
        });
    });
    (0, mocha_1.it)('devrait gérer une erreur 401 correctement', function () {
        return __awaiter(this, void 0, void 0, function () {
            var githubApi, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        githubApi = new index_prive_1.default(token);
                        mock.onGet("https://api.github.com/repos/".concat(owner, "/").concat(repo, "/readme")).reply(401);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, githubApi.getReadme(owner, repo)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        (0, chai_1.expect)(error_1).to.be.an.instanceOf(Error);
                        (0, chai_1.expect)(error_1.message).to.equal('Unable to fetch README. Status: 401');
                        if ('response' in error_1) {
                            (0, chai_1.expect)(error_1.response).to.be.an('object');
                            (0, chai_1.expect)(error_1.response.status).to.equal(401);
                        }
                        else {
                            throw new Error('HTTP response not available in error object');
                        }
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    });
    (0, mocha_1.it)('devrait gérer une erreur 404 correctement', function () {
        return __awaiter(this, void 0, void 0, function () {
            var githubApi, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        githubApi = new index_prive_1.default(token);
                        mock.onGet("https://api.github.com/repos/".concat(owner, "/").concat(repo, "/readme")).reply(404);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, githubApi.getReadme(owner, repo)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        (0, chai_1.expect)(error_2).to.be.an.instanceOf(Error);
                        (0, chai_1.expect)(error_2.message).to.equal('Unable to fetch README. Status: 404');
                        if ('response' in error_2) {
                            (0, chai_1.expect)(error_2.response).to.be.an('object');
                            (0, chai_1.expect)(error_2.response.status).to.equal(404);
                        }
                        else {
                            throw new Error('HTTP response not available in error object');
                        }
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    });
    (0, mocha_1.it)('devrait gérer une erreur 500 correctement', function () {
        return __awaiter(this, void 0, void 0, function () {
            var githubApi, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        githubApi = new index_prive_1.default(token);
                        mock.onGet("https://api.github.com/repos/".concat(owner, "/").concat(repo, "/readme")).reply(500);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, githubApi.getReadme(owner, repo)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        (0, chai_1.expect)(error_3).to.be.an.instanceOf(Error);
                        (0, chai_1.expect)(error_3.message).to.equal('Unable to fetch README. Status: 500');
                        if ('response' in error_3) {
                            (0, chai_1.expect)(error_3.response).to.be.an('object');
                            (0, chai_1.expect)(error_3.response.status).to.equal(500);
                        }
                        else {
                            throw new Error('HTTP response not available in error object');
                        }
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    });
    (0, mocha_1.it)('devrait gérer une erreur de connexion', function () {
        return __awaiter(this, void 0, void 0, function () {
            var githubApi, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        githubApi = new index_prive_1.default(token);
                        mock.onGet("https://api.github.com/repos/".concat(owner, "/").concat(repo, "/readme")).networkError();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, githubApi.getReadme(owner, repo)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        (0, chai_1.expect)(error_4.message).to.equal('Network Error');
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    });
    (0, mocha_1.it)('devrait gérer un délai d\'attente dépassé', function () {
        return __awaiter(this, void 0, void 0, function () {
            var githubApi, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        githubApi = new index_prive_1.default(token);
                        mock.onGet("https://api.github.com/repos/".concat(owner, "/").concat(repo, "/readme")).timeout();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, githubApi.getReadme(owner, repo)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        (0, chai_1.expect)(error_5.message).to.equal('timeout of 0ms exceeded');
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    });
    (0, mocha_1.it)('devrait retourner true pour une structure de données de README valide', function () {
        var validReadmeData = {
            content: 'Contenu du README en base64',
            encoding: 'base64',
        };
        var githubApi = new index_prive_1.default('');
        var result = githubApi.isReadmeData(validReadmeData);
        (0, chai_1.expect)(result).to.be.true;
    });
    (0, mocha_1.it)('devrait retourner false pour une structure de données de README avec contenu manquant', function () {
        var readmeDataMissingContent = {
            encoding: 'base64',
        };
        var githubApi = new index_prive_1.default('');
        var result = githubApi.isReadmeData(readmeDataMissingContent);
        (0, chai_1.expect)(result).to.be.false;
    });
    (0, mocha_1.it)('devrait retourner false pour une structure de données de README avec contenu vide', function () {
        var readmeDataEmptyContent = {
            content: '',
            encoding: 'base64',
        };
        var githubApi = new index_prive_1.default('');
        var result = githubApi.isReadmeData(readmeDataEmptyContent);
        (0, chai_1.expect)(result).to.be.false;
    });
    (0, mocha_1.it)('devrait retourner false pour une structure de données de README avec encodage incorrect', function () {
        var readmeDataIncorrectEncoding = {
            content: 'Contenu du README en base64',
            encoding: 123, // Encodage incorrect (doit être une chaîne de caractères)
        };
        var githubApi = new index_prive_1.default('');
        var result = githubApi.isReadmeData(readmeDataIncorrectEncoding);
        (0, chai_1.expect)(result).to.be.false;
    });
});
