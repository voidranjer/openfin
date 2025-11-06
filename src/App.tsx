import { useEffect, useState } from "react";

import { type FireflyTransaction } from "./chrome/core/types/firefly";

import "./App.css";
import TransactionsTable from "@/components/TransactionsTable";


export default function App() {
  const [data, setData] = useState<FireflyTransaction[]>([]);
  const [pluginName, setPluginName] = useState<string>("");


  useEffect(() => {
    chrome.runtime.connect({ name: 'sidepanel' });


    function handleMessage(message: any) {
      if (message.type === "FIREFLY_III_TRANSACTION") {
        setPluginName(message.data.pluginName);
        setData(message.data.transactions);
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage);

    // Cleanup listener on unmount
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [])




  return (
    <div className="m-5 flex flex-col space-y-5">

      <div className="flex align-center space-x-1">
        <div className="text-3xl font-bold">OpenFin</div>
        <pre className="flex items-start bg-blue-200 h-fit py-1 px-2 rounded scale-80">v0.0.1</pre>
      </div>

      <div className="font-bold">
        Plugin: {pluginName || "No plugin detected"}
      </div>

      <TransactionsTable transactions={data} />

    </div>
  )
}
