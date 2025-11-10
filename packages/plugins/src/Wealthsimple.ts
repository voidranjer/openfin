import { Plugin } from "@openbanker/core";
import type { FireflyTransaction } from "@openbanker/core/types";

// TODO: docs and comments about why scrape must be standalone function
function scrape() {

  // From button --> parent div --> parent div --> go backwards until find h2
  function findPrevH2FromGrandparent(element: HTMLElement): HTMLElement | null {
    let grandparent = element.parentElement?.parentElement;
    if (!grandparent) return null;
    let sibling = grandparent.previousElementSibling;
    while (sibling) {
      if (sibling.tagName === 'H2') return sibling as HTMLElement;
      sibling = sibling.previousElementSibling;
    }
    return null;
  }

  const currencies = ["CAD", "USD"];

  const buttons: HTMLElement[] = Array.from(document.querySelectorAll("button[role='button']"))
    .filter((el): el is HTMLElement =>
      el instanceof HTMLElement &&
      currencies.some(currency => el.innerText.includes(currency))
    );


  const transactions: FireflyTransaction[] = buttons.map(button => {
    const dateText = findPrevH2FromGrandparent(button)?.innerText ?? "";
    const details = button.innerText.split("\n\n");

    console.log(details)

    const amountIdx = details.findIndex(text => currencies.some(currency => text.includes(currency)));
    console.log(amountIdx);
    if (amountIdx === -1) { console.warn("Wealthsimple: failed to find amount in details:", details); }


    const regexArrayAmount = details[amountIdx].match(/\$([^\s]+)/);
    const amountStr = regexArrayAmount ? regexArrayAmount[1].replace(/,/g, '') : "0";

    let date = "";
    try {
      date = new Date(dateText).toISOString().slice(0, 10);
    } catch { console.warn("Wealthsimple: failed to parse date:", dateText); }

    return {
      date,
      description: details.slice(0, 2).join(" "),
      amount: parseFloat(amountStr),
      type: details[amountIdx][0] === "$" ? "deposit" : "withdrawal",
      category_name: details[0],
      notes: amountIdx === details.length - 1 ? "" : details[details.length - 1],
      external_id: ""
    }
  })

  return transactions;
}

export default class Wealthsimple extends Plugin {
  constructor() {
    super("Wealthsimple");
  }

  getUrlPattern(): RegExp {
    return /my\.wealthsimple\.com/;
  }

  getScrapingFunc() {
    return scrape;
  }
}
