// Intercept fetch
const originalFetch = window.fetch;
window.fetch = function (...args) {
  return originalFetch.apply(this, args).then(response => {
    response.clone().text().then(body => {
      console.log('Fetch URL:', args[0]);
      console.log('Response body:', body);
      // Send to bridge script via postMessage
      window.postMessage({
        source: 'openfin-content',
        type: 'RESPONSE_BODY',
        url: args[0],
        body: body
      }, '*');
    });
    return response;
  });
};

// Intercept XMLHttpRequest
const XHR = XMLHttpRequest.prototype;
const open = XHR.open;
const send = XHR.send;

XHR.open = function (method, url) {
  this._url = url;
  return open.apply(this, arguments);
};

XHR.send = function () {
  this.addEventListener('load', function () {
    console.log('XHR URL:', this._url);
    console.log('Response:', this.response);
    window.postMessage({
      source: 'openfin-content',
      type: 'RESPONSE_BODY',
      url: this._url,
      body: this.response
    }, '*');
  });
  return send.apply(this, arguments);
};
