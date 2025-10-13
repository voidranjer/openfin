// import FireflyClient from "./core/FireflyClient";
import PluginManager from "./core/PluginManager";
import {
  isRestRequestEvent,
  type RestRequestEvent,
} from "./core/types/requestBodyPipeline";
import ScotiabankScenePlus from "./plugins/ScotiabankScenePlus";

const pluginManager = new PluginManager();
pluginManager.register(
  new ScotiabankScenePlus("Scene Plus VISA") // TODO: change to actual name
);

// Store registered plugins information in storage
const registeredPlugins = pluginManager.getRegisteredPlugins();
chrome.storage.local.set({
  registeredPlugins: registeredPlugins,
});

/* Sidebar */
// Handle extension icon clicks
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id || !tab.url) {
    return;
  }

  const plugin = pluginManager.findMatchingPlugin(tab.url);
  if (plugin) {
    try {
      // First set the options for this specific tab
      await chrome.sidePanel.setOptions({
        tabId: tab.id,
        path: "dist/index.html",
        enabled: true,
      });

      // Then open the side panel
      await chrome.sidePanel.open({ tabId: tab.id });
    } catch (error) {
      console.error("Failed to open side panel:", error);
    }
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, _info, tab) => {
  if (!tab.url) return;

  const plugin = pluginManager.findMatchingPlugin(tab.url);

  if (plugin) {
    chrome.action.enable(tabId);
    await chrome.sidePanel.setOptions({
      tabId,
      path: "dist/index.html",
      enabled: true,
    });
    return;
  }

  // No plugin found - disable action and close side panel if open
  chrome.action.disable(tabId);

  // Disable the side panel for this tab (this should close it if open)
  try {
    await chrome.sidePanel.setOptions({
      tabId,
      enabled: false,
    });
  } catch {
    // Ignore errors when disabling side panel
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
      // Store transactions in background storage (replace old content)
      await chrome.storage.local.set({ transactions: output });

      // Show notification badge on popup icon
      chrome.action.setBadgeText({ text: output.length.toString() });
      chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" });

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
});
