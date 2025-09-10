export enum MessageType {
  TEXT = 'chat',
  AUDIO = 'audio',
  VOICE = 'ptt',
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  STICKER = 'sticker',
  LOCATION = 'location',
  CONTACT_CARD = 'vcard',
  CONTACT_CARD_MULTI = 'multi_vcard',
  REVOKED = 'revoked',
  UNKNOWN = 'unknown'
}

export enum MediaType {
  IMAGE = 'Image',
  VIDEO = 'Video',
  AUDIO = 'Audio',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  PTT = 'Audio',
  DOCUMENT = 'Document',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  STICKER = 'Image'
}
