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
chrome.runtime.onMessage.addListener((message: unknown) => {
  // Check if message instance of RestRequestEvent
  if (isRestRequestEvent(message) && message.source === "bridge") {
    const output = pluginManager
      .findMatchingPlugin(message.url)
      ?.parseResponse(JSON.parse(message.body));

    if (output) {
      const forwardedMessage: RestRequestEvent = {
        type: message.type,
        source: "background",
        url: message.url,
        body: JSON.stringify(output),
      };

      console.log("Background forwarding message:", forwardedMessage);

      chrome.runtime.sendMessage(forwardedMessage);

      // fireflyClient.postTransactions(output);
    }
  }
});
