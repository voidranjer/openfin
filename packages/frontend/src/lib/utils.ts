import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
// [FIX] Tell TypeScript that 'browser' is a valid global variable
declare const browser: any;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getChromeContext(): 'extension' | 'web_page' {
  if (import.meta.env.APP_MODE === "SOLO") return 'web_page';

  const isExtension =
    (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) ||
    (typeof browser !== 'undefined' && browser.runtime && browser.runtime.id);

  return isExtension ? 'extension' : 'web_page';
}

