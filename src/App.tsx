import { useEffect, useState } from "react";
import { Cell, Column, ColumnHeaderCell, Table } from "@blueprintjs/table";

import { type FireflyTransaction } from "./chrome/core/types/firefly";

import "./App.css";

function formatDate(isoDateString: string): string {
  const date = new Date(isoDateString);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const day = date.getUTCDate();
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();

  return `${day} ${month} ${year}`;
}

export default function App() {
  const [data, setData] = useState<FireflyTransaction[]>([]);
  const [pluginName, setPluginName] = useState<string>("");

  const descriptionCellRenderer = (rowIndex: number) => <Cell>{data[rowIndex].description}</Cell>;
  const dateCellRenderer = (rowIndex: number) => <Cell style={{ textAlign: "center" }}>{formatDate(data[rowIndex].date)}</Cell>;
  const categoryCellRenderer = (rowIndex: number) => <Cell style={{ textAlign: "center" }}>{data[rowIndex].category_name}</Cell>;
  const amountCellRenderer = (rowIndex: number) => {
    const transaction = data[rowIndex];
    return transaction.type === "deposit" ? <Cell style={{ color: "green", textAlign: "end" }}>{transaction.amount.toFixed(2)}</Cell>
      : <Cell style={{ color: "red", textAlign: "end" }}>{transaction.amount.toFixed(2)}</Cell>;
  }
  // const externalIdCellRenderer = (rowIndex: number) => <Cell>{data[rowIndex].external_id}</Cell>;
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

  const columns = [
    {
      name: "Description",
      cellRenderer: descriptionCellRenderer
    },
    {
      name: "Date",
      cellRenderer: dateCellRenderer
    },
    {
      name: "Category",
      cellRenderer: categoryCellRenderer
    },
    {
      name: "Amount",
      cellRenderer: amountCellRenderer
    },
    {
      name: "Notes",
      cellRenderer: notesCellRenderer
    }
  ]

  const centeredHeaderRenderer = (colIdx: number) => (
    <ColumnHeaderCell className="text-center font-bold" >{columns[colIdx].name}</ColumnHeaderCell>
  );


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
        {columns.map((col, idx) => (
          <Column key={idx} name={col.name} cellRenderer={col.cellRenderer} columnHeaderCellRenderer={centeredHeaderRenderer} />
        ))}
      </Table>

    </div>
  )
}
