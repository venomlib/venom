import path from 'path';
import { existsSync } from 'fs';
export function checkFileJson(mergedOptions, Session) {
    const pathTokens = path.join(path.resolve(process.cwd() + mergedOptions.mkdirFolderToken, mergedOptions.folderNameToken), `${Session}.data.json`);
    if (existsSync(pathTokens)) {
        return true;
    }
    else {
        return false;
    }
}
//# sourceMappingURL=check-token-file.js.map