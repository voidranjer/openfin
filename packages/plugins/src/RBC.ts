import type { FireflyTransaction } from "@openbanker/core/types";

export default function scrape() {

  // Converts "Nov 3, 2025" to "2025-11-03"
  function convertDate(dateStr: string) {
    const date = new Date(dateStr);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  }


  const table = document.querySelector("table.rbc-transaction-list-table");
  if (!table) return [];

  const rows = table.querySelectorAll("tr[data-role='transaction-list-table-transaction']");

  const rawTransactions = Array.from(rows).map((row) => {
    const cols = row.querySelectorAll("td");
    return Array.from(cols).map(col => col.innerText?.trim());
  });

  const transactions: FireflyTransaction[] = rawTransactions.map(cols => ({
    date: convertDate(cols[0]),
    description: cols[1].split("\n")[1],
    amount: parseFloat((cols[2] || cols[3]).replaceAll(/[\$,\s-]/g, "").trim()),
    type: cols[2] !== "" ? "withdrawal" : "deposit",
    category_name: cols[1].split("\n")[0],
    external_id: ""
  }))

  return transactions;
}
