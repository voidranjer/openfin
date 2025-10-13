import Header from "@/components/Header";
import DataTable from "@/components/datatable";
import { createColumns } from "@/components/datatable/columns";
import EmptyState from "@/components/EmptyState";
import type { PluginStateEvent } from "@/chrome/core/types/requestBodyPipeline";
import type { FireflyTransaction } from "@/chrome/core/types/firefly";

interface DashboardProps {
  plugin: PluginStateEvent["plugin"];
  transactions: FireflyTransaction[];
  updateTransaction: (
    external_id: string,
    updatedFields: Partial<FireflyTransaction>
  ) => Promise<void>;
}

export default function Dashboard({
  plugin,
  transactions,
  updateTransaction,
}: DashboardProps) {
  const columns = createColumns(updateTransaction);

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
