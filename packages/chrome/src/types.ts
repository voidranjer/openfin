import { type TransactionList } from "@openbanker/core/types";

export type AppStorage = {
  markedTransactions: TransactionList; // transactions marked for import into ActualBudget
  currTransactions: TransactionList; // transactions detected on the current page
}
