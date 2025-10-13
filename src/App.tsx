import { useEffect, useState } from "react";

import "./App.css";
import DataTable, {
  columns,
  type DataTableTransaction,
  convertFireflyTransactions,
} from "@/components/datatable";
import {
  isRestRequestEvent,
  type RestRequestEvent,
} from "@/chrome/core/types/requestBodyPipeline";
import type { FireflyTransaction } from "@/chrome/core/types/firefly";
import PluginsList from "@/components/plugins";

export default function App() {
  const [transactions, setTransactions] = useState<DataTableTransaction[]>([]);

  useEffect(() => {
    // Load stored transactions when popup opens
    const loadStoredTransactions = async () => {
      try {
        // Check if chrome APIs are available
        if (!chrome?.storage?.local) {
          console.warn("Chrome storage API not available");
          return;
        }

        const result = await chrome.storage.local.get("transactions");
        if (result.transactions) {
          const storedTransactions: FireflyTransaction[] = result.transactions;

          // Convert to DataTableTransaction format
          const dataTableTransactions =
            convertFireflyTransactions(storedTransactions);

          setTransactions(dataTableTransactions);
        }

        // Clear the badge when popup is opened
        if (chrome?.action?.setBadgeText) {
          chrome.action.setBadgeText({ text: "" });
        }
      } catch (error) {
        console.error("Failed to load stored transactions:", error);
      }
    };

    loadStoredTransactions();

    function handleMessage(message: RestRequestEvent) {
      // Only process messages from background source
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
    }

    chrome.runtime.onMessage.addListener(handleMessage);

    // Cleanup listener on unmount
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  return <PluginsList />;

  return (
    <div className="py-5 px-4 max-h-screen flex flex-col overflow-hidden">
      <h1 className="text-3xl font-bold mb-3 text-center">OpenFin</h1>
      {transactions.length === 0 ? (
        <div className="text-center text-gray-500 py-8 flex-grow flex items-center justify-center">
          <div>
            <p>No transactions captured yet.</p>
            <p className="text-sm mt-2">
              Visit a supported financial website to see transaction data appear
              here automatically.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-scroll flex-grow">
          <DataTable columns={columns} data={transactions} />
        </div>
      )}
    </div>
  );
}
