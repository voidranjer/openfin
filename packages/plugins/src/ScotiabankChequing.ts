import type { Transaction } from "@openbanker/core/types";

export default function scrape() {

  // Converts "Nov 3, 2025" to "2025-11-03"
  function convertDate(dateStr: string) {
    const date = new Date(dateStr);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  }


  const tableBody = document.querySelector("table.transactionTable tbody");
  if (!tableBody) return [];

  const rows = tableBody.querySelectorAll("tr[role='row']");

  const rawTransactions = Array.from(rows).map((row) => {
    const cols = row.querySelectorAll("td");
    return Array.from(cols).map(col => col.innerText?.trim());
  });

  const transactions: Transaction[] = rawTransactions.map(cols => ({
    date: convertDate(cols[0].slice(5)),
    description: cols[2],
    amount: parseFloat((cols[3] || cols[4]).replaceAll(/[-,\$\s]/g, "")),
    type: cols[3] !== "" ? "withdrawal" : "deposit",
    category_name: "",
    external_id: ""
  }))

  return transactions;
}
