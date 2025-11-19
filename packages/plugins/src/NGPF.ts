import type { Transaction } from "@openbanker/core/types";

export default function scrape(): Transaction[] {
  /* 
   * Converts "11/17/2025" to "2025-11-17"
   * 'scrape' functions must be entirely self contained, so this function must be declared inside the 'scrape' function body
   * - see: https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts#programmatic
   */
  function convertDate(input: string): string {
    const [month, day, year] = input.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Query all table rows, grab only the first 5 columns of each row
  const NUM_COLS = 5;
  const tableCells: NodeListOf<Element> = document.querySelectorAll(`table tbody tr td:nth-of-type(-n+${NUM_COLS})`);

  // Use a type predicate (Typescript) to assert `HTMLElement` type, and extract inner text content
  const textContents: string[] = Array.from(tableCells)
    .filter((node: Element): node is HTMLElement => node instanceof HTMLElement)
    .map(el => el.innerText);

  // Initialize empty results vector
  const transactions: Transaction[] = [];

  // Calculate number of rows
  const numRows = Math.floor(textContents.length / 5);

  // Map table data cells into our `Transaction` type
  for (let i = 0; i < numRows; i++) {
    const rowStartIdx = i * NUM_COLS;

    const t: Transaction = {
      external_id: textContents[rowStartIdx],
      date: convertDate(textContents[rowStartIdx + 1]),
      description: textContents[rowStartIdx + 2],
      amount: parseFloat(textContents[rowStartIdx + 3].replaceAll(/[-,\$\s]/g, "")),
      type: textContents[rowStartIdx + 3].includes("-") ? "withdrawal" : "deposit",
      category_name: ""
    }

    transactions.push(t);
  }


  // Return result back to OpenBanker
  return transactions;
}
