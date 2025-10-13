// import FireflyClient from "./core/FireflyClient";
import PluginManager from "./core/PluginManager";
import {
  isRestRequestEvent,
  type StorageUpdateEvent,
} from "./core/types/requestBodyPipeline";
import RogersBank from "./plugins/RogersBank";
import ScotiabankScenePlus from "./plugins/ScotiabankScenePlus";
import { StorageOperations } from "./core/StorageManager";
import { badgeManager } from "./core/BadgeManager";
import ScotiabankChequing from "./plugins/ScotiabankChequing";

// Helper function to notify UI that storage has been updated
function notifyStorageUpdated() {
  const message: StorageUpdateEvent = {
    type: "STORAGE_UPDATED",
    source: "background",
  };

  try {
    chrome.runtime.sendMessage(message);
  } catch {
    // UI might not be open, that's okay
    console.debug(
      "No message receiver available for storage update notification"
    );
  }
}

const pluginManager = new PluginManager();
pluginManager.register(
  new ScotiabankScenePlus("Scene Plus VISA") // TODO: change to actual name
);
pluginManager.register(
  new RogersBank("Rogers Red") // TODO: change to actual name
);
pluginManager.register(
  new ScotiabankChequing("Chequing") // TODO: change to actual name
);

// Store registered plugins information in storage
const registeredPlugins = pluginManager.getRegisteredPlugins();
StorageOperations.storeRegisteredPlugins(registeredPlugins);

/* Sidebar */
// Handle extension icon clicks
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id || !tab.url) {
    return;
  }

  const plugin = pluginManager.findMatchingPlugin(tab.url);

  const pluginData = plugin
    ? {
        displayName: plugin.displayName,
        iconUrl: plugin.iconUrl,
        fireflyAccountName: plugin.fireflyAccountName,
        baseUrlPattern: plugin.getBaseUrlPattern().source,
        apiUrlPattern: plugin.getApiUrlPattern().source,
      }
    : null;

  // Store current plugin state in storage
  await StorageOperations.updateCurrentPlugin(pluginData);

  try {
    // Open the side panel
    await chrome.sidePanel.open({ tabId: tab.id });

    // Notify UI to refresh from storage
    notifyStorageUpdated();
  } catch (error) {
    console.error("Failed to open side panel:", error);
  }
});

// Helper function to update plugin state in storage
async function updatePluginState(tab: chrome.tabs.Tab) {
  if (!tab.url) return;

  const plugin = pluginManager.findMatchingPlugin(tab.url);

  const pluginData = plugin
    ? {
        displayName: plugin.displayName,
        iconUrl: plugin.iconUrl,
        fireflyAccountName: plugin.fireflyAccountName,
        baseUrlPattern: plugin.getBaseUrlPattern().source,
        apiUrlPattern: plugin.getApiUrlPattern().source,
      }
    : null;

  // Store current plugin state in storage
  await StorageOperations.updateCurrentPlugin(pluginData);

  // Notify UI to refresh from storage
  notifyStorageUpdated();
}

chrome.tabs.onUpdated.addListener(async (_tabId, _info, tab) => {
  updatePluginState(tab);
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    updatePluginState(tab);
  } catch (error) {
    console.error("Failed to get tab info on activation:", error);
  }
});

// const fireflyClient = new FireflyClient(
//   "http://localhost:8000", // TODO: change to actual URL
//   "REPLACE_WITH_FIREFLY_API_KEY"
// );

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    // chrome.storage.local.set({
    //   apiSuggestions: ['tabs', 'storage', 'scripting']
    // });
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(async (message: unknown) => {
  // Check if message instance of RestRequestEvent
  if (isRestRequestEvent(message) && message.source === "bridge") {
    const output = pluginManager.parseApiResponse(message.url, message.body);

    if (output && output.length > 0) {
      // Find which plugin this URL belongs to
      const plugin = pluginManager.findPluginForApiUrl(message.url);

      if (plugin) {
        const pluginData = {
          displayName: plugin.displayName,
          iconUrl: plugin.iconUrl,
          fireflyAccountName: plugin.fireflyAccountName,
          baseUrlPattern: plugin.getBaseUrlPattern().source,
          apiUrlPattern: plugin.getApiUrlPattern().source,
        };

        // Store transactions for the specific plugin
        await StorageOperations.replaceTransactionsForPlugin(
          output,
          pluginData
        );

        // Show notification badge on popup icon
        await badgeManager.showTransactionCount(output.length);

        // Notify UI to refresh from storage
        notifyStorageUpdated();

        // fireflyClient.postTransactions(output);
      }
    }
  }
});
