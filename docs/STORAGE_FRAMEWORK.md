# Storage Framework Documentation

This document describes the storage-backed framework that was created to eliminate code duplication across the OpenFin extension.

## Overview

The storage framework consists of three main components:

1. **StorageManager** - Core storage operations with type safety
2. **StorageOperations** - High-level operations for common patterns
3. **BadgeManager** - Chrome extension badge management
4. **useStorageOperations** - React hook for storage operations

## Architecture

### StorageManager

The `StorageManager` class provides low-level, type-safe storage operations:

```typescript
import { storageManager } from '@/chrome/core/StorageManager';

// Get single value
const pluginTransactions = await storageManager.get('pluginTransactions');

// Get multiple values
const data = await storageManager.getMultiple(['pluginTransactions', 'currentPlugin']);

// Set single value
await storageManager.set('pluginTransactions', { pluginKey: newTransactions });

// Set multiple values
await storageManager.setMultiple({
  pluginTransactions: { pluginKey: newTransactions },
  currentPlugin: pluginData
});

// Update arrays with transformation
await storageManager.updateArray('pluginTransactions', 
  (current) => ({ ...current, pluginKey: current.pluginKey.filter(t => t.id !== 'remove-me') }),
  {} // default value
);
```

### StorageOperations

The `StorageOperations` class provides domain-specific operations:

```typescript
import { StorageOperations } from '@/chrome/core/StorageManager';

// Load initial data for components (automatically loads current plugin's transactions)
const { transactions, currentPlugin } = await StorageOperations.loadInitialData();

// Load transactions for a specific plugin
const pluginTransactions = await StorageOperations.loadTransactionsForPlugin(plugin);

// Update a specific transaction for current plugin
await StorageOperations.updateTransaction('external-id', { category: 'Food' }, currentPlugin);

// Replace all transactions for a specific plugin
await StorageOperations.replaceTransactionsForPlugin(newTransactions, plugin);

// Plugin operations
const plugins = await StorageOperations.loadRegisteredPlugins();
await StorageOperations.storeRegisteredPlugins(plugins);
await StorageOperations.updateCurrentPlugin(pluginData);
```

### BadgeManager

The `BadgeManager` class handles Chrome extension badge operations:

```typescript
import { badgeManager } from '@/chrome/core/BadgeManager';

// Show transaction count
await badgeManager.showTransactionCount(5);

// Show error state
await badgeManager.showErrorBadge();

// Show warning
await badgeManager.showWarningBadge();

// Clear badge
await badgeManager.clearBadge();

// Custom badge
await badgeManager.setBadgeText('NEW');
await badgeManager.setBadgeBackgroundColor('#FF5722');
```

### React Hook

The `useStorageOperations` hook provides a React-friendly interface:

```typescript
import { useStorageOperations } from '@/hooks';

function MyComponent() {
  const {
    loadInitialData,
    updateTransaction,
    loadTransactionsForPlugin,
    replaceTransactionsForPlugin,
    loadRegisteredPlugins,
    clearAllStorage
  } = useStorageOperations();

  // Use the methods in effects or handlers
  useEffect(() => {
    loadInitialData().then(data => {
      setTransactions(data.transactions);
      setCurrentPlugin(data.currentPlugin);
    });
  }, [loadInitialData]);
}
```

## Migration Examples

### Before: Manual Storage Operations

```typescript
// OLD: Direct chrome.storage usage with duplication
const result = await chrome.storage.local.get(['transactions', 'currentPlugin']);
if (result.transactions) {
  setTransactions(result.transactions);
}
if (result.currentPlugin) {
  setCurrentPlugin(result.currentPlugin);
}

// OLD: Manual transaction update
const storedTransactions = (await chrome.storage.local.get(['transactions'])).transactions || [];
const updatedTransactions = storedTransactions.map(t => 
  t.external_id === id ? { ...t, ...updates } : t
);
await chrome.storage.local.set({ transactions: updatedTransactions });

// OLD: Manual badge management
chrome.action.setBadgeText({ text: count.toString() });
chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" });
```

### After: Using Storage Framework

```typescript
// NEW: Centralized operations
const data = await StorageOperations.loadInitialData();
setTransactions(data.transactions);
setCurrentPlugin(data.currentPlugin);

// NEW: High-level transaction update
await StorageOperations.updateTransaction(id, updates);

// NEW: Semantic badge operations
await badgeManager.showTransactionCount(count);
```

## Benefits

1. **Type Safety**: All storage operations are fully typed with TypeScript
2. **Error Handling**: Consistent error handling and logging
3. **Code Reuse**: Common patterns are abstracted into reusable methods
4. **Maintainability**: Changes to storage logic only need to be made in one place
5. **Testing**: Centralized storage logic is easier to test
6. **Documentation**: Clear API surface with JSDoc comments

## Per-Plugin Transaction Storage

The storage framework implements per-plugin transaction isolation. Each plugin maintains its own transaction space, ensuring that switching between tabs/plugins shows only relevant transactions.

### Key Features

- **Plugin Isolation**: Transactions are scoped to specific plugins
- **Automatic Key Generation**: Plugin keys are generated based on `displayName` and `fireflyAccountName`
- **Tab Switching**: Transactions automatically update when switching between different plugin tabs
- **Type Safety**: Full TypeScript support for plugin-specific operations

## Storage Schema

The framework enforces a centralized storage schema:

```typescript
interface StorageSchema {
  pluginTransactions: Record<string, FireflyTransaction[]>;  // Per-plugin transaction storage
  currentPlugin: PluginStateEvent["plugin"] | null;         // Active plugin info
  registeredPlugins: RegisteredPlugin[];                    // Available plugins
  fireflyHost: string;                                      // Firefly III server URL
  fireflyToken: string;                                     // Firefly III API token
}
```

### Schema Fields

- **pluginTransactions**: Stores transactions organized by plugin key, ensuring each plugin maintains its own transaction space
- **currentPlugin**: Contains information about the currently active plugin (or null if none)
- **registeredPlugins**: List of all available plugins with their metadata
- **fireflyHost**: External Firefly III server URL for API integration
- **fireflyToken**: Authentication token for Firefly III API access

Plugin keys are generated based on the plugin's display name and Firefly account name. Adding new storage keys requires updating this schema to ensure type safety across the application.

## Usage Guidelines

1. **Use StorageOperations for business logic** - Prefer the high-level operations for common patterns
2. **Use storageManager for custom operations** - Use the low-level API only when needed
3. **Use badgeManager for all badge operations** - Don't access chrome.action directly
4. **Use useStorageOperations in React components** - Provides proper memoization and React integration
5. **Always handle errors gracefully** - All methods return boolean success indicators or handle errors internally
