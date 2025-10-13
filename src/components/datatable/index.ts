import DataTable from "./datatable";
import { columns, type DataTableTransaction } from "./columns";
import type { FireflyTransaction } from "@/chrome/core/types/firefly";

// Utility function to convert FireflyTransaction to DataTableTransaction
export function convertFireflyTransactions(
  transactions: FireflyTransaction[]
): DataTableTransaction[] {
  return transactions.map((transaction) => ({
    type: transaction.type,
    description: transaction.description,
    category_name: transaction.category_name,
    amount: transaction.amount,
    date: transaction.date,
  }));
}

export default DataTable;
export { columns, type DataTableTransaction };
