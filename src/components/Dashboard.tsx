import Header from "@/components/Header";
import DataTable from "@/components/datatable";
import EmptyState from "@/components/EmptyState";
import FireflyExecutor from "@/components/FireflyExecutor";
import { useOpenFin } from "@/hooks/useOpenFin";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const {
    currentPlugin,
    transactions,
    updateTransaction,
    resetTransactionCategory,
  } = useOpenFin();

  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    if (transactions.length > 0) {
      // Trigger flash animation when transactions are updated
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [transactions]);

  return (
    <div className="py-5 px-4 h-screen flex flex-col overflow-hidden">
      <Header plugin={currentPlugin} />

      <div
        className="overflow-scroll flex-grow flex flex-col"
        style={{
          animation: isFlashing ? "flash 1s ease-in-out" : "none",
        }}
      >
        {transactions.length === 0 ? (
          <EmptyState />
        ) : (
          <DataTable
            transactions={transactions}
            updateTransaction={updateTransaction}
            resetTransactionCategory={resetTransactionCategory}
          />
        )}
      </div>

      <FireflyExecutor transactions={transactions} />
    </div>
  );
}
