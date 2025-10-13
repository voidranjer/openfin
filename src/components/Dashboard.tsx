import Header from "@/components/Header";
import DataTable from "@/components/datatable";
import EmptyState from "@/components/EmptyState";
import { useOpenFin } from "@/hooks/useOpenFin";

export default function Dashboard() {
  const {
    currentPlugin,
    transactions,
    updateTransaction,
    resetTransactionCategory,
  } = useOpenFin();

  return (
    <div className="py-5 px-4 max-h-screen flex flex-col overflow-hidden">
      <Header plugin={currentPlugin} />
      {transactions.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-scroll flex-grow">
          <DataTable
            transactions={transactions}
            updateTransaction={updateTransaction}
            resetTransactionCategory={resetTransactionCategory}
          />
        </div>
      )}
    </div>
  );
}
