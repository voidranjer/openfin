import PluginManager from "./core/PluginManager";
import RogersBank from "./plugins/RogersBank";
import ScotiabankScenePlus from "./plugins/ScotiabankScenePlus";
import ScotiabankChequing from "./plugins/ScotiabankChequing";
import RBC from "./plugins/RBC";
import DebuggerManager from "./DebuggerManager";
//
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

// Event: Send transactions to frontend
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
    data: { pluginName: plugin.displayName, transactions },
  });
});

// Event: Handle sidePanel open/close
chrome.runtime.onConnect.addListener(async (port) => {
  if (port.name === "sidepanel") {
    console.debug("Side panel connected.");

    let queryOptions = { active: true, currentWindow: true };
    let [currentTab] = await chrome.tabs.query(queryOptions);

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

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    // chrome.storage.local.set({
    //   apiSuggestions: ['tabs', 'storage', 'scripting']
    // });
  }
});
