import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getChromeContext(): 'extension' | 'web_page' {
  if(import.meta.env.APP_MODE === "SOLO") return 'web_page';

  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
    return 'extension';
  } else {
    return 'web_page';
  }
}

