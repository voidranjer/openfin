export type TransactionList = {
  transactions: Transaction[],
  pluginName: string
}

export type ActualBudgetAccount = {
  id: string;
  name: string;
}

export function emptyTransactionStore(): TransactionList {
  return { transactions: [], pluginName: "" }
}

export type AppStorage = {
  transactionStore: TransactionList; // transactions marked for import into ActualBudget
  actualBudgetAccounts: ActualBudgetAccount[]; // ActualBudget accounts fetched from the app
}

export type Transaction = {
  type: "withdrawal" | "deposit";
  description: string;
  category_name: string;
  amount: number; // Ensure amount is always positive (absolute value)
  date: string; // Format must be "2025-01-31"
  external_id: string;
  notes?: string | null;
  status?:
  | "pending"
  | "checking"
  | "posting"
  | "success"
  | "error"
  | "duplicate";
};
