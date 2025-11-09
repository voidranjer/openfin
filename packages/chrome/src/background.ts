import { PluginManager } from "@openbanker/core";
import {
  RogersBank,
  ScotiabankChequing,
  ScotiabankScenePlus,
  RBC,
} from "@openbanker/plugins";
import DebuggerManager from "./DebuggerManager";

const CHROME_STORAGE_STRATEGY = "local";

// Singleton: Debugger Manager
const debuggerManager = new DebuggerManager();

// Singleton: Plugin Manager
const pluginManager = new PluginManager();

pluginManager.register(
  new ScotiabankScenePlus("Scene Plus VISA") // TODO: change to actual name
);
pluginManager.register(
  new RogersBank("Rogers Red Mastercard") // TODO: change to actual name
);
pluginManager.register(
  new ScotiabankChequing("Chequing") // TODO: change to actual name
);
pluginManager.register(
  new RBC("RBC") // TODO: change to actual name
);

// State: Track if side panel is open
let isSidePanelOpen = false;

// Helper: Reattach or detach debugger based on current tab URL
function reattachDebuggerConditionally(baseUrl: string, tabId: number) {
  const plugin = pluginManager.findMatchingPlugin(baseUrl);
  if (plugin === undefined) {
    debuggerManager.detachDebugger();
    return;
  }

  debuggerManager.attachDebugger(tabId);
}

// Configuration: Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Event: Save transactions to storage and notify frontend to refresh
debuggerManager.on("responseReceived", async (data) => {
  const { url, body, base64Encoded } = data;

  if (base64Encoded) {
    console.debug(
      `Encountered base64 encoded response body for URL: ${url}. Stopping here...`
    );
    return;
  }

  if (!url || !body) return;

  const plugin = pluginManager.findMatchingPluginByApiUrl(url);
  if (!plugin) return;

  const jsonBody = await JSON.parse(body);
  const transactions = plugin.parseResponse(jsonBody);

  chrome.storage[CHROME_STORAGE_STRATEGY].set({ transactions });

  chrome.runtime.sendMessage({
    name: "transactions-updated",
    pluginName: plugin.displayName,
  });
});

// Event: Handle sidePanel open/close
chrome.runtime.onConnect.addListener(async (port) => {
  if (port.name === "sidepanel") {
    console.debug("Side panel connected.");

    const queryOptions = { active: true, currentWindow: true };
    const [currentTab] = await chrome.tabs.query(queryOptions);

    if (!currentTab.url || !currentTab.id) return;

    reattachDebuggerConditionally(currentTab.url, currentTab.id);

    isSidePanelOpen = true;

    port.onDisconnect.addListener(() => {
      console.debug("Side panel disconnected/closed.");
      debuggerManager.detachDebugger();

      isSidePanelOpen = false;
    });
  }
});

// Event: Current active tab has changed
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  if (!isSidePanelOpen) return;

  const baseUrl = (await chrome.tabs.get(activeInfo.tabId)).url;
  if (!baseUrl) return;

  const plugin = pluginManager.findMatchingPlugin(baseUrl);
  if (plugin === undefined) debuggerManager.detachDebugger();
  if (plugin !== undefined) debuggerManager.attachDebugger(activeInfo.tabId);
});

// Event: Tab has been updated (e.g., URL change, navigation)
chrome.tabs.onUpdated.addListener((_tabId, _info, tab) => {
  if (!isSidePanelOpen) return;
  if (!tab.url || !tab.id || !tab.active) return;

  reattachDebuggerConditionally(tab.url, tab.id);
});

// Event: Handle CSV export request from web page
chrome.runtime.onMessage.addListener((message, sender, _sendResponse) => {
  if (message.name === "openfin-transactions-csv-request") {
    // TODO: REFACTOR! DUPLICATED CODE HERE.

    chrome.storage[CHROME_STORAGE_STRATEGY].get(["transactions"], (result) => {
      const transactions = result.transactions || [];

      // Convert transactions to CSV format
      const headers = [
        "Date",
        "Description",
        "Notes",
        "Category",
        "Amount",
        "ID",
      ];
      const rows = transactions.map((tx: any) => [
        `"${tx.date}"`,
        `"${tx.description}"`,
        `"${tx.notes ?? ""}"`,
        `"${tx.category_name}"`,
        tx.type === "withdrawal" ? `-${tx.amount}` : tx.amount,
        `"${tx.external_id}"`,
      ]);

      const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");

      // Send response back to the requesting tab
      if (sender.tab?.id) {
        chrome.tabs.sendMessage(sender.tab.id, {
          name: "openfin-transactions-csv-response",
          data: csvContent,
        });
      }
    });
  }
});

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    // chrome.storage.local.set({
    //   apiSuggestions: ['tabs', 'storage', 'scripting']
    // });
  }
});
