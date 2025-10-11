import FireflyClient from "./core/FireflyClient";
import PluginManager from "./core/PluginManager";
import ScotiabankScenePlus from "./plugins/ScotiabankScenePlus";

// TODO: move this to types
interface MessageData {
  type: string;
  url: string;
  body: string;
}

const pluginManager = new PluginManager();
pluginManager.register(
  new ScotiabankScenePlus("Scene Plus VISA") // TODO: change to actual name
);

const fireflyClient = new FireflyClient(
  "http://localhost:8000", // TODO: change to actual URL
  "REPLACE_WITH_FIREFLY_API_KEY"
);

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    // chrome.storage.local.set({
    //   apiSuggestions: ['tabs', 'storage', 'scripting']
    // });
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message: MessageData) => {
  // Scotia
  if (message.type === "RESPONSE_BODY") {
    const output = pluginManager
      .findMatchingPlugin(message.url)
      ?.parseResponse(JSON.parse(message.body));
    
      if (output) {
        fireflyClient.postTransactions(output);
      }
  }
});
