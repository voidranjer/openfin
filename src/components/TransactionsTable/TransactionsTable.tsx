import { Cell, Column, ColumnHeaderCell, Table } from "@blueprintjs/table";

import { type FireflyTransaction } from "@/chrome/core/types/firefly";
import { formatDate } from "@/chrome/core/utils";

type Props = {
  transactions: FireflyTransaction[];
};

export default function TransactionsTable({ transactions }: Props) {
  const descriptionCellRenderer = (rowIndex: number) => (
    <Cell>{transactions[rowIndex].description}</Cell>
  );
  const dateCellRenderer = (rowIndex: number) => (
    <Cell style={{ textAlign: "center" }}>
      {formatDate(transactions[rowIndex].date)}
    </Cell>
  );
  const categoryCellRenderer = (rowIndex: number) => (
    <Cell style={{ textAlign: "center" }}>
      {transactions[rowIndex].category_name}
    </Cell>
  );
  const amountCellRenderer = (rowIndex: number) => {
    const transaction = transactions[rowIndex];
    return transaction.type === "deposit" ? (
      <Cell style={{ color: "green", textAlign: "end" }}>
        {transaction.amount.toFixed(2)}
      </Cell>
    ) : (
      <Cell style={{ color: "red", textAlign: "end" }}>
        {transaction.amount.toFixed(2)}
      </Cell>
    );
  };
  // const externalIdCellRenderer = (rowIndex: number) => <Cell>{transactions[rowIndex].external_id}</Cell>;
  const notesCellRenderer = (rowIndex: number) => (
    <Cell>{transactions[rowIndex].notes ?? ""}</Cell>
  );

  const columns = [
    {
      name: "Date",
      cellRenderer: dateCellRenderer,
    },
    {
      name: "Description",
      cellRenderer: descriptionCellRenderer,
    },
    {
      name: "Category",
      cellRenderer: categoryCellRenderer,
    },
    {
      name: "Amount",
      cellRenderer: amountCellRenderer,
    },
    {
      name: "Notes",
      cellRenderer: notesCellRenderer,
    },
  ];

  const columnWidths = [100, 300, 150, 100, 300];

  const headerRowRenderer = (colIdx: number) => (
    <ColumnHeaderCell className="text-center font-bold">
      {columns[colIdx].name}
    </ColumnHeaderCell>
  );

  return (
    <>
      <Table
        numRows={transactions.length}
        cellRendererDependencies={transactions}
        columnWidths={columnWidths}
      >
        {columns.map((col, idx) => (
          <Column
            key={idx}
            name={col.name}
            cellRenderer={col.cellRenderer}
            columnHeaderCellRenderer={headerRowRenderer}
          />
        ))}
      </Table>{" "}
    </>
  );
}
