import { useState, useEffect, useCallback } from "react";
import { getChromeContext } from "@/lib/utils";

export const CHROME_STORAGE_STRATEGY: StorageArea = "local";

type StorageArea = "local" | "sync" | "managed";

type StorageData<T> = {
  [key: string]: T;
};

function useChromeStorage<T>(
  key: string,
  initialValue: T,
  storageArea: StorageArea = CHROME_STORAGE_STRATEGY
) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    if (getChromeContext() !== "extension") return;

    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === storageArea && key in changes) {
        setStoredValue(changes[key].newValue);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    chrome.storage[storageArea].get([key], (result: StorageData<T>) => {
      if (chrome.runtime.lastError) {
        console.error(
          `Error getting ${key} from chrome.storage.${storageArea}:`,
          chrome.runtime.lastError
        );
        return;
      }

      if (result[key] !== undefined) {
        setStoredValue(result[key]);
      } else {
        chrome.storage[storageArea].set(
          { [key]: initialValue } as StorageData<T>,
          () => {
            if (chrome.runtime.lastError) {
              console.error(
                `Error setting initial ${key} in chrome.storage.${storageArea}:`,
                chrome.runtime.lastError
              );
            }
          }
        );
      }
    });

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };

    // here be dragons: under no circumstances should you include 'initialValue' in any dependency arrays in this hook due to infinite loops caused by referential equality ([] != [])
  }, [key, storageArea]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {

      if (getChromeContext() !== "extension") return;

      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      chrome.storage[storageArea].set(
        { [key]: valueToStore } as StorageData<T>,
        () => {
          if (chrome.runtime.lastError) {
            console.error(
              `Error setting ${key} in chrome.storage.${storageArea}:`,
              chrome.runtime.lastError
            );
          }
        }
      );

    },
    [key, storageArea, storedValue]
  );

  return [storedValue, setValue] as const;
}

export default useChromeStorage;
