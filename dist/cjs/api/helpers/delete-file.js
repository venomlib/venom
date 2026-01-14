"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFiles = deleteFiles;
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const logger_js_1 = require("../../utils/logger.js");
async function deleteFiles(mergedOptions, Session) {
    try {
        (0, logger_js_1.logInfo)('Removing file...');
        const pathTokens = path_1.default.join(path_1.default.resolve(process.cwd() + mergedOptions.mkdirFolderToken, mergedOptions.folderNameToken), `${Session}.data.json`);
        if ((0, fs_1.existsSync)(pathTokens)) {
            (0, fs_1.unlink)(pathTokens, (err) => {
                if (err) {
                    (0, logger_js_1.logFail)(`Not removed file: ${pathTokens}`);
                }
                (0, logger_js_1.logSuccess)(`Removed file: ${pathTokens}`);
            });
        }
        else {
            (0, logger_js_1.logFail)(`Not Files: ${pathTokens}`);
        }
    }
    catch (e) { }
}
//# sourceMappingURL=delete-file.js.map