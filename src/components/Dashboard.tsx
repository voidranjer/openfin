import Header from "@/components/Header";
import TransactionView from "@/components/TransactionView";
import type { PluginStateEvent } from "@/chrome/core/types/requestBodyPipeline";
import type { DataTableTransaction } from "@/components/datatable";

interface DashboardProps {
  plugin: PluginStateEvent["plugin"];
  transactions: DataTableTransaction[];
}

export default function Dashboard({ plugin, transactions }: DashboardProps) {
  return (
    <div className="py-5 px-4 max-h-screen flex flex-col overflow-hidden">
      <Header plugin={plugin} />
      <TransactionView transactions={transactions} />
    </div>
  );
}
