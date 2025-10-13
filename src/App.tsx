import { useEffect, useState } from "react";

import "./App.css";
import DataTable, {
  columns,
  type DataTableTransaction,
} from "@/components/datatable";
import {
  isRestRequestEvent,
  type RestRequestEvent,
} from "@/chrome/core/types/requestBodyPipeline";
import type { FireflyTransaction } from "@/chrome/core/types/firefly";

export default function App() {
  const [transactions, setTransactions] = useState<DataTableTransaction[]>([]);

  useEffect(() => {
    function handleMessage(message: RestRequestEvent) {
      // Only process messages from background source
      if (isRestRequestEvent(message) && message.source === "background") {
        try {
          const parsedTransactions: FireflyTransaction[] = JSON.parse(
            message.body
          );

          // Convert to DataTableTransaction format
          const dataTableTransactions: DataTableTransaction[] =
            parsedTransactions.map((transaction) => ({
              type: transaction.type,
              description: transaction.description,
              category_name: transaction.category_name,
              amount: transaction.amount,
              date: transaction.date,
            }));

          // Add new transactions to existing ones
          setTransactions((prevTransactions) => [
            ...prevTransactions,
            ...dataTableTransactions,
          ]);
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

  return (
    <div className="py-5 px-4">
      <h1 className="text-3xl font-bold mb-3 text-center">OpenFin</h1>
      <DataTable columns={columns} data={transactions} />
    </div>
  );
}
