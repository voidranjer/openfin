import { useEffect, useState } from "react";
import { Cell, Column, Table } from "@blueprintjs/table";

import { type FireflyTransaction } from "./chrome/core/types/firefly";

import "./App.css";


export default function App() {
  const [data, setData] = useState<FireflyTransaction[]>([]);
  const [pluginName, setPluginName] = useState<string>("");

  const descriptionCellRenderer = (rowIndex: number) => <Cell>{data[rowIndex].description}</Cell>;
  const dateCellRenderer = (rowIndex: number) => <Cell>{data[rowIndex].date}</Cell>;
  const categoryCellRenderer = (rowIndex: number) => <Cell>{data[rowIndex].category_name}</Cell>;
  const amountCellRenderer = (rowIndex: number) => {
    const transaction = data[rowIndex];
    return transaction.type === "deposit" ? <Cell style={{ color: "green" }}>+${transaction.amount.toFixed(2)}</Cell>
      : <Cell style={{ color: "red" }}>-${transaction.amount.toFixed(2)}</Cell>;
  }
  const externalIdCellRenderer = (rowIndex: number) => <Cell>{data[rowIndex].external_id}</Cell>;
  const notesCellRenderer = (rowIndex: number) => <Cell>{data[rowIndex].notes ?? ""}</Cell>;

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

      <Table numRows={data.length} cellRendererDependencies={data}>
        <Column name="Description" cellRenderer={descriptionCellRenderer} />
        <Column name="Date" cellRenderer={dateCellRenderer} />
        <Column name="Category" cellRenderer={categoryCellRenderer} />
        <Column name="Amount" cellRenderer={amountCellRenderer} />
        <Column name="External ID" cellRenderer={externalIdCellRenderer} />
        <Column name="Notes" cellRenderer={notesCellRenderer} />
      </Table>

    </div>
  )
}
