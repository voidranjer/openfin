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
chrome.runtime.onMessage.addListener(async (message: unknown) => {
  // Check if message instance of RestRequestEvent
  if (isRestRequestEvent(message) && message.source === "bridge") {
    const output = pluginManager
      .findMatchingPlugin(message.url)
      ?.parseResponse(JSON.parse(message.body));

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

      console.log("Background forwarding message:", forwardedMessage);

      // Send message to popup if it's open
      try {
        chrome.runtime.sendMessage(forwardedMessage);
      } catch {
        // Popup might not be open, that's okay since data is stored
        console.log("Message sent to storage, popup may not be open");
      }

      // fireflyClient.postTransactions(output);
    }
  }
});
