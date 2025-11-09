// TODO:
// Use OOP for DebuggerManager
// Move lastTabId here
// Also attach and detach logic here
// This class should track all debugger related state (it knows which tab is current, etc)
//
// TODO: Closing the pane should detach all debuggers and event handlers

import { EventEmitter } from 'events'; // relevant packages: 'events', '@types/events'. provides DebuggerManager.on("responseReceived"), and this.emit("responseReceived")

interface DebuggerManagerEvents {
  'attached': (tabId: number) => void;
  'detached': (tabId: number) => void;
  'responseReceived': (data: {
    url?: string;
    body?: string;
    base64Encoded: boolean;
  }) => void;
}

export declare interface DebuggerManager {
  on<U extends keyof DebuggerManagerEvents>(event: U, listener: DebuggerManagerEvents[U]): this;
  emit<U extends keyof DebuggerManagerEvents>(event: U, ...args: Parameters<DebuggerManagerEvents[U]>): boolean;
}

type NetworkGetResponseBodyResult = {
  body?: string;
  base64Encoded?: boolean;
};

function getResponseBody(
  tabId: number,
  requestId: string
): Promise<NetworkGetResponseBodyResult> {
  return new Promise((resolve, reject) => {
    chrome.debugger.sendCommand(
      { tabId },
      "Network.getResponseBody",
      { requestId },
      (result) => {
        const lastError = chrome.runtime.lastError;
        if (lastError) {
          reject(new Error(lastError.message));
          return;
        }

        resolve((result ?? {}) as NetworkGetResponseBodyResult);
      }
    );
  });
}

function extractRequestId(params?: object): string | undefined {
  const requestId = (params as { requestId?: unknown } | undefined)?.requestId;
  return typeof requestId === "string" ? requestId : undefined;
}

function extractUrl(params?: object): string | undefined {
  const url = (params as { response?: { url?: unknown } } | undefined)?.response
    ?.url;
  return typeof url === "string" ? url : undefined;
}

export class DebuggerManager extends EventEmitter {
  debuggerTabId: number | null = null;
  private pendingResponseBodies = new Map<string, string>(); // requestId -> url
  private boundHandleDebuggerEvent: (
    source: chrome.debugger.DebuggerSession,
    method: string,
    params?: object
  ) => void;

  constructor() {
    super();
    this.boundHandleDebuggerEvent = this.handleDebuggerEvent.bind(this);
  }

  isDebuggerAttached(): boolean {
    return this.debuggerTabId !== null;
  }

  detachDebugger() {
    if (!this.debuggerTabId) return;

    console.debug("detach debugger from tab:", this.debuggerTabId);

    chrome.debugger.detach({ tabId: this.debuggerTabId }).catch((error) => {
      console.error("Failed to detach debugger:", error);
    });

    chrome.debugger.onEvent.removeListener(this.boundHandleDebuggerEvent);

    this.pendingResponseBodies.clear();
    this.debuggerTabId = null;
  }

  async attachDebugger(tabId: number) {
    if (this.debuggerTabId === tabId) {
      console.debug("Attempted to attach debugger to the same tab. Ignoring...");
      return;
    }

    if (this.debuggerTabId) {
      console.debug("Debugger is already attached to a tab. Reattaching...");
      this.detachDebugger();
    }

    // Get tab information to check URL
    const tab = await chrome.tabs.get(tabId);

    // Check if tab still exists
    if (!tab || !tab.url) {
      console.error("Tab does not exist or has no URL:", tabId);
      return;
    }

    // Check if URL is restricted
    if (this.isRestrictedUrl(tab.url)) {
      console.error("Cannot attach debugger to restricted URL:", tab.url);
      return;
    }

    // Wait for tab to complete loading
    await this.waitForTabComplete(tabId);

    const target = { tabId };

    await chrome.debugger.attach(target, "1.3");
    await chrome.debugger.sendCommand(target, "Network.enable");

    console.debug("attach debugger to tab:", tabId);
    this.debuggerTabId = tabId;

    chrome.debugger.onEvent.addListener(this.boundHandleDebuggerEvent);
  }

  private handleDebuggerEvent = async (
    source: chrome.debugger.DebuggerSession,
    method: string,
    params?: object
  ) => {
    // Use the current debuggerTabId instead of a closed-over value
    if (source.tabId !== this.debuggerTabId) {
      console.warn(
        "Debugger event handler called for wrong tab! Are we attached to the correct tab? This should never happen.",
        `expected tabId=${this.debuggerTabId}, source.tabId=${source.tabId}`
      );
      return;
    }

    const requestId = extractRequestId(params);
    if (!requestId) {
      console.warn(
        "Received debugger event without requestId! Will not process further."
      );
      return;
    }

    if (method === "Network.responseReceived") {
      const url = extractUrl(params); // this param only exists on "Network.responseReceived" events, but we need to use it in Network.loadingFinished. store it in the map now.
      if (!url) {
        console.warn(
          "Received debugger event without URL! Will not process further."
        );
        return;
      }

      this.pendingResponseBodies.set(requestId, url);
      return;
    }

    if (method === "Network.loadingFinished") {
      if (!this.pendingResponseBodies.has(requestId)) {
        return;
      }

      const url = this.pendingResponseBodies.get(requestId);
      this.pendingResponseBodies.delete(requestId);

      // Use this.debuggerTabId which is always current
      const response = await getResponseBody(this.debuggerTabId!, requestId)

      this.emit('responseReceived', {
        url,
        body: response.body,
        base64Encoded: !!response.base64Encoded,
      });

      return;
    }

    if (method === "Network.loadingFailed") {
      this.pendingResponseBodies.delete(requestId);
      console.warn(`Network loading failed for request ${requestId}`);
      return;
    }
  };

  private isRestrictedUrl(url?: string): boolean {
    if (!url) return true;

    const restrictedPrefixes = [
      "chrome://",
      "chrome-extension://",
      "about:",
      "moz-extension://",
      "edge://",
      "opera://",
    ];

    return restrictedPrefixes.some((prefix) => url.startsWith(prefix));
  }

  private async waitForTabComplete(tabId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Tab loading timeout"));
      }, 10000); // 10 second timeout

      const checkTab = async () => {
        try {
          const tab = await chrome.tabs.get(tabId);
          if (tab.status === "complete") {
            clearTimeout(timeout);
            resolve();
          } else {
            setTimeout(checkTab, 500);
          }
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      };

      checkTab();
    });
  }
}

export default DebuggerManager;
