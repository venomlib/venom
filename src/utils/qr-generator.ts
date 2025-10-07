/**
 * ASCII QR Code generator using vendor QRCode library
 * Based on the qrcode-terminal pattern
 */

const QRCode = require('../vendor/QRCode/index.js');
const QRErrorCorrectLevel = require('../vendor/QRCode/QRErrorCorrectLevel.js');

function fill(length: number, value: boolean): boolean[] {
  const arr: boolean[] = new Array(length);
  for (let i = 0; i < length; i++) {
    arr[i] = value;
  }
  return arr;
}

function repeat(char: string, count: number): string {
  return new Array(count + 1).join(char);
}

export function generateASCIIQR(
  input: string,
  opts: { small?: boolean } = {}
): string {
  const BLACK = true;
  const WHITE = false;

  const qrcode = new QRCode(-1, QRErrorCorrectLevel.L);
  qrcode.addData(input);
  qrcode.make();

  let output = '';

  if (opts && opts.small) {
    const moduleCount = qrcode.getModuleCount();
    const moduleData = qrcode.modules.slice();

    const oddRow = moduleCount % 2 === 1;
    if (oddRow) {
      moduleData.push(fill(moduleCount, WHITE));
    }

    const palette = {
      WHITE_ALL: '█',
      WHITE_BLACK: '▀',
      BLACK_WHITE: '▄',
      BLACK_ALL: ' '
    };

    const borderTop = repeat(palette.BLACK_WHITE, moduleCount + 2);
    const borderBottom = repeat(palette.WHITE_BLACK, moduleCount + 2);
    output += borderTop + '\n';

    for (let row = 0; row < moduleCount; row += 2) {
      output += palette.WHITE_ALL;

      for (let col = 0; col < moduleCount; col++) {
        if (
          moduleData[row][col] === WHITE &&
          moduleData[row + 1][col] === WHITE
        ) {
          output += palette.WHITE_ALL;
        } else if (
          moduleData[row][col] === WHITE &&
          moduleData[row + 1][col] === BLACK
        ) {
          output += palette.WHITE_BLACK;
        } else if (
          moduleData[row][col] === BLACK &&
          moduleData[row + 1][col] === WHITE
        ) {
          output += palette.BLACK_WHITE;
        } else {
          output += palette.BLACK_ALL;
        }
      }

      output += palette.WHITE_ALL + '\n';
    }

    if (!oddRow) {
      output += borderBottom;
    }
  } else {
    const white = '  ';
    const black = '██';
    const border = repeat(white, qrcode.getModuleCount() + 2);

    output += border + '\n';
    qrcode.modules.forEach(function (row: boolean[]) {
      output += white;
      output += row.map((cell: boolean) => (cell ? black : white)).join('');
      output += white + '\n';
    });
    output += border;
  }

  return output;
}
