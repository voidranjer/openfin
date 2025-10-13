import { useEffect, useState } from "react";
import {
  isRestRequestEvent,
  isPluginStateEvent,
  type PluginStateEvent,
} from "@/chrome/core/types/requestBodyPipeline";
import type { FireflyTransaction } from "@/chrome/core/types/firefly";
import {
  convertFireflyTransactions,
  type DataTableTransaction,
} from "@/components/datatable";

export function useOpenFin() {
  const [transactions, setTransactions] = useState<DataTableTransaction[]>([]);
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

          // Convert to DataTableTransaction format
          const dataTableTransactions =
            convertFireflyTransactions(storedTransactions);
          setTransactions(dataTableTransactions);
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

          // Convert to DataTableTransaction format
          const dataTableTransactions =
            convertFireflyTransactions(parsedTransactions);

          // Replace all old content with new transactions
          setTransactions(dataTableTransactions);
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

  return {
    transactions,
    currentPlugin,
  };
}
