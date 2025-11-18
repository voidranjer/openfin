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

  const transactions: FireflyTransaction[] = [];

  const tableBodies = document.querySelectorAll("table tbody");

  for (const [tableIdx, tableBody] of tableBodies.entries()) {
    const isPendingTable = tableBodies.length > 1 && tableIdx === 1;

    let rows = Array.from(tableBody.querySelectorAll("tr"));
    if (isPendingTable) rows = rows.slice(0, rows.length - 1); // Last row is used to show "Total"

    const rawTransactions = Array.from(rows).map((row) => {
      const cols = row.querySelectorAll("td");
      return Array.from(cols).map(col => col.innerText?.trim());
    });

    for (const cols of rawTransactions) {
      transactions.push({
        date: convertDate(cols[0]),
        description: cols[1],
        amount: parseFloat(cols[3].replaceAll(/[-,\$\s]/g, "")),
        type: cols[3].includes("-") ? "deposit" : "withdrawal",
        category_name: cols[2],
        notes: isPendingTable ? "Pending" : "",
        external_id: ""
      })
    }
  }

  return transactions;
}
