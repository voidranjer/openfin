export type RestRequestEvent = {
  type: "openfin-rest-request";
  source: "content" | "background" | "bridge";
  baseUrl: string;
  apiUrl: string;
  body: string;
};

export type PluginStateEvent = {
  type: "PLUGIN_STATE_UPDATE";
  source: "background";
  plugin: {
    displayName: string;
    iconUrl: string;
    fireflyAccountName: string;
    baseUrlPattern: string;
    apiUrlPattern: string;
  } | null;
  url: string;
};

export type StorageUpdateEvent = {
  type: "STORAGE_UPDATED";
  source: "background";
};

/**
 * Type guard function to check if a message is a RestRequestEvent.
 *
 * This function uses TypeScript's type predicate syntax (`message is RestRequestEvent`)
 * to provide both runtime validation and compile-time type narrowing.
 *
 * @param message - The unknown message to check
 * @returns `true` if the message is a valid RestRequestEvent, `false` otherwise
 *
 * **How it works:**
 * - At runtime: Returns a boolean (true/false)
 * - At compile-time: If true, TypeScript narrows the type from `unknown` to `RestRequestEvent`
 *
 * **Usage:**
 * ```typescript
 * if (isRestRequestEvent(message)) {
 *   // Inside this block, TypeScript knows 'message' is RestRequestEvent
 *   console.log(message.url); // ✅ Type-safe access to properties
 * }
 * ```
 */
export function isRestRequestEvent(
  message: unknown
): message is RestRequestEvent {
  return (
    message !== null &&
    typeof message === "object" &&
    "type" in message &&
    (message as Record<string, unknown>).type === "openfin-rest-request" &&
    "baseUrl" in message &&
    "apiUrl" in message &&
    "body" in message &&
    "source" in message
  );
}

export function isPluginStateEvent(
  message: unknown
): message is PluginStateEvent {
  return (
    message !== null &&
    typeof message === "object" &&
    "type" in message &&
    (message as Record<string, unknown>).type === "PLUGIN_STATE_UPDATE" &&
    "url" in message &&
    "plugin" in message &&
    "source" in message
  );
}

export function isStorageUpdateEvent(
  message: unknown
): message is StorageUpdateEvent {
  return (
    message !== null &&
    typeof message === "object" &&
    "type" in message &&
    (message as Record<string, unknown>).type === "STORAGE_UPDATED" &&
    "source" in message
  );
}
