import path from 'path';
import { dest, src } from 'gulp';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function copy() {
  return src(path.resolve(__dirname, './Counter.js')).pipe(
    dest(path.resolve(__dirname, '../../../dist/lib/counter'))
  );
}

export default copy;
