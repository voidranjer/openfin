import { useEffect, useState } from "react";
import {
  isRestRequestEvent,
  isPluginStateEvent,
  type PluginStateEvent,
} from "@/chrome/core/types/requestBodyPipeline";
import type { FireflyTransaction } from "@/chrome/core/types/firefly";

export function useOpenFin() {
  const [transactions, setTransactions] = useState<FireflyTransaction[]>([]);
  const [currentPlugin, setCurrentPlugin] =
    useState<PluginStateEvent["plugin"]>(null);

  useEffect(() => {
    // Load stored data when component mounts
    const loadStoredData = async () => {
      try {
        // Check if chrome APIs are available
        if (!chrome?.storage?.local) {
          console.warn("Chrome storage API not available");
          return;
        }

        const result = await chrome.storage.local.get([
          "transactions",
          "currentPlugin",
        ]);

        // Load stored transactions
        if (result.transactions) {
          const storedTransactions: FireflyTransaction[] = result.transactions;
          setTransactions(storedTransactions);
        }

        // Load stored plugin state
        if (result.currentPlugin) {
          setCurrentPlugin(result.currentPlugin);
        }

        // Clear the badge when action icon clicked
        if (chrome?.action?.setBadgeText) {
          chrome.action.setBadgeText({ text: "" });
        }
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

          // Replace all old content with new transactions
          setTransactions(parsedTransactions);
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

  const updateTransaction = async (
    external_id: string,
    updatedFields: Partial<FireflyTransaction>
  ) => {
    try {
      // Update the local state
      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction.external_id === external_id
            ? { ...transaction, ...updatedFields }
            : transaction
        )
      );

      // Update chrome storage
      if (chrome?.storage?.local) {
        const result = await chrome.storage.local.get(["transactions"]);
        const storedTransactions: FireflyTransaction[] =
          result.transactions || [];

        const updatedTransactions = storedTransactions.map((transaction) =>
          transaction.external_id === external_id
            ? { ...transaction, ...updatedFields }
            : transaction
        );

        await chrome.storage.local.set({ transactions: updatedTransactions });
      }
    } catch (error) {
      console.error("Failed to update transaction:", error);
    }
  };

  return {
    transactions,
    currentPlugin,
    updateTransaction,
  };
}
