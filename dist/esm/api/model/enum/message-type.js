export var MessageType;
(function (MessageType) {
    MessageType["TEXT"] = "chat";
    MessageType["AUDIO"] = "audio";
    MessageType["VOICE"] = "ptt";
    MessageType["IMAGE"] = "image";
    MessageType["VIDEO"] = "video";
    MessageType["DOCUMENT"] = "document";
    MessageType["STICKER"] = "sticker";
    MessageType["LOCATION"] = "location";
    MessageType["CONTACT_CARD"] = "vcard";
    MessageType["CONTACT_CARD_MULTI"] = "multi_vcard";
    MessageType["REVOKED"] = "revoked";
    MessageType["UNKNOWN"] = "unknown";
})(MessageType || (MessageType = {}));
export var MediaType;
(function (MediaType) {
    MediaType["IMAGE"] = "Image";
    MediaType["VIDEO"] = "Video";
    MediaType["AUDIO"] = "Audio";
    // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
    MediaType["PTT"] = "Audio";
    MediaType["DOCUMENT"] = "Document";
    // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
    MediaType["STICKER"] = "Image";
})(MediaType || (MediaType = {}));
//# sourceMappingURL=message-type.js.map