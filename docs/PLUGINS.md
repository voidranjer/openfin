# Anatomy of a Plugin

A plugin is a self-contained Typescript file that exports a default function following a specific signature.

To create your own bank module:

1. In this tutorial, we shall use the [NGPF Online Banking Simulator](https://www.ngpf.org/bank-sim/account) website. Navigate to **Accounts >> Account Activity** page.

2. Open the Developer Tools panel in your browser.

3. Type `document.querySelectorAll("table tbody tr td");` into the Javascript console.

4. Inspect the output. Notice that we have written a very simple CSS query selector that returns all the HTML nodes containing the transactions from the simulator website.

5. All that's left to do is write some Javascript (this project uses Typescript) to convert the `.innerText` or `.textContent` HTML properties of these nodes into the [`Transaction[]`](../packages/core/src/types/openbanker.ts) shape that OpenBanker expects.

6. Create your new file in [packages/plugins/src](../packages/plugins/src), for example `packages/plugins/src/BankOfAmerica.ts`. Check out the [example below](#example-packagespluginssrcngpfts) for how to structure your plugin file.

7. Update [packages/plugins/src/index.ts](/packages/plugins/src/index.ts) and [packages/frontend/src/config.ts](/packages/frontend/src/config.ts) to include your bank module.

8. Build the project from the root directory following [this guide](/README.md#-installation), and refresh the browser extension.

## Example: [`packages/plugins/src/NGPF.ts`](../packages/plugins/src/NGPF.ts)

```typescript
import type { Transaction } from "@openbanker/core/types";

export default function scrape(): Transaction[] {
  /*
   * Converts "11/17/2025" to "2025-11-17"
   * 'scrape' functions must be entirely self contained, so this function must be declared inside the 'scrape' function body
   * - see: https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts#programmatic
   */
  function convertDate(input: string): string {
    const [month, day, year] = input.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  // Query all table rows, grab only the first 5 columns of each row
  const NUM_COLS = 5;
  const tableCells: NodeListOf<Element> = document.querySelectorAll(
    `table tbody tr td:nth-of-type(-n+${NUM_COLS})`,
  );

  // Use a type predicate (Typescript) to assert `HTMLElement` type, and extract inner text content
  const textContents: string[] = Array.from(tableCells)
    .filter((node: Element): node is HTMLElement => node instanceof HTMLElement)
    .map((el) => el.innerText);

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
      amount: parseFloat(
        textContents[rowStartIdx + 3].replaceAll(/[-,\$\s]/g, ""),
      ),
      type: textContents[rowStartIdx + 3].includes("-")
        ? "withdrawal"
        : "deposit",
      category_name: "",
    };

    transactions.push(t);
  }

  // Return result back to OpenBanker
  return transactions;
}
```

## The Big Catch

We request minimum permissions from the browser in order to function (see [manifest.json](../packages/chrome/public/manifest.json)). E.g., we request only the [`activeTab`](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab) and [`scripting`](https://developer.chrome.com/docs/extensions/reference/api/scripting) APIs.

Consequently, Javascript injected into the host pages as content scripts run in an isolated VM environment. As such, you must ensure that your plugin files export self-contained functions that do not reference or depend on objects outside of the function body scope.

> You might have noticed that we made use of an imported type from within the function scope in the example above. Referencing external types from inside the function is fine, because during the build process, Typescript compiles `.ts` files into `.js` and `.cjs` Javascript files, with the types stripped. Types are only used for compile time verification.

Additionally, output from any `console.log()` statements in plugin files will appear in the host page's Javascript console (and not the console of the OpenBanker extension popup or service worker).

For more details, see <https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts#programmatic>
