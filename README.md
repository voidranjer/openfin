# OpenFin Browser Extension

A Chrome extension that monitors financial websites and automatically captures transaction data from HTTP API responses. The extension uses a side panel interface and provides real-time notifications when new transactions are detected from supported financial institutions.

![Preview](docs/preview.png)

> This README.md file is severely outdated. Pending update!

## Key Features

- **Automatic Transaction Detection**: Monitors API responses from banking websites in real-time
- **Side Panel Interface**: Modern Chrome extension UI that opens alongside web pages
- **Background Processing**: Captures and processes transactions even when the side panel is closed
- **Badge Notifications**: Visual indicators showing transaction count on the extension icon
- **Plugin Architecture**: Extensible system supporting multiple financial institutions
- **Type-Safe Storage**: Centralized storage framework with TypeScript type safety
- **Real-Time Updates**: Live transaction data synchronization between background and UI

## Architecture Overview

This extension uses a Chrome Extension Manifest V3 architecture with a background service worker:

### Core Components

1. **Content Script** (`src/chrome/content.ts`) - Intercepts HTTP requests and responses
2. **Bridge Script** (`src/chrome/bridge.ts`) - Secure communication bridge between content and background
3. **Background Service Worker** (`src/chrome/background.ts`) - Plugin management, data processing, and storage
4. **Side Panel UI** (`src/App.tsx`) - React-based interface for viewing and managing transactions
5. **Plugin System** (`src/chrome/core/Plugin.ts`, `src/chrome/core/PluginManager.ts`) - Extensible framework for financial institution support
6. **Storage Framework** (`src/chrome/core/StorageManager.ts`) - Type-safe local storage operations
7. **Badge Manager** (`src/chrome/core/BadgeManager.ts`) - Extension icon badge notifications

### Data Flow

```text
Banking Website API → Content Script → Bridge → Background Service Worker
                                                        ↓
                                                 Plugin Manager
                                                        ↓
                                              Storage Manager → Badge Manager
                                                        ↓
                                                  Side Panel UI
```

## Detailed Architecture

### 1. Content Script (`src/chrome/content.ts`)

The content script injects into banking websites and intercepts HTTP API calls:

- **Fetch Interception**: Monkey-patches `window.fetch` to capture API responses
- **XMLHttpRequest Interception**: Overrides XHR methods to capture traditional AJAX requests
- **Response Cloning**: Safely clones response bodies without interfering with the original request
- **Message Broadcasting**: Sends captured data to the bridge script via `window.postMessage`

```typescript
// Example of fetch interception
window.fetch = function (...args) {
  return originalFetch.apply(this, args).then((response) => {
    response.clone().text().then((body) => {
      window.postMessage({
        type: "openfin-rest-request",
        baseUrl: window.location.href,
        apiUrl: fullUrl,
        body: body,
        source: "content",
      }, "*");
    });
    return response;
  });
};
```

### 2. Bridge Script (`src/chrome/bridge.ts`)

Provides secure communication between content script and background service worker:

- **Origin Validation**: Only accepts messages from the same origin to prevent security issues
- **Message Filtering**: Validates message structure and type before forwarding
- **Chrome API Access**: Bridges the gap between web page context and extension context
- **Error Isolation**: Prevents page scripts from interfering with extension communication

### 3. Background Service Worker (`src/chrome/background.ts`)

The core processing engine that handles all business logic:

- **Plugin Registration**: Manages all financial institution plugins
- **URL Pattern Matching**: Determines which plugin should process each request
- **Tab Management**: Tracks active tabs and updates plugin state accordingly
- **Side Panel Control**: Opens and manages the side panel interface
- **Storage Coordination**: Orchestrates data storage and badge notifications

### 4. Plugin System

The extension supports multiple financial institutions through a plugin architecture:

**Base Plugin Class** (`src/chrome/core/Plugin.ts`):

```typescript
abstract class Plugin<ApiResponse = unknown> {
  fireflyAccountName: string;
  displayName: string;
  iconUrl: string;

  abstract getBaseUrlPattern(): RegExp;    // For enabling plugin on specific sites
  abstract getApiUrlPattern(): RegExp;     // For matching API requests
  abstract parseResponse(responseBody: ApiResponse): FireflyTransaction[];
}
```

**Plugin Manager** (`src/chrome/core/PluginManager.ts`):

- **Plugin Registry**: Maintains list of all registered plugins
- **URL Matching**: Finds appropriate plugin based on base URL patterns
- **Request Routing**: Routes API responses to the correct plugin for parsing
- **Plugin Metadata**: Provides plugin information for UI display

**Current Plugins**:

- `ScotiabankScenePlus`: Handles Scotiabank Scene+ credit card transactions
- `ScotiabankChequing`: Processes Scotiabank chequing account data
- `RogersBank`: Manages Rogers Bank Mastercard transactions

## Communication Protocol

### Message Types

The extension uses several message types for internal communication:

```typescript
// HTTP request interception
type RestRequestEvent = {
  type: "openfin-rest-request";
  baseUrl: string;    // Current page URL
  apiUrl: string;     // API request URL
  body: string;       // Response body
  source: "content" | "bridge";
};

// Storage update notifications
type StorageUpdateEvent = {
  type: "STORAGE_UPDATED";
  source: "background";
};

// Transaction status updates
type TransactionStatusUpdateEvent = {
  type: "TRANSACTION_STATUS_UPDATE";
  transactionId: string;
  status: "pending" | "success" | "error";
  source: "firefly-client";
};
```

### Communication Flow

1. **Web Page** makes API request to banking service
2. **Content Script** intercepts the response and extracts data
3. **Bridge Script** validates and forwards message to background
4. **Background Service Worker** processes with appropriate plugin
5. **Plugin** transforms bank data into standardized `FireflyTransaction` format
6. **Storage Manager** saves transactions and updates badge
7. **Side Panel UI** receives storage update notifications and refreshes display

## Storage & State Management

### Centralized Storage Framework

The extension uses a type-safe storage framework built on Chrome's `chrome.storage.local` API:

**StorageManager** (`src/chrome/core/StorageManager.ts`):

- **Type Safety**: Full TypeScript support with defined storage schema
- **Atomic Operations**: Safe concurrent read/write operations
- **Error Handling**: Comprehensive error handling and logging
- **Array Management**: Specialized methods for managing transaction arrays

**StorageOperations Class**:

- **High-Level Interface**: Domain-specific operations for common patterns
- **Plugin-Aware**: Automatically handles per-plugin transaction storage
- **React Integration**: Seamless integration with React components via hooks

**Storage Schema**:

```typescript
interface StorageSchema {
  pluginTransactions: Record<string, FireflyTransaction[]>;  // Per-plugin transaction storage
  currentPlugin: PluginStateEvent["plugin"] | null;         // Active plugin info
  registeredPlugins: RegisteredPlugin[];                    // Available plugins
}
```

### Badge Notification System

**BadgeManager** (`src/chrome/core/BadgeManager.ts`) provides visual feedback:

- **Transaction Count**: Shows number of captured transactions on extension icon
- **Status Indicators**: Different colors for success, warning, and error states
- **Auto-Clear**: Badge clears when side panel is opened
- **Semantic Methods**: `showTransactionCount()`, `showErrorBadge()`, `clearBadge()`

### Side Panel Interface

Unlike traditional popup extensions, this uses Chrome's side panel API:

- **Persistent View**: Stays open while browsing, doesn't close when clicking away
- **Tab Awareness**: Automatically updates content based on current tab
- **Real-Time Updates**: Receives live notifications when new transactions are captured
- **Plugin State**: Displays appropriate interface based on detected banking website

## Security & Privacy

### Security Measures

- **Content Security Policy**: Strict CSP prevents code injection attacks
- **Origin Validation**: Bridge script validates message sources and origins
- **Isolated Execution**: Content scripts run in isolated worlds preventing interference
- **Type Safety**: TypeScript and runtime type guards prevent malformed data processing
- **Manifest V3**: Uses latest Chrome extension security model with service workers

### Privacy Protection

- **Local Storage Only**: All transaction data stored locally in browser storage
- **No External Transmission**: Data never sent to external servers without explicit user action
- **No Tracking**: Extension doesn't collect analytics or user behavior data
- **Minimal Permissions**: Only requests necessary Chrome extension permissions
- **Transparent Processing**: All data transformations happen locally and are auditable

## Adding New Financial Institution Support

### Creating a New Plugin

1. **Create Plugin Class**: Extend the base `Plugin<T>` class in `src/chrome/plugins/`

```typescript
export default class MyBankPlugin extends Plugin<MyBankApiResponse> {
  constructor(fireflyAccountName: string) {
    super(fireflyAccountName);
    this.displayName = "My Bank";
    this.iconUrl = "https://example.com/bank-icon.png";
  }

  getBaseUrlPattern(): RegExp {
    return /mybank\.com/;  // Enable on bank's main site
  }

  getApiUrlPattern(): RegExp {
    return /api\/transactions/;  // Match transaction API calls
  }

  parseResponse(responseBody: MyBankApiResponse): FireflyTransaction[] {
    // Transform bank's API response to FireflyTransaction format
    return responseBody.transactions.map(tx => ({
      type: tx.amount > 0 ? "deposit" : "withdrawal",
      description: tx.description,
      amount: Math.abs(tx.amount).toString(),
      date: tx.date,
      external_id: tx.id,
      source_name: tx.amount < 0 ? this.fireflyAccountName : undefined,
      destination_name: tx.amount > 0 ? this.fireflyAccountName : undefined,
    }));
  }
}
```

1. **Register Plugin**: Add to `src/chrome/background.ts`

```typescript
import MyBankPlugin from "./plugins/MyBankPlugin";

pluginManager.register(new MyBankPlugin("My Bank Account"));
```

1. **Type Definitions**: Create types in `src/chrome/plugins/types/mybank.ts` if needed

## Technical Implementation Details

### Modern Chrome Extension Architecture

This extension uses Chrome Extension Manifest V3 with modern best practices:

- **Service Worker**: Background script runs as a service worker instead of persistent background page
- **Side Panel API**: Uses Chrome's native side panel instead of traditional popup
- **Chrome Storage**: Leverages `chrome.storage.local` for persistent data storage
- **Tab Management**: Integrates with Chrome's tabs API for context awareness

### React UI Framework

The side panel interface is built with modern React:

- **React 19**: Latest React version with concurrent features
- **TypeScript**: Full type safety throughout the UI layer
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Radix UI**: Accessible component primitives for consistent UX
- **Lucide React**: Modern icon system

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Chrome browser
- Access to supported banking websites for testing

### Building the Extension

```bash
# Install dependencies
npm install

# Build for development
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

### Loading in Chrome

1. Build the extension using `npm run build`
1. Open Chrome and navigate to `chrome://extensions/`
1. Enable "Developer mode" in the top right
1. Click "Load unpacked" and select the `dist` directory
1. The extension will appear in your extensions list

### Testing the Extension

1. **Visit a supported banking website** (e.g., secure.scotiabank.com)
1. **Click the extension icon** in Chrome's toolbar to open the side panel
1. **Navigate to transaction history** on the banking website
1. **Check the side panel** - it should display captured transaction data
1. **Verify badge notifications** - extension icon should show transaction count

### Development Workflow

- **Hot Reload**: The `npm run dev` command provides hot reloading during development
- **Extension Reload**: After code changes, click the reload button in `chrome://extensions/`
- **Console Debugging**: Use Chrome DevTools for the side panel and background service worker
- **Storage Inspection**: View stored data in Chrome DevTools > Application > Storage

## React Hooks & Components

### Custom Hooks

**useOpenFin** - Main application state hook:

```typescript
const { transactions, currentPlugin, updateTransaction } = useOpenFin();
// Provides access to current transactions and plugin state
```

**useStorageOperations** - Direct storage access:

```typescript
const { 
  loadInitialData, 
  updateTransaction, 
  loadRegisteredPlugins 
} = useStorageOperations();
// Low-level storage operations for advanced use cases
```

### Key Components

- **Dashboard** (`src/components/Dashboard.tsx`) - Main transaction display interface
- **Header** (`src/components/Header.tsx`) - Top navigation with plugin info
- **DataTable** (`src/components/datatable/`) - Transaction table with sorting/filtering
- **PluginsList** (`src/components/plugins/`) - Available plugins display
- **FireflyExecutor** (`src/components/FireflyExecutor.tsx`) - External API integration

## Project Structure

```text
src/
├── chrome/                 # Chrome extension specific code
│   ├── background.ts       # Service worker (main background script)
│   ├── content.ts         # Content script (request interception)
│   ├── bridge.ts          # Secure communication bridge
│   ├── core/              # Core framework classes
│   │   ├── Plugin.ts      # Base plugin class
│   │   ├── PluginManager.ts # Plugin registry and routing
│   │   ├── StorageManager.ts # Type-safe storage operations
│   │   └── BadgeManager.ts # Extension badge management
│   └── plugins/           # Financial institution plugins
├── components/            # React UI components
├── hooks/                # Custom React hooks
└── lib/                  # Shared utilities
```

For more detailed documentation on the storage framework, see [`docs/STORAGE_FRAMEWORK.md`](docs/STORAGE_FRAMEWORK.md).
