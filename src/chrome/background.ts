// import FireflyClient from "./core/FireflyClient";
import PluginManager from "./core/PluginManager";
import {
  isRestRequestEvent,
  type RestRequestEvent,
  type PluginStateEvent,
} from "./core/types/requestBodyPipeline";
import RogersBank from "./plugins/RogersBank";
import ScotiabankScenePlus from "./plugins/ScotiabankScenePlus";
import { StorageOperations } from "./core/StorageManager";
import { badgeManager } from "./core/BadgeManager";

const pluginManager = new PluginManager();
pluginManager.register(
  new ScotiabankScenePlus("Scene Plus VISA") // TODO: change to actual name
);
pluginManager.register(
  new RogersBank("Rogers Red") // TODO: change to actual name
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

    // Send current plugin state to the side panel
    const pluginStateMessage: PluginStateEvent = {
      type: "PLUGIN_STATE_UPDATE",
      source: "background",
      plugin: pluginData,
      url: tab.url,
    };

    // Send the message after a brief delay to ensure the side panel is ready
    setTimeout(() => {
      try {
        chrome.runtime.sendMessage(pluginStateMessage);
      } catch {
        console.debug("No message receiver available for initial plugin state");
      }
    }, 100);
  } catch (error) {
    console.error("Failed to open side panel:", error);
  }
});

// Helper function to send plugin state message
async function sendPluginStateMessage(tab: chrome.tabs.Tab) {
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

  // Send message about current plugin state to App.tsx
  const pluginStateMessage: PluginStateEvent = {
    type: "PLUGIN_STATE_UPDATE",
    source: "background",
    plugin: pluginData,
    url: tab.url,
  };

  try {
    chrome.runtime.sendMessage(pluginStateMessage);
  } catch {
    // Side panel might not be open, that's okay
    console.debug("No message receiver available for plugin state update");
  }
}

chrome.tabs.onUpdated.addListener(async (_tabId, _info, tab) => {
  sendPluginStateMessage(tab);
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    sendPluginStateMessage(tab);
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

        const forwardedMessage: RestRequestEvent = {
          type: message.type,
          source: "background",
          url: message.url,
          body: JSON.stringify(output),
        };

        // Send message to popup if it's open
        try {
          chrome.runtime.sendMessage(forwardedMessage);
        } catch {
          // Popup might not be open, that's okay since data is stored
          // Suppress the "Receiving end does not exist" error as it's expected
          console.debug(
            "No message receiver available (popup/side panel not open)"
          );
        }

        // fireflyClient.postTransactions(output);
      }
    }
  }
});
