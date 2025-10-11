import PluginManager from "./core/PluginManager";
import Scotiabank from "./plugins/Scotiabank";

// TODO: move this to types
interface MessageData {
  type: string;
  url: string;
  body: string;
}

const pluginManager = new PluginManager();
pluginManager.register(
  new Scotiabank("Scotiabank VISA") // TODO: change to actual name
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
    console.log("Parsed transactions:", output);
  }
});
