import path from 'path';
import { existsSync, unlink } from 'fs';
import { logInfo, logSuccess, logFail } from '../../utils/logger.js';
export async function deleteFiles(mergedOptions, Session) {
    try {
        logInfo('Removing file...');
        const pathTokens = path.join(path.resolve(process.cwd() + mergedOptions.mkdirFolderToken, mergedOptions.folderNameToken), `${Session}.data.json`);
        if (existsSync(pathTokens)) {
            unlink(pathTokens, (err) => {
                if (err) {
                    logFail(`Not removed file: ${pathTokens}`);
                }
                logSuccess(`Removed file: ${pathTokens}`);
            });
        }
        else {
            logFail(`Not Files: ${pathTokens}`);
        }
    }
    catch (e) { }
}
//# sourceMappingURL=delete-file.js.map