"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkFileJson = checkFileJson;
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
function checkFileJson(mergedOptions, Session) {
    const pathTokens = path_1.default.join(path_1.default.resolve(process.cwd() + mergedOptions.mkdirFolderToken, mergedOptions.folderNameToken), `${Session}.data.json`);
    if ((0, fs_1.existsSync)(pathTokens)) {
        return true;
    }
    else {
        return false;
    }
}
//# sourceMappingURL=check-token-file.js.map