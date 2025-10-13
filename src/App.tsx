import { useEffect, useState } from "react";

import "./App.css";
import DataTable, {
  columns,
  type DataTableTransaction,
  convertFireflyTransactions,
} from "@/components/datatable";
import {
  isRestRequestEvent,
  isPluginStateEvent,
  type PluginStateEvent,
} from "@/chrome/core/types/requestBodyPipeline";
import type { FireflyTransaction } from "@/chrome/core/types/firefly";
import PluginsList from "@/components/plugins";

export default function App() {
  const [transactions, setTransactions] = useState<DataTableTransaction[]>([]);
  const [currentPlugin, setCurrentPlugin] =
    useState<PluginStateEvent["plugin"]>(null);

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

  // If no plugin is detected for current page, show plugins list
  if (!currentPlugin) {
    return <PluginsList />;
  }

  // Show plugin details and transactions for supported pages
  return (
    <div className="py-5 px-4 max-h-screen flex flex-col overflow-hidden">
      {/* Current Plugin Info */}
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-3">
          {currentPlugin.iconUrl && (
            <img
              src={currentPlugin.iconUrl}
              alt={`${currentPlugin.displayName} icon`}
              className="w-8 h-8 rounded object-cover flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <div>
            <h2 className="text-lg font-semibold text-green-800">
              {currentPlugin.displayName}
            </h2>
            <p className="text-sm text-green-600">
              Account: {currentPlugin.fireflyAccountName}
            </p>
          </div>
          <div className="ml-auto">
            <div className="flex items-center gap-2 text-green-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium">Supported Page</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <h1 className="text-3xl font-bold mb-3 text-center">OpenFin</h1>
      {transactions.length === 0 ? (
        <div className="text-center text-gray-500 py-8 flex-grow flex items-center justify-center">
          <div>
            <p>No transactions captured yet.</p>
            <p className="text-sm mt-2">
              Navigate around the website to see transaction data appear here
              automatically.
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
