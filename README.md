# Venom Bot

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

A high-performance WhatsApp bot library for Node.js using Puppeteer to automate WhatsApp Web.

**Key Features:**
- Send and receive messages, media, files, locations, and contacts
- Group management (create, join, manage members and settings)
- Multiple concurrent sessions with session persistence
- Event-driven architecture with comprehensive listeners
- Full TypeScript support with ES Modules and CommonJS

---

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [API Reference](#api-reference)
  - [Sending Messages](#sending-messages)
  - [Receiving Messages & Events](#receiving-messages--events)
  - [Chat Management](#chat-management)
  - [Group Management](#group-management)
  - [Profile & Device](#profile--device)
- [Advanced Usage](#advanced-usage)
- [Architecture](#architecture)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Requirements

- **Node.js** 18.0.0 or higher
- **Chrome/Chromium** browser (automatically managed by Puppeteer, or provide your own)
- **FFmpeg** (optional, for audio/video processing)

---

## Installation

```bash
npm install github:venomlib/venom#v6.8.0
```

### Import

**ES Modules (recommended):**
```typescript
import { create, Whatsapp } from 'venom-bot';
```

**CommonJS:**
```javascript
const venom = require('venom-bot');
```

---

## Quick Start

### TypeScript

```typescript
import { create, Whatsapp, Message } from 'venom-bot';

create({ session: 'my-session' })
  .then((client: Whatsapp) => start(client))
  .catch((error) => console.error('Failed to create client:', error));

function start(client: Whatsapp): void {
  client.onMessage(async (message: Message) => {
    if (message.body === 'Hi' && !message.isGroupMsg) {
      await client.sendText(message.from, 'Hello from Venom Bot!');
    }
  });
}
```

### JavaScript

```javascript
const venom = require('venom-bot');

venom
  .create({ session: 'my-session' })
  .then((client) => start(client))
  .catch((error) => console.error('Failed to create client:', error));

function start(client) {
  client.onMessage(async (message) => {
    if (message.body === 'Hi' && !message.isGroupMsg) {
      await client.sendText(message.from, 'Hello from Venom Bot!');
    }
  });
}
```

After running, a QR code will appear in the terminal. Scan it with WhatsApp on your phone to authenticate. The session is saved automatically for future use.

### Multiple Sessions

```javascript
// Run multiple bots simultaneously
venom.create({ session: 'sales' }).then((client) => handleSales(client));
venom.create({ session: 'support' }).then((client) => handleSupport(client));
```

---

## Configuration

Pass configuration options to `create()`:

```javascript
venom.create({
  session: 'session-name',
  // ... options
})
```

### Session Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `session` | `string` | `'session'` | Session identifier name |
| `folderNameToken` | `string` | `'tokens'` | Folder name for storing session tokens |
| `mkdirFolderToken` | `string` | `''` | Custom directory path for tokens folder |
| `createPathFileToken` | `boolean` | `false` | Create folder structure for browser session |

### Browser Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `headless` | `boolean \| 'new'` | `'new'` | Run browser in headless mode |
| `devtools` | `boolean` | `false` | Open Chrome DevTools |
| `browserPathExecutable` | `string` | `''` | Custom browser executable path |
| `browserWS` | `string` | `''` | Connect to existing browser via WebSocket |
| `browserArgs` | `string[]` | `[]` | Chrome launch arguments (replaces defaults) |
| `addBrowserArgs` | `string[]` | `[]` | Additional Chrome arguments (adds to defaults) |
| `puppeteerOptions` | `object` | `{}` | Options passed directly to `puppeteer.launch()` |

### QR Code Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `logQR` | `boolean` | `true` | Display QR code in terminal |
| `autoClose` | `number \| false` | `60000` | Auto-close timeout (ms) when waiting for QR scan |

### Display Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `debug` | `boolean` | `false` | Enable debug logging |
| `disableSpins` | `boolean` | `false` | Disable spinner animations (useful for Docker) |
| `disableWelcome` | `boolean` | `false` | Disable welcome message |
| `updatesLog` | `boolean` | `true` | Log update information |

### Proxy Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `addProxy` | `string[]` | `[]` | Proxy servers (e.g., `['proxy.example.com:8080']`) |
| `userProxy` | `string` | `''` | Proxy username |
| `userPass` | `string` | `''` | Proxy password |

### Full Configuration Example

```javascript
venom.create(
  'session-name',
  // QR code callback
  (base64Qr, asciiQR, attempts, urlCode) => {
    console.log('QR Code attempt:', attempts);
    console.log(asciiQR);
  },
  // Status callback
  (status, session) => {
    console.log('Status:', status);
  },
  // Options
  {
    headless: 'new',
    logQR: true,
    autoClose: 60000,
    folderNameToken: 'tokens',
    disableSpins: true
  },
  // Browser instance callback
  (browser, page) => {
    console.log('Browser PID:', browser.process().pid);
  }
)
```

### Session Status Values

| Status | Description |
|--------|-------------|
| `isLogged` | User is already authenticated |
| `notLogged` | QR code scan required |
| `qrReadSuccess` | QR code scanned successfully |
| `qrReadFail` | QR code scan failed |
| `browserClose` | Browser was closed |
| `autocloseCalled` | Auto-close timeout triggered |
| `desconnectedMobile` | Phone disconnected |
| `chatsAvailable` | Connected and chats loaded |
| `deviceNotConnected` | Phone not connected to internet |

---

## API Reference

### Chat ID Formats

- **Contact:** `'1234567890@c.us'` (phone number with country code)
- **Group:** `'1234567890-9876543210@g.us'`
- **Status/Broadcast:** `'status@broadcast'`

### Sending Messages

#### Text Messages

```javascript
// Simple text
await client.sendText('1234567890@c.us', 'Hello!');

// Reply to a message
await client.reply('1234567890@c.us', 'This is a reply', messageId);

// Mention users in a group
await client.sendMentioned(
  '1234567890-9876543210@g.us',
  'Hello @1111111111 and @2222222222!',
  ['1111111111', '2222222222']
);
```

#### Media Messages

```javascript
// Send image (from file path or URL)
await client.sendImage(
  '1234567890@c.us',
  './photo.jpg',        // or 'https://example.com/photo.jpg'
  'photo',
  'Check this out!'
);

// Send image from base64
await client.sendImageFromBase64('1234567890@c.us', base64Data, 'image.jpg');

// Send file/document
await client.sendFile(
  '1234567890@c.us',
  './document.pdf',
  'document.pdf',
  'Here is the document'
);

// Send voice message
await client.sendVoice('1234567890@c.us', './audio.mp3');

// Send video as GIF
await client.sendVideoAsGif('1234567890@c.us', './video.mp4', 'video.gif', 'Funny clip');
```

#### Stickers

```javascript
// Send image as sticker
await client.sendImageAsSticker('1234567890@c.us', './sticker.png');

// Send animated sticker (from GIF)
await client.sendImageAsStickerGif('1234567890@c.us', './animated.gif');
```

#### Interactive Messages

```javascript
// Send buttons
const buttons = [
  { buttonText: { displayText: 'Option 1' } },
  { buttonText: { displayText: 'Option 2' } }
];
await client.sendButtons('1234567890@c.us', 'Title', 'Description', buttons);

// Send list menu
const menu = [
  {
    title: 'Category 1',
    rows: [
      { title: 'Item 1', description: 'Description 1' },
      { title: 'Item 2', description: 'Description 2' }
    ]
  }
];
await client.sendListMenu('1234567890@c.us', 'Title', 'Subtitle', 'Description', 'Menu', menu);

// Send poll
await client.sendPollCreation('1234567890@c.us', {
  name: 'What do you prefer?',
  options: [{ name: 'Option A' }, { name: 'Option B' }],
  selectableOptionsCount: 1
});
```

#### Location & Contacts

```javascript
// Send location
await client.sendLocation('1234567890@c.us', '-23.5505', '-46.6333', 'São Paulo');

// Send contact card
await client.sendContactVcard('1234567890@c.us', '9876543210@c.us', 'John Doe');

// Send multiple contacts
await client.sendContactVcardList('1234567890@c.us', ['111@c.us', '222@c.us']);
```

#### Other

```javascript
// Forward messages
await client.forwardMessages('1234567890@c.us', [messageId1, messageId2]);

// Send link with preview
await client.sendLinkPreview('1234567890@c.us', 'https://github.com', 'GitHub');

// React to message
await client.sendReactions(messageId, '👍');

// Post to status/story
await client.sendStatusText('Hello everyone!');
await client.sendImageStatus('./photo.jpg', 'Status update');
```

### Receiving Messages & Events

#### Message Listeners

```javascript
// Listen to incoming messages
client.onMessage((message) => {
  console.log('From:', message.from);
  console.log('Body:', message.body);
  console.log('Type:', message.type);
});

// Listen to ALL messages (including sent by you)
client.onAnyMessage((message) => {
  console.log('Message:', message.body);
});

// Listen to message edits
client.onMessageEdit((message) => {
  console.log('Edited:', message.body);
});

// Listen to message deletions
client.onMessageDelete((message) => {
  console.log('Deleted:', message.id);
});

// Listen to reactions
client.onMessageReaction((reaction) => {
  console.log('Reaction:', reaction.emoji);
});
```

#### State & Connection Events

```javascript
// Connection state changes
client.onStateChange((state) => {
  console.log('State:', state);
  // States: CONFLICT, CONNECTED, DEPRECATED_VERSION, OPENING, PAIRING, etc.
  if (state === 'CONFLICT') client.useHere();
});

// Stream state changes
client.onStreamChange((state) => {
  console.log('Stream:', state);
  // States: CONNECTED, DISCONNECTED, SYNCING, RESUMING
});

// Message acknowledgements
client.onAck((ack) => {
  console.log('Ack status:', ack.ack);
  // -1: FAILED, 0: CLOCK, 1: SENT, 2: RECEIVED, 3: READ, 4: PLAYED
});
```

#### Group & Call Events

```javascript
// Added to group
client.onAddedToGroup((event) => {
  console.log('Added to group:', event.chat.name);
});

// Group participant changes
client.onParticipantsChanged('group-id@g.us', (event) => {
  console.log('Action:', event.action); // 'add', 'remove', 'promote', 'demote'
  console.log('Participant:', event.who);
});

// Incoming calls
client.onIncomingCall((call) => {
  console.log('Call from:', call.peerJid);
  client.sendText(call.peerJid, "Sorry, I can't answer calls");
});
```

### Chat Management

#### Retrieve Chats & Messages

```javascript
// Get all chats
const chats = await client.getAllChats();

// Get chats with unread messages
const unreadChats = await client.getAllChatsNewMsg();

// Get all contacts
const contacts = await client.getAllContacts();

// Get messages in a chat
const messages = await client.getAllMessagesInChat('1234567890@c.us', true, false);

// Load and get all messages (from server)
const allMessages = await client.loadAndGetAllMessagesInChat('1234567890@c.us');

// Get unread messages
const unread = await client.getUnreadMessages();
```

#### Chat Actions

```javascript
// Mark as read
await client.markMarkSeenMessage('1234567890@c.us');

// Mark as unread
await client.markUnseenMessage('1234567890@c.us');

// Archive/unarchive
await client.archiveChat('1234567890@c.us', true);  // archive
await client.archiveChat('1234567890@c.us', false); // unarchive

// Pin/unpin
await client.pinChat('1234567890@c.us', true);  // pin
await client.pinChat('1234567890@c.us', false); // unpin

// Delete chat
await client.deleteChat('1234567890@c.us');

// Clear messages
await client.clearChatMessages('1234567890@c.us');

// Delete specific messages
await client.deleteMessage('1234567890@c.us', [messageId1, messageId2]);
```

#### Contact Actions

```javascript
// Block contact
await client.blockContact('1234567890@c.us');

// Unblock contact
await client.unblockContact('1234567890@c.us');

// Get block list
const blocked = await client.getBlockList();

// Check if number exists on WhatsApp
const result = await client.checkNumberStatus('1234567890@c.us');
```

### Group Management

#### Create & Join

```javascript
// Create group
await client.createGroup('Group Name', ['111@c.us', '222@c.us']);

// Join via invite link
await client.joinGroup('ABCdef123456');

// Get group info from invite link
const info = await client.getGroupInfoFromInviteLink('ABCdef123456');

// Leave group
await client.leaveGroup('group-id@g.us');
```

#### Members

```javascript
// Get members
const members = await client.getGroupMembers('group-id@g.us');

// Get admins
const admins = await client.getGroupAdmins('group-id@g.us');

// Add participant
await client.addParticipant('group-id@g.us', '1234567890@c.us');

// Remove participant
await client.removeParticipant('group-id@g.us', '1234567890@c.us');

// Promote to admin
await client.promoteParticipant('group-id@g.us', '1234567890@c.us');

// Demote from admin
await client.demoteParticipant('group-id@g.us', '1234567890@c.us');
```

#### Settings

```javascript
// Set group title
await client.setGroupTitle('group-id@g.us', 'New Group Name');

// Set group description
await client.setGroupDescription('group-id@g.us', 'Group description');

// Set group image
await client.setGroupImage('group-id@g.us', './group-photo.jpg');

// Get/revoke invite link
const link = await client.getGroupInviteLink('group-id@g.us');
await client.revokeGroupInviteLink('group-id@g.us');

// Restrict messages to admins only
await client.setMessagesAdminsOnly('group-id@g.us', true);
```

### Profile & Device

#### Profile

```javascript
// Set profile name
await client.setProfileName('Bot Name');

// Set status
await client.setProfileStatus('Available');

// Set profile picture
await client.setProfilePic('./profile.jpg');

// Get profile picture
const picUrl = await client.getProfilePicFromServer('1234567890@c.us');
```

#### Device & Connection

```javascript
// Get device info
const device = await client.getHostDevice();

// Check connection
const connected = await client.isConnected();
const state = await client.getConnectionState();

// Get WhatsApp version
const version = await client.getWAVersion();

// Get battery level
const battery = await client.getBatteryLevel();

// Logout
await client.logout();
```

#### Typing Indicators

```javascript
// Show typing
await client.startTyping('1234567890@c.us');

// Show recording
await client.startRecording('1234567890@c.us');

// Clear indicators
await client.clearPresence('1234567890@c.us');
```

---

## Advanced Usage

### Downloading Media

```javascript
import fs from 'fs';
import mime from 'mime-types';

client.onMessage(async (message) => {
  if (message.isMedia || message.isMMS) {
    const buffer = await client.decryptFile(message);
    const extension = mime.extension(message.mimetype);
    fs.writeFileSync(`./downloads/file.${extension}`, buffer);
  }
});
```

### Session Persistence

Sessions are automatically saved in the `tokens` folder. To ensure clean shutdown:

```javascript
// Handle Ctrl+C
process.on('SIGINT', async () => {
  await client.close();
  process.exit(0);
});

// Handle errors
process.on('uncaughtException', async (error) => {
  console.error('Error:', error);
  await client.close();
  process.exit(1);
});
```

### Keep Session Alive

```javascript
client.onStateChange((state) => {
  console.log('State:', state);
  if (state === 'CONFLICT') {
    client.useHere(); // Take over session
  }
});

let disconnectTimer;
client.onStreamChange((state) => {
  clearTimeout(disconnectTimer);
  if (state === 'DISCONNECTED' || state === 'SYNCING') {
    disconnectTimer = setTimeout(() => {
      client.close();
    }, 80000);
  }
});
```

### Custom WhatsApp Web Version

```javascript
venom.create({
  session: 'my-session',
  webVersion: '2.2402.5'  // Use specific WA Web version
});
```

### Exporting QR Code to File

```javascript
const fs = require('fs');

venom.create(
  'session-name',
  (base64Qr) => {
    const matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const buffer = Buffer.from(matches[2], 'base64');
    fs.writeFileSync('qr-code.png', buffer);
  },
  undefined,
  { logQR: false }
);
```

---

## Architecture

```
src/
├── api/
│   ├── layers/           # Layered API architecture
│   │   ├── host.layer.ts       # Connection & device management
│   │   ├── profile.layer.ts    # Profile settings
│   │   ├── sender.layer.ts     # Message sending
│   │   ├── listener.layer.ts   # Event listeners
│   │   ├── retriever.layer.ts  # Data retrieval
│   │   ├── controls.layer.ts   # Chat management
│   │   ├── group.layer.ts      # Group operations
│   │   └── ui.layer.ts         # UI interactions
│   ├── model/            # TypeScript interfaces
│   └── helpers/          # Utility functions
├── lib/
│   └── wapi/             # Browser-injected WhatsApp Web API
├── controllers/
│   ├── initializer.ts    # Session creation
│   ├── browser.ts        # Puppeteer management
│   └── auth.ts           # Authentication
└── config/               # Configuration
```

### Layer Hierarchy

Each layer extends the previous, creating a complete feature stack:

```
HostLayer (base)
  └── ProfileLayer
      └── SenderLayer
          └── ListenerLayer
              └── RetrieverLayer
                  └── ControlsLayer
                      └── UILayer
                          └── GroupLayer
                              └── BusinessLayer (exports as Whatsapp)
```

---

## Development

### Build Commands

```bash
npm run build          # Full build
npm run build:wapi     # Build WAPI (browser-injected code)
npm run build:venom    # Compile TypeScript
npm run watch          # Watch mode
```

### Code Quality

```bash
npm run lint           # Run ESLint
npm run lint:fix       # Fix linting issues
npm run knip           # Check for unused dependencies
```

### Testing

```bash
npm test               # Run tests
npm run test:app       # Run example application
```

### Generate API Documentation

```bash
npm run generate-api-docs
```

---

## Troubleshooting

### QR Code Not Appearing

1. Ensure `logQR: true` in options
2. Check terminal supports Unicode
3. Try `disableSpins: true` if using Docker

### Session Not Persisting

1. Check `tokens` folder has write permissions
2. Ensure clean shutdown with `client.close()`
3. Don't run multiple instances with the same session name

### Connection Issues

1. Check phone has internet connection
2. Keep WhatsApp open on phone
3. Use `onStateChange` to monitor connection status

### Chrome/Puppeteer Issues

1. Install Chrome dependencies on Linux:
   ```bash
   apt-get install -y chromium-browser
   ```
2. Set custom browser path:
   ```javascript
   { browserPathExecutable: '/usr/bin/chromium-browser' }
   ```
3. Add browser args for containers:
   ```javascript
   { addBrowserArgs: ['--no-sandbox', '--disable-setuid-sandbox'] }
   ```

### Media Sending Fails

1. Ensure file exists and is readable
2. Check file size limits (WhatsApp has limits)
3. Verify FFmpeg is installed for audio/video processing

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint` and fix any issues
5. Submit a pull request

---

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

---

## Security

For security issues, please see [SECURITY.md](SECURITY.md).

---

## Links

- [GitHub Repository](https://github.com/orkestral/venom)
- [npm Package](https://www.npmjs.com/package/venom-bot)
- [Issue Tracker](https://github.com/orkestral/venom/issues)
- [Changelog](CHANGELOG.md)
