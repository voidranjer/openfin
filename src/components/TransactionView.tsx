import DataTable, {
  columns,
  type DataTableTransaction,
} from "@/components/datatable";
import EmptyState from "@/components/EmptyState";

interface TransactionViewProps {
  transactions: DataTableTransaction[];
}

export default function TransactionView({
  transactions,
}: TransactionViewProps) {
  if (transactions.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="overflow-scroll flex-grow">
      <DataTable columns={columns} data={transactions} />
    </div>
  );
}
