import sharp from 'sharp';
export async function stickerSelect(_B, _t) {
    let _w, _ins;
    switch (_t) {
        case 0:
            _ins = await sharp(_B, { failOnError: false })
                .resize({ width: 512, height: 512 })
                .toBuffer();
            _w = sharp(_ins, { failOnError: false }).webp();
            break;
        case 1:
            _w = sharp(_B, { animated: true }).webp();
            break;
        default:
            console.error('Enter a valid number 0 or 1');
            return false;
    }
    const metadata = await _w.metadata();
    if (metadata.width > 512 || metadata.pageHeight > 512) {
        console.error(`Invalid image size (max 512x512):${metadata.width}x${metadata.pageHeight}`);
        return false;
    }
    const obj = {
        webpBase64: (await _w.toBuffer()).toString('base64'),
        metadata: {
            width: metadata.width,
            height: metadata.pageHeight
        }
    };
    return obj;
}
export async function resizeImg(buff, size) {
    const _ins = await sharp(buff, { failOnError: false })
        .resize({ width: size.width, height: size.height })
        .toBuffer(), _w = sharp(_ins, { failOnError: false }).jpeg(), _webb64 = (await _w.toBuffer()).toString('base64');
    return _webb64;
}
//# sourceMappingURL=select-sticker.js.map