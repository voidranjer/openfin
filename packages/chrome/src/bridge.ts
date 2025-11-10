// Event: window.postMessage received from current web page
window.addEventListener("message", (event: MessageEvent) => {
  const { name } = event.data;

  if (name === "openfin-transactions-csv-request") {
    chrome.runtime.sendMessage({ name });
  }
});

// Event: Forward CSV export response from background.ts to current web page
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  if (message.name === "openfin-transactions-csv-response") {
    window.postMessage({ name: message.name, transactions: message.data });
  }
});
