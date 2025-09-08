# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Venom is a high-performance WhatsApp bot library built with TypeScript and JavaScript. It uses Puppeteer to automate WhatsApp Web and provides an extensive API for creating WhatsApp bots with features like sending messages, media, managing groups, and handling various WhatsApp events.

## Essential Commands

### Build Commands
- `npm run build` - Full build (includes WAPI, middleware, counter, and TypeScript compilation)
- `npm run build:wapi` - Build WhatsApp API functions (webpack)
- `npm run build:middleware` - Build middleware layer
- `npm run build:venom` - Compile TypeScript to JavaScript
- `npm run build:counter` - Build counter module

### Development Commands
- `npm run start` - Build and run the application
- `npm run watch` - Watch mode for development
- `npm test` - Run tests (executes ./test/index.js)
- `npm run test:app` - Run the example application

### Code Quality Commands
- `npm run lint` - Run ESLint on both TypeScript and JavaScript files
- `npm run lint:fix` - Auto-fix linting issues
- `npm run lint:ts` - Lint TypeScript files only
- `npm run lint:js` - Lint JavaScript files only
- `npm run knip` - Run dependency analysis with knip

### Documentation
- `npm run generate-api-docs` - Generate API documentation with TypeDoc

## Architecture Overview

### Core Structure

1. **API Layer** (`src/api/`)
   - `layers/` - Functionality layers that compose the WhatsApp client
     - `sender.layer.ts` - Message sending functionality
     - `listener.layer.ts` - Event listeners and message handlers
     - `group.layer.ts` - Group management operations
     - `profile.layer.ts` - Profile and status operations
     - `controls.layer.ts` - Connection and session control
     - `retriever.layer.ts` - Data retrieval methods
   - `model/` - TypeScript interfaces and data models
   - `helpers/` - Utility functions for encryption, QR codes, etc.

2. **WAPI Layer** (`src/lib/wapi/`)
   - Browser-injected JavaScript functions that interact directly with WhatsApp Web
   - Contains the core WhatsApp Web API manipulation logic
   - Built with webpack and injected into the Puppeteer browser context

3. **Controllers** (`src/controllers/`)
   - `initializer.ts` - Main entry point for creating WhatsApp sessions
   - `browser.ts` - Puppeteer browser management
   - `auth.ts` - Authentication and QR code handling

4. **Configuration** (`src/config/`)
   - Browser and Puppeteer configuration
   - Session management options

### Build System

The project uses a multi-step build process:
1. WAPI functions are bundled with webpack
2. Middleware is compiled separately
3. TypeScript code is compiled to JavaScript
4. All outputs go to the `dist/` directory

### Key Design Patterns

- **Layer Architecture**: Functionality is organized in layers that build upon each other
- **Event-Driven**: Heavy use of event emitters for WhatsApp events
- **Promise-Based API**: All async operations return promises
- **Session Management**: Supports multiple concurrent WhatsApp sessions

## Important Development Notes

### Working with WAPI Functions
- WAPI functions in `src/lib/wapi/functions/` are JavaScript files that get injected into the browser
- These functions directly manipulate WhatsApp Web's internal objects
- Changes to WAPI functions require rebuilding with `npm run build:wapi`

### TypeScript Configuration
- Target: ESNext with CommonJS modules
- Output directory: `./dist`
- Declaration files are generated
- Source maps are enabled

### Testing Approach
- Main test file: `test/index.js`
- Example application: `app.js`
- No formal test framework - tests are basic scripts

### Session Storage
- Sessions are stored in a `tokens` folder by default
- Each session maintains its browser state for persistence
- QR codes are only needed for initial authentication

### Current Branch
Currently on `dependency-scan` branch with extensive modifications to project files.