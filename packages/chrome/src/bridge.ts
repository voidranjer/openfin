window.addEventListener("message", (event: MessageEvent) => {
  const { name } = event.data;

  if (name === "openfin-transactions-csv-request") {
    chrome.runtime.sendMessage({ name });
  }
});

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  if (message.name === "openfin-transactions-csv-response") {
    window.postMessage({ name: message.name, transactions: message.data });
  }
});
