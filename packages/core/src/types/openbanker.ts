import { type FireflyTransaction } from "./firefly";

export type TransactionList = {
  transactions: FireflyTransaction[],
  pluginName: string
}

export function emptyTransactionList(): TransactionList {
  return { transactions: [], pluginName: "" }
}
