/* Event: window.postMessage received from current web page */
window.addEventListener("message", (event: MessageEvent) => {
  const { name } = event.data;

  /* Relay */
  if (typeof name === "string" && name.startsWith("openbanker-")) {
    chrome.runtime.sendMessage(event.data);
    return;
  }
});

/* Event: Forward CSV export response from background.ts to current web page */
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  const { name } = message;

  if (typeof name === "string" && name.startsWith("openbanker-")) {
    window.postMessage(message);
  }
});
