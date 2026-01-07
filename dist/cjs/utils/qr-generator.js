"use strict";
/**
 * ASCII QR Code generator using vendor QRCode library
 * Based on the qrcode-terminal pattern
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateASCIIQR = generateASCIIQR;
const url_1 = require("url");
const path_1 = require("path");
// Cross-platform __dirname
const getDirname = () => {
    if (typeof __dirname !== 'undefined') {
        return __dirname;
    }
    // @ts-ignore
    return (0, path_1.dirname)((0, url_1.fileURLToPath)(import.meta.url));
};
function fill(length, value) {
    const arr = new Array(length);
    for (let i = 0; i < length; i++) {
        arr[i] = value;
    }
    return arr;
}
function repeat(char, count) {
    return new Array(count + 1).join(char);
}
async function generateASCIIQR(input, opts = {}) {
    const BLACK = true;
    const WHITE = false;
    // Dynamic import to support both ESM and CJS
    const QRCodeModule = await Promise.resolve().then(() => __importStar(require('../../vendor/QRCode/index.js')));
    const QRErrorCorrectLevelModule = await Promise.resolve().then(() => __importStar(require('../../vendor/QRCode/QRErrorCorrectLevel.js')));
    const QRCode = QRCodeModule.default || QRCodeModule;
    const QRErrorCorrectLevel = QRErrorCorrectLevelModule.default || QRErrorCorrectLevelModule;
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
                if (moduleData[row][col] === WHITE &&
                    moduleData[row + 1][col] === WHITE) {
                    output += palette.WHITE_ALL;
                }
                else if (moduleData[row][col] === WHITE &&
                    moduleData[row + 1][col] === BLACK) {
                    output += palette.WHITE_BLACK;
                }
                else if (moduleData[row][col] === BLACK &&
                    moduleData[row + 1][col] === WHITE) {
                    output += palette.BLACK_WHITE;
                }
                else {
                    output += palette.BLACK_ALL;
                }
            }
            output += palette.WHITE_ALL + '\n';
        }
        if (!oddRow) {
            output += borderBottom;
        }
    }
    else {
        const white = '  ';
        const black = '██';
        const border = repeat(white, qrcode.getModuleCount() + 2);
        output += border + '\n';
        qrcode.modules.forEach(function (row) {
            output += white;
            output += row.map((cell) => (cell ? black : white)).join('');
            output += white + '\n';
        });
        output += border;
    }
    return output;
}
//# sourceMappingURL=qr-generator.js.map