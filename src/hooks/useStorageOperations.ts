import { useCallback } from "react";
import {
  StorageOperations,
  storageManager,
} from "@/chrome/core/StorageManager";
import type { FireflyTransaction } from "@/chrome/core/types/firefly";
import type { PluginStateEvent } from "@/chrome/core/types/requestBodyPipeline";
import type { RegisteredPlugin } from "@/components/plugins/PluginsList";

/**
 * Custom hook that provides a simplified interface for storage operations.
 * This hook wraps the StorageOperations class to provide React-friendly methods.
 */
export function useStorageOperations() {
  // Transaction operations
  const loadInitialData = useCallback(async () => {
    return await StorageOperations.loadInitialData();
  }, []);

  const updateTransaction = useCallback(
    async (external_id: string, updatedFields: Partial<FireflyTransaction>) => {
      return await StorageOperations.updateTransaction(
        external_id,
        updatedFields
      );
    },
    []
  );

  const replaceTransactions = useCallback(
    async (transactions: FireflyTransaction[]) => {
      return await StorageOperations.replaceTransactions(transactions);
    },
    []
  );

  // Plugin operations
  const loadRegisteredPlugins = useCallback(async () => {
    return await StorageOperations.loadRegisteredPlugins();
  }, []);

  const storeRegisteredPlugins = useCallback(
    async (plugins: RegisteredPlugin[]) => {
      return await StorageOperations.storeRegisteredPlugins(plugins);
    },
    []
  );

  const updateCurrentPlugin = useCallback(
    async (plugin: PluginStateEvent["plugin"]) => {
      return await StorageOperations.updateCurrentPlugin(plugin);
    },
    []
  );

  // Direct storage manager access for advanced operations
  const clearAllStorage = useCallback(async () => {
    return await storageManager.clearAll();
  }, []);

  return {
    // Transaction operations
    loadInitialData,
    updateTransaction,
    replaceTransactions,

    // Plugin operations
    loadRegisteredPlugins,
    storeRegisteredPlugins,
    updateCurrentPlugin,

    // Direct storage access
    clearAllStorage,
  };
}
