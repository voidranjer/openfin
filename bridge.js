// Bridge script - runs in isolated world with access to chrome APIs
window.addEventListener('message', (event) => {
  // Only accept messages from same origin
  if (event.source !== window) return;
  
  // Check if it's our extension message
  if (event.data.source === 'openfin-content') {
    // Forward to background script
    chrome.runtime.sendMessage({
      type: event.data.type,
      url: event.data.url,
      body: event.data.body
    });
  }
});