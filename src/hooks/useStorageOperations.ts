import { useCallback } from "react";
import {
  StorageOperations,
  storageManager,
} from "@/chrome/core/StorageManager";
import type { RegisteredPlugin } from "@/components/plugins/PluginsList";

/**
 * Custom hook that provides a simplified interface for storage operations.
 * This hook wraps the StorageOperations class to provide React-friendly methods.
 *
 * Note: For transaction operations, use useOpenFin hook instead as it manages
 * transaction state and storage synchronization automatically.
 */
export function useStorageOperations() {
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

  // Direct storage manager access for advanced operations
  const clearAllStorage = useCallback(async () => {
    return await storageManager.clearAll();
  }, []);

  return {
    // Plugin operations
    loadRegisteredPlugins,
    storeRegisteredPlugins,

    // Direct storage access
    clearAllStorage,
  };
}
