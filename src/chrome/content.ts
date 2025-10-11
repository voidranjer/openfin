interface PostMessageData {
  source: string;
  type: string;
  url: string;
  body: string;
}

// Extend XMLHttpRequest to include our custom property
declare global {
  interface XMLHttpRequest {
    _url?: string;
  }
}

// Intercept fetch
const originalFetch = window.fetch;
window.fetch = function (...args: Parameters<typeof fetch>) {
  return originalFetch.apply(this, args).then(response => {
    response.clone().text().then(body => {
      const fullUrl = new URL(args[0] as string, window.location.href).href;
      // console.log('Fetch URL:', fullUrl);
      // console.log('Response body:', body);
      // Send to bridge script via postMessage
      const messageData: PostMessageData = {
        source: 'openfin-content',
        type: 'RESPONSE_BODY',
        url: fullUrl,
        body: body
      };
      window.postMessage(messageData, '*');
    });
    return response;
  });
};

// Intercept XMLHttpRequest
const originalOpen = XMLHttpRequest.prototype.open;
const originalSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function(method: string, url: string | URL, async: boolean = true, user?: string | null, password?: string | null) {
  this._url = url.toString();
  return originalOpen.call(this, method, url, async, user, password);
};

XMLHttpRequest.prototype.send = function(body?: Document | XMLHttpRequestBodyInit | null) {
  this.addEventListener('load', function() {
    const fullUrl = this._url?.startsWith('http') ? this._url : `${window.location.origin}${this._url}`;
    // console.log('XHR URL:', fullUrl);
    // console.log('Response:', this.response);
    const messageData: PostMessageData = {
      source: 'openfin-content',
      type: 'RESPONSE_BODY',
      url: fullUrl,
      body: this.response as string
    };
    window.postMessage(messageData, '*');
  });
  return originalSend.call(this, body);
};