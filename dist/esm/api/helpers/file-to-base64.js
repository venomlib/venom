import mimeTypes from 'mime-types';
import * as fs from 'fs';
/**
 * Converts given file into base64 string
 * @param path file path
 * @param mime Optional, will retrieve file mime automatically if not defined (Example: 'image/png')
 */
export async function fileToBase64(path, mime) {
    if (fs.existsSync(path)) {
        const base64 = fs.readFileSync(path, { encoding: 'base64' });
        if (mime === undefined) {
            mime = mimeTypes.lookup(path);
        }
        return `data:${mime};base64,${base64}`;
    }
    else {
        return false;
    }
}
export async function Mine(path) {
    if (fs.existsSync(path)) {
        return mimeTypes.lookup(path);
    }
    else {
        return false;
    }
}
//# sourceMappingURL=file-to-base64.js.map