import { useEffect } from "react";

import "./App.css";

import { PluginManager } from "@openbanker/core";
import {
  RBC,
  Wealthsimple,
  ScotiabankChequing,
  ScotiabankCredit,
  RogersBank,
} from "@openbanker/plugins";
import TransactionsTable from "@/components/TransactionsTable";
import ActionButtons from "@/components/ActionButtons";
import EmptyState from "@/components/EmptyState";
import { emptyTransactionStore } from "@openbanker/core/types";
import { getChromeContext } from "@/lib/utils";
import useChromeStorage from "@/hooks/useChromeStorage";

export default function App() {
  const [transactionStore, setTransactionStore] = useChromeStorage("transactionStore", emptyTransactionStore())


  useEffect(() => {
    if (getChromeContext() !== 'extension') return;

    // Reset chrome storage
    setTransactionStore(emptyTransactionStore())

    const pluginManager = new PluginManager([new RBC(), new ScotiabankChequing(), new Wealthsimple(), new ScotiabankCredit(), new RogersBank()]);

    async function detectTransactions() {
      let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.url || !tab.id) return;

      const plugin = pluginManager.findMatchingPlugin(tab.url);
      if (plugin !== undefined) {

        const res = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: plugin.getScrapingFunc(),
        });

        if (res && res[0] && res[0].result) {
          setTransactionStore({ pluginName: plugin.displayName, transactions: res[0].result });
        }

      }
    }
    detectTransactions();

  }, []);

  return (
    <div className="m-5 flex flex-col space-y-5 min-w-[600px]">
      <div className="flex justify-between">
        <div className="flex space-x-1">
          <div className="text-3xl font-bold">OpenBanker</div>
          <pre className="flex items-start bg-blue-200 h-fit py-1 px-2 rounded scale-80">
            v0.0.1
          </pre>
        </div>

        <ActionButtons />
      </div>

      {
        transactionStore.pluginName !== "" && (
          < div className="font-bold">
            Plugin: {transactionStore.pluginName}
          </div>
        )

      }

      {transactionStore.pluginName === "" ? <EmptyState /> : <TransactionsTable transactions={transactionStore.transactions} />}

    </div>
  );
}
