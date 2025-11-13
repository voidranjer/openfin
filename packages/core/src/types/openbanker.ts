import { type FireflyTransaction } from "./firefly";

export type TransactionList = {
  transactions: FireflyTransaction[],
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
  currActualBudgetAccount: ActualBudgetAccount | null; // currently selected ActualBudget account
}
