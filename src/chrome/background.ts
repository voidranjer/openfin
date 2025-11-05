import PluginManager from "./core/PluginManager";
import RogersBank from "./plugins/RogersBank";
import ScotiabankScenePlus from "./plugins/ScotiabankScenePlus";
import { StorageOperations } from "./core/StorageManager";
import ScotiabankChequing from "./plugins/ScotiabankChequing";
import RBC from "./plugins/RBC";
import { DebuggerManager } from "./DebuggerManager";

const debuggerManager = new DebuggerManager();

debuggerManager.on("responseReceived", async (data) => {
  const { url, body, base64Encoded } = data;

  if (base64Encoded) {
    console.warn(
      "Encountered base64 encoded response body for URL:",
      url,
      ". Stopping here..."
    );
    return;
  }

  if (!url || !body) return;

  const plugin = pluginManager.findMatchingPluginByApiUrl(url);
  if (!plugin) return;

  const jsonBody = await JSON.parse(body);
  const transactions = plugin.parseResponse(jsonBody);

  chrome.runtime.sendMessage({
    type: "FIREFLY_III_TRANSACTION",
    data: transactions,
  });
});

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

// Store registered plugins information in storage
const registeredPlugins = pluginManager.getRegisteredPlugins();
StorageOperations.storeRegisteredPlugins(registeredPlugins);

let isSidePanelOpen = false;

chrome.runtime.onConnect.addListener(async (port) => {
  if (port.name === "sidepanel") {
    console.debug("Side panel connected.");

    let queryOptions = { active: true, currentWindow: true };
    let [currentTab] = await chrome.tabs.query(queryOptions);

    if (!currentTab.url || !currentTab.id) return;

    const plugin = pluginManager.findMatchingPlugin(currentTab.url);
    if (plugin === undefined) debuggerManager.detachDebugger();
    if (plugin !== undefined) debuggerManager.attachDebugger(currentTab.id);

    isSidePanelOpen = true;

    port.onDisconnect.addListener(() => {
      console.debug("Side panel disconnected/closed.");
      debuggerManager.detachDebugger();

      isSidePanelOpen = false;
    });
  }
});

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  if (!isSidePanelOpen) return;

  const baseUrl = (await chrome.tabs.get(activeInfo.tabId)).url;
  if (!baseUrl) return;

  const plugin = pluginManager.findMatchingPlugin(baseUrl);
  if (plugin === undefined) debuggerManager.detachDebugger();
  if (plugin !== undefined) debuggerManager.attachDebugger(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((_tabId, _info, tab) => {
  if (!isSidePanelOpen) return;

  if (!tab.url || !tab.id) return;

  const plugin = pluginManager.findMatchingPlugin(tab.url);
  if (plugin === undefined) debuggerManager.detachDebugger();
  if (plugin !== undefined) debuggerManager.attachDebugger(tab.id);
});

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    // chrome.storage.local.set({
    //   apiSuggestions: ['tabs', 'storage', 'scripting']
    // });
  }
});
