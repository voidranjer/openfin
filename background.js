chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    // chrome.storage.local.set({
    //   apiSuggestions: ['tabs', 'storage', 'scripting']
    // });
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  
  // Scotia
  const apiPattern = /transaction-history/;
  if (message.type === 'RESPONSE_BODY' && apiPattern.test(message.url)) {
    console.log('Background received:', message.url, JSON.parse(message.body));
    // Process the intercepted data here
  }
});