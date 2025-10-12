import type { RestRequestEvent } from "./core/types/requestBodyPipeline";

// Bridge script - runs in isolated world with access to chrome APIs
window.addEventListener("message", (event: MessageEvent<RestRequestEvent>) => {
  // Only accept messages from same origin
  if (event.source !== window) return;

  // Check if it's our extension message
  if (event.data.type === "openfin-rest-request") {
    // Forward to background script
    chrome.runtime.sendMessage({
      type: event.data.type,
      url: event.data.url,
      body: event.data.body,
    });
  }
});
