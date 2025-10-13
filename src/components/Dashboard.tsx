import Header from "@/components/Header";
import DataTable, {
  columns,
  type DataTableTransaction,
} from "@/components/datatable";
import EmptyState from "@/components/EmptyState";
import type { PluginStateEvent } from "@/chrome/core/types/requestBodyPipeline";

interface DashboardProps {
  plugin: PluginStateEvent["plugin"];
  transactions: DataTableTransaction[];
}

export default function Dashboard({ plugin, transactions }: DashboardProps) {
  return (
    <div className="py-5 px-4 max-h-screen flex flex-col overflow-hidden">
      <Header plugin={plugin} />
      {transactions.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-scroll flex-grow">
          <DataTable columns={columns} data={transactions} />
        </div>
      )}
    </div>
  );
}
