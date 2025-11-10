import { Button } from "@/components/ui/button";
import { FaSave } from "react-icons/fa";

import type { TransactionList } from "@openbanker/core/types";
import useChromeStorage from "@/hooks/useChromeStorage";

export default function MarkTransactionsButton() {
  const [, setMarkedTransactions] =
    useChromeStorage<TransactionList>("markedTransactions", {
      transactions: [],
      pluginName: "",
    });
  const [currTransactions] = useChromeStorage<TransactionList>(
    "currTransactions",
    { transactions: [], pluginName: "" }
  );

  function handleMarkTransactions() {
    // if (markedTransactions.transactions.length !== 0) {
    //   const confirm = window.confirm(`Transactions from ${markedTransactions.pluginName} pending import. Wipe and replace?`);
    //   if (!confirm) return;
    // }

    setMarkedTransactions(currTransactions);
    window.open("https://actual.amperleft.com", "_blank");
  }

  return (
    <Button
      className="text-black bg-blue-200 hover:bg-blue-300 group"
      size="sm"
      onClick={handleMarkTransactions}
    >
      <FaSave className="transition-transform duration-300 ease-in-out group-hover:scale-150" />
      Export to ActualBudget
    </Button>
  );
}
