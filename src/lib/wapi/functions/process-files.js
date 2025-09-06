var filetypes = new Set([
  'broadcast_notification',
  'call_log',
  'e2e_notification',
  'gp2',
  'history_bundle',
  'newsletter_notification',
  'notification',
  'notification_template',
  'protocol',
  'album',
  'audio',
  'automated_greeting_message',
  'biz_content_placeholder',
  'biz-cover-photo',
  'buttons_response',
  'chat',
  'ciphertext',
  'comment',
  'debug',
  'debug_placeholder',
  'document',
  'event_creation',
  'event_edit_encrypted',
  'event_response',
  'groups_v4_invite',
  'hsm',
  'image',
  'interactive',
  'interactive_response',
  'keep_in_chat',
  'list',
  'list_response',
  'location',
  'multi_vcard',
  'native_flow',
  'newsletter_admin_invite',
  'newsletter_question_response',
  'order',
  'oversized',
  'payment',
  'pin_message',
  'pinned_message',
  'poll_creation',
  'poll_result_snapshot',
  'poll_update',
  'product',
  'ptt',
  'ptv',
  'reaction',
  'reaction_enc',
  'request_phone_number',
  'revoked',
  'rich_response',
  'status',
  'status_notification',
  'sticker',
  'sticker-pack',
  'guest_upsell_system_msg',
  'template_button_reply',
  'unknown',
  'vcard',
  'video'
]);

function isVersionAtLeast(v1, v2) {
  if (typeof v1 !== 'string' || typeof v2 !== 'string') return false;

  const parse = (str) =>
    str.split('.').map((n) => {
      const num = Number(n);
      return isNaN(num) ? 0 : num; // Treat non-numeric parts as 0
    });

  const parts1 = parse(v1);
  const parts2 = parse(v2);
  const maxLen = Math.max(parts1.length, parts2.length);

  // Pad the shorter array with zeros
  while (parts1.length < maxLen) parts1.push(0);
  while (parts2.length < maxLen) parts2.push(0);

  // Lexicographic comparison on the numeric parts
  for (let i = 0; i < maxLen; i++) {
    if (parts1[i] > parts2[i]) return true;
    if (parts1[i] < parts2[i]) return false;
  }
  return true; // They are equal
}

export async function processFiles(chat, blobs) {
  if (!Array.isArray(blobs)) {
    blobs = [blobs];
  }
  const mediaCollection = new Store.MediaCollection({
    chatParticipantCount: chat.getParticipantCount()
  });

  blobs = blobs.map((blob) => {
    return {
      file: blob
    };
  });

  if (isVersionAtLeast(Debug.VERSION, '2.3000.1026804024')) {
    // no clue why the 1 and 100 arguments
    // we are never calling this with more than 1 blob
    await mediaCollection.processAttachments(blobs, 1, filetypes, 100);
  } else {
    await mediaCollection.processAttachments(blobs, chat, chat);
  }

  return mediaCollection;
}
