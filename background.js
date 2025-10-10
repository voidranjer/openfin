chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    chrome.storage.local.set({
      apiSuggestions: ['tabs', 'storage', 'scripting']
    });
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'RESPONSE_BODY') {
    console.log('Background received:', message.url, message.body);
    // Process the intercepted data here
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'RESPONSE_BODY' && message.url.contains('transaction-history')) {
    console.log(message.body);
    // chrome.storage.local.get('tip').then(sendResponse);
    // return true;
  }
});