/**
 * ASCII QR Code generator using vendor QRCode library
 * Based on the qrcode-terminal pattern
 */
export declare function generateASCIIQR(input: string, opts?: {
    small?: boolean;
}): Promise<string>;
