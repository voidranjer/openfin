import { useEffect } from "react";

import "./App.css";

import TransactionsTable from "@/components/TransactionsTable";
import ActionButtons from "@/components/ActionButtons";
import { getChromeContext } from "@/lib/utils";
import useChromeStorage from "@/hooks/useChromeStorage";

export default function App() {
  const [pluginName] = useChromeStorage<string>(
    "pluginName", "No plugins detected"
  );

  useEffect(() => {
    if (getChromeContext() !== 'extension') return;

    const background = chrome.runtime.connect({ name: "sidepanel" });

    function handleMessage(message: any) {
      if (message.name === "transactions-updated") {
        // setPluginName(message.pluginName);
        // setTransactions(message.data.transactions);
      }
    }

    background.onMessage.addListener(handleMessage);

    // Cleanup listener on unmount
    return () => {
      background.onMessage.removeListener(handleMessage);
    };
  }, []);

  return (
    <div className="m-5 flex flex-col space-y-5">
      <div className="flex justify-between">
        <div className="flex space-x-1">
          <div className="text-3xl font-bold">OpenFin</div>
          <pre className="flex items-start bg-blue-200 h-fit py-1 px-2 rounded scale-80">
            v0.0.1
          </pre>
        </div>

        <ActionButtons />
      </div>

      <div className="font-bold">
        Plugin: {pluginName}
      </div>

      <TransactionsTable />
    </div>
  );
}
