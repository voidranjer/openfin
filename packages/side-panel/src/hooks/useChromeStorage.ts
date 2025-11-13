import { useState, useEffect, useCallback } from "react";
import { type AppStorage } from "@openbanker/core/types";
import { getChromeContext } from "@/lib/utils";

export const CHROME_STORAGE_STRATEGY: StorageArea = "local";

type StorageArea = "local" | "sync" | "managed";

/**
 * A React hook to interact with Chrome's storage API, with the value type
 * automatically inferred from the provided storage key.
 *
 * @param key The key of the data in AppStorage.
 * @param initialValue The initial value to use if no value is found in storage.
 * @param storageArea The Chrome storage area to use.
 * @returns A tuple containing the stored value and a function to update it.
 */
function useChromeStorage<K extends keyof AppStorage>(
  key: K,
  initialValue: AppStorage[K],
  storageArea: StorageArea = CHROME_STORAGE_STRATEGY
) {
  const [storedValue, setStoredValue] = useState<AppStorage[K]>(initialValue);

  useEffect(() => {
    if (getChromeContext() !== "extension") return;

    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === storageArea && key in changes) {
        setStoredValue(changes[key].newValue as AppStorage[K]);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    chrome.storage[storageArea].get([key], (result) => {
      if (chrome.runtime.lastError) {
        console.error(
          `Error getting ${String(key)} from chrome.storage.${storageArea}:`,
          chrome.runtime.lastError
        );
        return;
      }

      if (result[key] !== undefined) {
        setStoredValue(result[key] as AppStorage[K]);
      } else {
        chrome.storage[storageArea].set({ [key]: initialValue }, () => {
          if (chrome.runtime.lastError) {
            console.error(
              `Error setting initial ${String(
                key
              )} in chrome.storage.${storageArea}:`,
              chrome.runtime.lastError
            );
          }
        });
      }
    });

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [key, initialValue, storageArea]);

  const setValue = useCallback(
    (value: AppStorage[K] | ((val: AppStorage[K]) => AppStorage[K])) => {
      if (getChromeContext() !== "extension") return;

      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      chrome.storage[storageArea].set({ [key]: valueToStore }, () => {
        if (chrome.runtime.lastError) {
          console.error(
            `Error setting ${String(key)} in chrome.storage.${storageArea}:`,
            chrome.runtime.lastError
          );
        }
      });
    },
    [key, storageArea, storedValue]
  );

  return [storedValue, setValue] as const;
}

export default useChromeStorage;
