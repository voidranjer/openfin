import { toCSV } from "@openbanker/core/utils";
import { type AppStorage } from "@openbanker/core/types";

const CHROME_STORAGE_STRATEGY = "local";

// Event: Handle CSV export request from web page
chrome.runtime.onMessage.addListener(async (message, sender, _sendResponse) => {
  if (message.name === "openbanker-transactions-csv-request") {

    const keysToGet: Array<keyof AppStorage> = ["transactionStore"];
    const result = await chrome.storage[CHROME_STORAGE_STRATEGY].get(keysToGet) as Partial<AppStorage>;

    if (result.transactionStore) {
      const csvContent = toCSV(result.transactionStore.transactions);

      // Send response back to the requesting tab
      if (sender.tab?.id) {
        chrome.tabs.sendMessage(sender.tab.id, {
          name: "openbanker-transactions-csv-response",
          transactions: csvContent,
        });
      }
    }
    return;
  }

  if (message.name === "openbanker-sync-accounts") {
    const keyToSet: keyof AppStorage = "actualBudgetAccounts";
    chrome.storage[CHROME_STORAGE_STRATEGY].set({ [keyToSet]: message.accounts })
    return;
  }
});
