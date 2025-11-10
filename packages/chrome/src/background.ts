import { toCSV } from "@openbanker/core/utils";
import { emptyTransactionList } from "@openbanker/core/types";
import type { AppStorage } from "./types";

const CHROME_STORAGE_STRATEGY = "local";

// Event: Handle CSV export request from web page
chrome.runtime.onMessage.addListener(async (message, sender, _sendResponse) => {
  if (message.name === "openfin-transactions-csv-request") {

    const keysToGet: Array<keyof AppStorage> = ["markedTransactions"];
    const result = await chrome.storage[CHROME_STORAGE_STRATEGY].get(keysToGet) as Partial<AppStorage>;

    if (result.markedTransactions) {
      const csvContent = toCSV(result.markedTransactions.transactions);

      // Send response back to the requesting tab
      if (sender.tab?.id) {
        chrome.tabs.sendMessage(sender.tab.id, {
          name: "openfin-transactions-csv-response",
          data: csvContent,
        });
      }
    }
    return;
  }


  // Event: Clear marked transactions after successful import
  if (message.name === "openfin-transactions-imported-successfully") {
    chrome.storage[CHROME_STORAGE_STRATEGY].set({ "markedTransactions": emptyTransactionList() })
    return;
  }
});
