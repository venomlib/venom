/* eslint-env node */
import path from 'path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  entry: './wapi.js',
  // mode: 'development',
  // devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, '../../../dist/lib/wapi'),
    filename: 'wapi.js'
  },
  resolve: {
    extensions: ['.js'] // let you omit .js
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        resolve: {
          fullySpecified: false // <─ here, inside resolve
        }
      }
    ]
  }
};
