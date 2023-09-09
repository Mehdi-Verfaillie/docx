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
var dataNormalizer_1 = require("../normalizer/dataNormalizer");
var GithubApiProvider = /** @class */ (function () {
    function GithubApiProvider(token) {
        this.baseUrl = 'https://api.github.com';
        this.token = token;
    }
    GithubApiProvider.prototype.isReadmeData = function (data) {
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
    };
    GithubApiProvider.prototype.getReadme = function (owner, repo) {
        return __awaiter(this, void 0, void 0, function () {
            var readmeUrl, headers, response, data, readmeResponse, readmeText, normalizedData, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        readmeUrl = "".concat(this.baseUrl, "/repos/").concat(owner, "/").concat(repo, "/readme");
                        headers = {
                            Authorization: "Bearer ".concat(this.token),
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, axios_1.default.get(readmeUrl, { headers: headers })];
                    case 2:
                        response = _a.sent();
                        if (!(response.status === 200)) return [3 /*break*/, 4];
                        data = response.data;
                        return [4 /*yield*/, axios_1.default.get(data.download_url)];
                    case 3:
                        readmeResponse = _a.sent();
                        readmeText = readmeResponse.data;
                        normalizedData = (0, dataNormalizer_1.normalizeData)(readmeText);
                        return [2 /*return*/, normalizedData];
                    case 4: throw new Error("Unable to fetch README. Status: ".concat(response.status));
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        if (error_1 instanceof Error) {
                            console.error('An error occurred:', error_1.message);
                        }
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return GithubApiProvider;
}());
exports.default = GithubApiProvider;
// Appel de la fonction main pour exécuter le code
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var owner, repo, token, githubApi, readme, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    owner = 'jeremyschiap';
                    repo = 'repo_prive';
                    token = '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';
                    githubApi = new GithubApiProvider(token);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, githubApi.getReadme(owner, repo)];
                case 2:
                    readme = _a.sent();
                    console.log(readme);
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('An error occurred:', error_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
main(); // Appel de la fonction principale
