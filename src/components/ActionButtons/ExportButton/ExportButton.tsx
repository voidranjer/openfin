import { FiDownload } from "react-icons/fi";

import { Button } from "@/components/ui/button";
import { type FireflyTransaction } from "@/chrome/core/types/firefly";

type Props = {
  pluginName: string;
  transactions: FireflyTransaction[];
};

export default function ExportButton({ transactions, pluginName }: Props) {
  function exportCSV() {
    // Convert data into CSV string
    const headers = [
      "ID",
      "Description",
      "Date",
      "Category",
      "Amount",
      "Notes",
    ];
    const rows = transactions.map((tx) => [
      `"${tx.external_id}"`,
      `"${tx.description}"`,
      `"${tx.date}"`,
      `"${tx.category_name}"`,
      tx.type === "withdrawal" ? `-${tx.amount}` : tx.amount,
      `"${tx.notes ?? ""}"`,
    ]);

    const pluginNameSnakeCase = pluginName.replace(/\s+/g, "_").toLowerCase();

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");

    // Create a blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${pluginNameSnakeCase}_transactions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    URL.revokeObjectURL(url);
  }

  return (
    <Button
      className="text-black bg-purple-200 hover:bg-purple-300 group"
      size="sm"
      onClick={exportCSV}
    >
      <FiDownload className="transition-transform duration-300 ease-in-out group-hover:scale-150" />
      Export
    </Button>
  );
}
