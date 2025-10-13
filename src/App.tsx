import "./App.css";
import { useOpenFin } from "@/hooks/useOpenFin";
import Dashboard from "@/components/Dashboard";
import PluginsList from "@/components/plugins";

export default function App() {
  const { transactions, currentPlugin } = useOpenFin();

  // If no plugin is detected for current page, show plugins list
  if (!currentPlugin) {
    return <PluginsList />;
  }

  // Show plugin details and transactions for supported pages
  return <Dashboard plugin={currentPlugin} transactions={transactions} />;
}
