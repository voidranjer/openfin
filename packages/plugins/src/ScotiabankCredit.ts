import { Plugin } from "@openbanker/core";
import type { FireflyTransaction } from "@openbanker/core/types";

// TODO: docs and comments about why scrape must be standalone function
function scrape() {

  // Converts "Nov 3, 2025" to "2025-11-03"
  function convertDate(dateStr: string) {
    const date = new Date(dateStr);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  }

  const transactions: FireflyTransaction[] = [];

  const tableBodies = document.querySelectorAll("table.transactionTable tbody");

  for (const [tableIdx, tableBody] of tableBodies.entries()) {
    const rows = tableBody.querySelectorAll("tr[role='row']");

    const rawTransactions = Array.from(rows).map((row) => {
      const cols = row.querySelectorAll("td");
      return Array.from(cols).map(col => col.innerText?.trim());
    });

    for (const cols of rawTransactions) {
      transactions.push({
        date: convertDate(cols[0].slice(5)),
        description: cols[2],
        amount: parseFloat((cols[3] || cols[4]).replaceAll(/[-,\$\s]/g, "")),
        type: cols[3] !== "" ? "withdrawal" : "deposit",
        category_name: "",
        notes: tableBodies.length > 1 && tableIdx === 0 ? "Pending" : "",
        external_id: ""
      })
    }
  }

  return transactions;
}

export default class ScotiabankCredit extends Plugin {
  constructor() {
    super("Scotiabank Credit");
  }

  getUrlPattern(): RegExp {
    return /secure\.scotiabank\.com\/accounts\/credit/;
  }

  getScrapingFunc() {
    return scrape;
  }
}
