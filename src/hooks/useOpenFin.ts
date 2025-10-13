import { useEffect, useState } from "react";
import {
  isRestRequestEvent,
  isPluginStateEvent,
  type PluginStateEvent,
} from "@/chrome/core/types/requestBodyPipeline";
import type { FireflyTransaction } from "@/chrome/core/types/firefly";
import { StorageOperations } from "@/chrome/core/StorageManager";
import { badgeManager } from "@/chrome/core/BadgeManager";

export function useOpenFin() {
  const [transactions, setTransactions] = useState<FireflyTransaction[]>([]);
  const [currentPlugin, setCurrentPlugin] =
    useState<PluginStateEvent["plugin"]>(null);

  useEffect(() => {
    // Load stored data when component mounts
    const loadStoredData = async () => {
      try {
        const data = await StorageOperations.loadInitialData();

        // Ensure all transactions have original_category_name set
        const transactionsWithOriginal = data.transactions.map((tx) => ({
          ...tx,
          original_category_name: tx.original_category_name || tx.category_name,
        }));

        setTransactions(transactionsWithOriginal);
        setCurrentPlugin(data.currentPlugin);

        // Clear the badge when action icon clicked
        await badgeManager.clearBadge();
      } catch (error) {
        console.error("Failed to load stored data:", error);
      }
    };

    loadStoredData();

    function handleMessage(message: unknown) {
      // Handle transaction messages
      if (isRestRequestEvent(message) && message.source === "background") {
        try {
          const parsedTransactions: FireflyTransaction[] = JSON.parse(
            message.body
          );

          // Ensure all transactions have original_category_name set
          const transactionsWithOriginal = parsedTransactions.map((tx) => ({
            ...tx,
            original_category_name:
              tx.original_category_name || tx.category_name,
          }));

          // Replace all old content with new transactions
          setTransactions(transactionsWithOriginal);
        } catch (error) {
          console.error("Failed to parse transaction data:", error);
        }
      }

      // Handle plugin state messages
      if (isPluginStateEvent(message) && message.source === "background") {
        setCurrentPlugin(message.plugin);
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage);

    // Cleanup listener on unmount
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  // Effect to load transactions when plugin changes
  useEffect(() => {
    const loadTransactionsForCurrentPlugin = async () => {
      if (currentPlugin) {
        try {
          const pluginTransactions =
            await StorageOperations.loadTransactionsForPlugin(currentPlugin);

          // Ensure all transactions have original_category_name set
          const transactionsWithOriginal = pluginTransactions.map((tx) => ({
            ...tx,
            original_category_name:
              tx.original_category_name || tx.category_name,
          }));

          setTransactions(transactionsWithOriginal);
        } catch (error) {
          console.error("Failed to load transactions for plugin:", error);
        }
      } else {
        // No plugin active, clear transactions
        setTransactions([]);
      }
    };

    loadTransactionsForCurrentPlugin();
  }, [currentPlugin]);

  const updateTransaction = async (
    external_id: string,
    updatedFields: Partial<FireflyTransaction>
  ) => {
    try {
      // Update the local state
      setTransactions((prev) =>
        prev.map((transaction) => {
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
        })
      );

      // Update chrome storage
      await StorageOperations.updateTransaction(
        external_id,
        updatedFields,
        currentPlugin
      );
    } catch (error) {
      console.error("Failed to update transaction:", error);
    }
  };

  const resetTransactionCategory = async (external_id: string) => {
    try {
      const transaction = transactions.find(
        (tx) => tx.external_id === external_id
      );
      if (transaction && transaction.original_category_name) {
        await updateTransaction(external_id, {
          category_name: transaction.original_category_name,
        });
      }
    } catch (error) {
      console.error("Failed to reset transaction category:", error);
    }
  };

  return {
    transactions,
    currentPlugin,
    updateTransaction,
    resetTransactionCategory,
  };
}
