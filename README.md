# OpenFin Browser Extension

A Chrome extension that intercepts HTTP requests (fetch/XMLHttpRequest) from web pages to extract financial transaction data and transform it for external APIs like Firefly III. The extension captures financial data in the background and provides visual feedback via badge indicators when new transactions are detected.

## Key Features

- **Background Request Capture**: Monitors and captures financial transactions even when the popup is closed
- **Badge Indicators**: Shows visual feedback on the extension icon when new transactions are found
- **Persistent Storage**: Stores captured transactions locally so they persist across browser sessions
- **Plugin Architecture**: Extensible system for adding support for new financial institutions
- **Security Focused**: Multi-layered security with isolated execution contexts

## Architecture Overview

This extension uses a multi-layered architecture to safely intercept and process web requests:

### Core Components

1. **Content Script** (`src/chrome/content.ts`) - Intercepts web requests
2. **Bridge Script** (`src/chrome/bridge.ts`) - Secure communication bridge
3. **Background Service Worker** (`src/chrome/background.ts`) - Data processing and storage
4. **Plugin System** (`src/chrome/core/`) - Extensible parsing framework
5. **Storage Framework** (`src/chrome/core/StorageManager.ts`, `src/chrome/core/BadgeManager.ts`) - Type-safe storage operations
6. **Popup Interface** (`src/App.tsx`) - User interface for viewing transactions

### Data Flow

```text
Web Page → Content Script → Bridge → Background → [StorageManager + BadgeManager] → Popup UI
                                        ↓
                                   Plugin Manager → External API
                                        ↓
                                 StorageOperations ← React Components
```

## Request Interception Architecture

### 1. Content Script Layer

**File**: `src/chrome/content.ts`

The content script runs in the context of web pages and intercepts HTTP requests by monkey-patching the native APIs:

- **Fetch Interception**: Overrides `window.fetch` to capture responses
- **XMLHttpRequest Interception**: Patches `XMLHttpRequest.prototype.open` and `XMLHttpRequest.prototype.send`
- **Response Processing**: Clones and reads response bodies as text
- **Message Forwarding**: Posts intercepted data to the bridge script via `window.postMessage`

### 2. Bridge Script Layer

**File**: `src/chrome/bridge.ts`

Acts as a secure communication bridge between the content script and background script:

- **Isolated Execution**: Runs in an isolated world with access to Chrome extension APIs
- **Message Filtering**: Only processes messages from the same origin with type `openfin-rest-request`
- **API Forwarding**: Relays validated messages to the background script via `chrome.runtime.sendMessage`

### 3. Background Service Worker

**File**: `src/chrome/background.ts`

Handles business logic and external API communication:

- **Plugin Management**: Registers and manages financial institution plugins
- **URL Matching**: Finds appropriate plugins based on request URLs
- **Data Processing**: Parses response bodies using matched plugins
- **External Integration**: Sends processed transactions to external APIs (Firefly III)

### 4. Plugin System

**Base Plugin Class** (`src/chrome/core/Plugin.ts`):

```typescript
abstract class Plugin<ApiResponse = unknown> {
  abstract getUrlPattern(): RegExp | string;
  abstract parseResponse(responseBody: ApiResponse): FireflyTransaction[];
}
```

**Plugin Manager** (`src/chrome/core/PluginManager.ts`):

- Maintains registry of active plugins
- Matches URLs against plugin patterns
- Routes responses to appropriate parsers

**Example Plugin** (`src/chrome/plugins/ScotiabankScenePlus.ts`):

- URL Pattern: `/secure\.scotiabank\.com.*transaction-history.*accountType=CREDITCARD/`
- Transforms Scotiabank API responses into standardized FireflyTransaction objects

## Message Protocol

### RestRequestEvent Type

```typescript
type RestRequestEvent = {
  type: "openfin-rest-request";
  url: string;
  body: string;
};
```

### Communication Flow

1. Content script captures HTTP response
2. Creates `RestRequestEvent` with response data
3. Posts message to bridge via `window.postMessage`
4. Bridge validates and forwards to background via `chrome.runtime.sendMessage`
5. Background processes with plugin system
6. Transformed data sent to external APIs

## Background Processing & Storage

### Persistent Data Capture

The extension now captures financial transaction data in the background, even when the popup is closed:

- **Background Storage**: Transactions are stored in `chrome.storage.local` immediately when captured
- **Data Replacement**: Each new request replaces all previously stored transactions to ensure data freshness
- **Persistent Access**: Stored transactions are automatically loaded when the popup is opened

### Badge Notification System

When new transactions are detected, the extension provides visual feedback:

- **Badge Indicator**: Shows the number of captured transactions on the extension icon
- **Auto-clear**: Badge is cleared when the popup is opened

### Storage Framework

The extension now uses a centralized storage framework that eliminates code duplication and provides type safety:

- **StorageManager**: Core storage operations with type safety and error handling
- **StorageOperations**: High-level domain-specific storage operations
- **BadgeManager**: Centralized Chrome extension badge management
- **useStorageOperations**: React hook for storage operations

#### Storage Schema

```typescript
interface StorageSchema {
  transactions: FireflyTransaction[];
  currentPlugin: PluginStateEvent["plugin"];
  registeredPlugins: RegisteredPlugin[];
}
```

#### Usage Examples

```typescript
// Load initial data
const data = await StorageOperations.loadInitialData();

// Update a transaction
await StorageOperations.updateTransaction(id, { category: 'Food' });

// Show badge notification
await badgeManager.showTransactionCount(5);
```

For detailed documentation, see [`docs/STORAGE_FRAMEWORK.md`](docs/STORAGE_FRAMEWORK.md).

## Security Considerations

- **Origin Validation**: Bridge only accepts messages from same origin
- **Type Safety**: TypeScript type guards validate message structure
- **Isolated Execution**: Bridge runs in isolated world preventing page script interference
- **API Permissions**: Background script has controlled access to Chrome extension APIs
- **Local Storage**: Transaction data is stored locally and never transmitted to external servers without explicit user consent

## Adding New Financial Institution Support

1. Create new plugin extending `Plugin<T>` base class
2. Implement `getBaseUrlPattern()` to match institution's base URLs
3. Implement `getApiUrlPattern()` to match API request URLs  
4. Implement `parseResponse()` to transform API responses to `FireflyTransaction[]`
5. Register plugin in `background.ts` with `pluginManager.register()`

## Code Architecture Improvements

### Storage Framework Refactoring

The codebase has been refactored to eliminate storage-related code duplication through a centralized framework:

- **Before**: Manual `chrome.storage.local` calls scattered throughout components
- **After**: Type-safe storage operations through `StorageManager` and `StorageOperations`
- **Benefits**: Reduced code duplication, improved type safety, consistent error handling

### Badge Management

Badge operations are now centralized through `BadgeManager`:

- **Before**: Direct `chrome.action.setBadgeText()` calls in multiple files
- **After**: Semantic methods like `showTransactionCount()`, `showErrorBadge()`
- **Benefits**: Consistent badge behavior, easier testing, better maintainability

## Development

### Building the Extension

```bash
npm install
npm run build
```

### Loading in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the project directory
4. The extension will appear in your extensions list

### Testing

Visit supported financial institution websites and perform actions that generate transaction data. The extension will automatically capture and display the data in the popup interface.

## React Hooks

The extension provides custom React hooks for common operations:

### useOpenFin

Main hook for accessing transaction data and plugin state:

```typescript
const { transactions, currentPlugin, updateTransaction } = useOpenFin();
```

### useStorageOperations

Hook for direct access to storage operations:

```typescript
const { 
  loadInitialData, 
  updateTransaction, 
  loadRegisteredPlugins,
  clearAllStorage 
} = useStorageOperations();
```
