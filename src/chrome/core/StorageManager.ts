import type { FireflyTransaction } from "./types/firefly";
import type { PluginStateEvent } from "./types/requestBodyPipeline";
import type { RegisteredPlugin } from "@/components/plugins/PluginsList";

// Define the storage schema as a centralized type
export interface StorageSchema {
  pluginTransactions: Record<string, FireflyTransaction[]>;
  currentPlugin: PluginStateEvent["plugin"];
  registeredPlugins: RegisteredPlugin[];
}

type StorageKey = keyof StorageSchema;
type StorageValue<K extends StorageKey> = StorageSchema[K];

/**
 * Centralized storage manager for Chrome extension storage operations.
 * Provides type-safe storage operations with consistent error handling and logging.
 */
export class StorageManager {
  private static instance: StorageManager;

  private constructor() {}

  /**
   * Get singleton instance of StorageManager
   */
  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  /**
   * Check if Chrome storage API is available
   */
  private isStorageAvailable(): boolean {
    return !!chrome?.storage?.local;
  }

  /**
   * Get a single value from storage
   */
  async get<K extends StorageKey>(
    key: K
  ): Promise<StorageValue<K> | undefined> {
    if (!this.isStorageAvailable()) {
      console.warn("Chrome storage API not available");
      return undefined;
    }

    try {
      const result = await chrome.storage.local.get([key]);
      return result[key];
    } catch (error) {
      console.error(`Failed to get storage key "${key}":`, error);
      return undefined;
    }
  }

  /**
   * Get multiple values from storage
   */
  async getMultiple<K extends StorageKey>(
    keys: K[]
  ): Promise<Partial<Pick<StorageSchema, K>>> {
    if (!this.isStorageAvailable()) {
      console.warn("Chrome storage API not available");
      return {};
    }

    try {
      const result = await chrome.storage.local.get(keys);
      return result as Partial<Pick<StorageSchema, K>>;
    } catch (error) {
      console.error(`Failed to get storage keys ${keys.join(", ")}:`, error);
      return {};
    }
  }

  /**
   * Set a single value in storage
   */
  async set<K extends StorageKey>(
    key: K,
    value: StorageValue<K>
  ): Promise<boolean> {
    if (!this.isStorageAvailable()) {
      console.warn("Chrome storage API not available");
      return false;
    }

    try {
      await chrome.storage.local.set({ [key]: value });
      return true;
    } catch (error) {
      console.error(`Failed to set storage key "${key}":`, error);
      return false;
    }
  }

  /**
   * Set multiple values in storage
   */
  async setMultiple(values: Partial<StorageSchema>): Promise<boolean> {
    if (!this.isStorageAvailable()) {
      console.warn("Chrome storage API not available");
      return false;
    }

    try {
      await chrome.storage.local.set(values);
      return true;
    } catch (error) {
      console.error("Failed to set multiple storage values:", error);
      return false;
    }
  }

  /**
   * Update a stored array by applying a transformation function
   */
  async updateArray<K extends StorageKey>(
    key: K,
    updaterFn: (currentArray: StorageValue<K>) => StorageValue<K>,
    defaultValue: StorageValue<K>
  ): Promise<boolean> {
    const currentValue = await this.get(key);
    const newValue = updaterFn(currentValue || defaultValue);
    return await this.set(key, newValue);
  }

  /**
   * Clear a storage key
   */
  async clear(key: StorageKey): Promise<boolean> {
    if (!this.isStorageAvailable()) {
      console.warn("Chrome storage API not available");
      return false;
    }

    try {
      await chrome.storage.local.remove([key]);
      return true;
    } catch (error) {
      console.error(`Failed to clear storage key "${key}":`, error);
      return false;
    }
  }

  /**
   * Clear all storage
   */
  async clearAll(): Promise<boolean> {
    if (!this.isStorageAvailable()) {
      console.warn("Chrome storage API not available");
      return false;
    }

    try {
      await chrome.storage.local.clear();
      return true;
    } catch (error) {
      console.error("Failed to clear all storage:", error);
      return false;
    }
  }
}

// Export singleton instance
export const storageManager = StorageManager.getInstance();

/**
 * Specialized storage operations for common patterns
 */
export class StorageOperations {
  /**
   * Generate a unique key for a plugin based on its properties
   */
  private static getPluginKey(plugin: PluginStateEvent["plugin"]): string {
    if (!plugin) return "unknown";
    return `${plugin.displayName}_${plugin.fireflyAccountName}`;
  }

  /**
   * Load initial data for the useOpenFin hook
   */
  static async loadInitialData(): Promise<{
    transactions: FireflyTransaction[];
    currentPlugin: PluginStateEvent["plugin"];
  }> {
    const data = await storageManager.getMultiple([
      "pluginTransactions",
      "currentPlugin",
    ]);

    const currentPlugin = data.currentPlugin || null;
    const allPluginTransactions = data.pluginTransactions || {};

    // Get transactions for the current plugin
    const pluginKey = this.getPluginKey(currentPlugin);
    const transactions = allPluginTransactions[pluginKey] || [];

    return {
      transactions,
      currentPlugin,
    };
  }

  /**
   * Load transactions for a specific plugin
   */
  static async loadTransactionsForPlugin(
    plugin: PluginStateEvent["plugin"]
  ): Promise<FireflyTransaction[]> {
    const pluginTransactions = await storageManager.get("pluginTransactions");
    const pluginKey = this.getPluginKey(plugin);
    return (pluginTransactions || {})[pluginKey] || [];
  }

  /**
   * Update a transaction for a specific plugin
   */
  static async updateTransaction(
    external_id: string,
    updatedFields: Partial<FireflyTransaction>,
    plugin: PluginStateEvent["plugin"]
  ): Promise<boolean> {
    const pluginKey = this.getPluginKey(plugin);
    const allPluginTransactions =
      (await storageManager.get("pluginTransactions")) || {};

    const pluginTransactions = allPluginTransactions[pluginKey] || [];
    const updatedTransactions = pluginTransactions.map((transaction) => {
      if (transaction.external_id === external_id) {
        const updated = { ...transaction, ...updatedFields };

        // If this is the first time the category is being edited, preserve the original
        if (
          updatedFields.category_name &&
          !transaction.original_category_name
        ) {
          updated.original_category_name = transaction.category_name;
        }

        return updated;
      }
      return transaction;
    });

    allPluginTransactions[pluginKey] = updatedTransactions;
    return await storageManager.set(
      "pluginTransactions",
      allPluginTransactions
    );
  }

  /**
   * Replace all transactions for a specific plugin (used when new data comes from background)
   */
  static async replaceTransactionsForPlugin(
    newTransactions: FireflyTransaction[],
    plugin: PluginStateEvent["plugin"]
  ): Promise<boolean> {
    const pluginKey = this.getPluginKey(plugin);
    const allPluginTransactions =
      (await storageManager.get("pluginTransactions")) || {};

    // Get existing transactions to preserve original category names
    const existingTransactions = allPluginTransactions[pluginKey] || [];

    // Merge new transactions with existing ones, preserving original category names for edited items
    const mergedTransactions = newTransactions.map((newTx) => {
      const existingTx = existingTransactions.find(
        (existing) => existing.external_id === newTx.external_id
      );

      if (existingTx && existingTx.original_category_name) {
        // Transaction exists and has been edited - preserve the original category name
        return {
          ...newTx,
          original_category_name: existingTx.original_category_name,
        };
      } else {
        // New transaction or unedited transaction - set original category name
        return {
          ...newTx,
          original_category_name: newTx.category_name,
        };
      }
    });

    allPluginTransactions[pluginKey] = mergedTransactions;
    return await storageManager.set(
      "pluginTransactions",
      allPluginTransactions
    );
  }

  /**
   * Load registered plugins for the plugins list
   */
  static async loadRegisteredPlugins(): Promise<RegisteredPlugin[]> {
    const plugins = await storageManager.get("registeredPlugins");
    return plugins || [];
  }

  /**
   * Store registered plugins (used in background script)
   */
  static async storeRegisteredPlugins(
    plugins: RegisteredPlugin[]
  ): Promise<boolean> {
    return await storageManager.set("registeredPlugins", plugins);
  }

  /**
   * Update current plugin state
   */
  static async updateCurrentPlugin(
    pluginData: PluginStateEvent["plugin"]
  ): Promise<boolean> {
    return await storageManager.set("currentPlugin", pluginData);
  }
}
