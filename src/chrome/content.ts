// Extend XMLHttpRequest to include our custom property
declare global {
  interface XMLHttpRequest {
    _url?: string;
  }
}

// Intercept fetch
const originalFetch = window.fetch;
window.fetch = function (...args: Parameters<typeof fetch>) {
  return originalFetch.apply(this, args).then((response) => {
    response
      .clone()
      .text()
      .then((body) => {
        const fullUrl = new URL(args[0] as string, window.location.href).href;

        const messageData = {
          type: "openfin-rest-request",
          url: fullUrl,
          body: body,
          source: "content",
        };

        // Send to bridge script via postMessage
        window.postMessage(messageData, "*");
      });

    return response;
  });
};

// Intercept XMLHttpRequest
const originalOpen = XMLHttpRequest.prototype.open;
const originalSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function (
  method: string,
  url: string | URL,
  async: boolean = true,
  user?: string | null,
  password?: string | null
) {
  this._url = url.toString();
  return originalOpen.call(this, method, url, async, user, password);
};

XMLHttpRequest.prototype.send = function (
  body?: Document | XMLHttpRequestBodyInit | null
) {
  this.addEventListener("load", function () {
    const fullUrl = this._url?.startsWith("http")
      ? this._url
      : `${window.location.origin}${this._url}`;

    const messageData = {
      type: "openfin-rest-request",
      url: fullUrl,
      body: this.response as string,
      source: "content",
    };

    // Send to bridge script via postMessage
    window.postMessage(messageData, "*");
  });

  return originalSend.call(this, body);
};
