import { Cell, Column, Table } from "@blueprintjs/table";

import "./App.css";


export type FireflyTransaction = {
  type: "withdrawal" | "deposit";
  description: string;
  category_name: string;
  amount: number;
  date: string;
  external_id: string;
  notes?: string | null;
  source_name?: string | null;
  destination_name?: string | null;
  original_category_name?: string; // Track original category to detect edits
  status?:
  | "pending"
  | "checking"
  | "posting"
  | "success"
  | "error"
  | "duplicate";
};

export default function App() {
  const data: FireflyTransaction[] = [
    {
      type: "withdrawal",
      description: "Grocery Store",
      category_name: "Groceries",
      amount: 75.50,
      date: "2024-06-15",
      external_id: "txn_001",
    }
  ]

  const descriptionCellRenderer = (rowIndex: number) => <Cell>{data[rowIndex].description}</Cell>;
  const dateCellRenderer = (rowIndex: number) => <Cell>{data[rowIndex].date}</Cell>;
  const categoryCellRenderer = (rowIndex: number) => <Cell>{data[rowIndex].category_name}</Cell>;
  const amountCellRenderer = (rowIndex: number) => {
    const transaction = data[rowIndex];
    return transaction.type === "deposit" ? <Cell style={{ color: "green" }}>+${transaction.amount.toFixed(2)}</Cell>
      : <Cell style={{ color: "red" }}>-${transaction.amount.toFixed(2)}</Cell>;
  }
  const externalIdCellRenderer = (rowIndex: number) => <Cell>{data[rowIndex].external_id}</Cell>;


  return (

    <div className="m-5 flex flex-col space-y-5">

      <div className="flex align-center space-x-1">
        <div className="text-3xl font-bold">OpenFin</div>
        <pre className="flex items-start bg-blue-200 h-fit py-1 px-2 rounded scale-80">v0.0.1</pre>
      </div>

      <div className="font-bold">
        Plugin: Scotiabank (Scene+ VISA)
      </div>

      <Table numRows={data.length}>
        <Column name="Description" cellRenderer={descriptionCellRenderer} />
        <Column name="Date" cellRenderer={dateCellRenderer} />
        <Column name="Category" cellRenderer={categoryCellRenderer} />
        <Column name="Amount" cellRenderer={amountCellRenderer} />
        <Column name="External ID" cellRenderer={externalIdCellRenderer} />
      </Table>

    </div>
  )
}
