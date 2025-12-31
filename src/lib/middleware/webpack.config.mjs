import path from 'path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  entry: './middleware.ts',
  cache: {
    type: 'filesystem',
    cacheDirectory: path.resolve(
      __dirname,
      '../../../node_modules/.cache/webpack-middleware'
    )
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: 'middleware.js',
    path: path.resolve(__dirname, '../../../dist/lib/middleware')
  }
};
