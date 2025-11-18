import type { Transaction } from "@openbanker/core/types";

import { ScotiabankCredit, ScotiabankChequing, RBC, RogersBank, Wealthsimple, NGPF } from "@openbanker/plugins";

export type PluginConfig = {
  name: string;
  urlPattern: RegExp;
  scrapeFunc: () => Transaction[];
}

export type Config = {
  plugins: PluginConfig[];
}

const config: Config = {
  plugins: [
    {
      name: "Scotiabank Credit",
      urlPattern: /secure\.scotiabank\.com\/accounts\/credit/,
      scrapeFunc: ScotiabankCredit
    },
    {
      name: "Scotiabank Chequing",
      urlPattern: /secure\.scotiabank\.com\/accounts\/chequing/,
      scrapeFunc: ScotiabankChequing
    },
    {
      name: "RBC",
      urlPattern: /royalbank\.com/,
      scrapeFunc: RBC
    },
    {
      name: "Rogers Bank Credit",
      urlPattern: /selfserve\.rogersbank\.com\/transactions/,
      scrapeFunc: RogersBank
    },
    {
      name: "Wealthsimple",
      urlPattern: /my\.wealthsimple\.com/,
      scrapeFunc: Wealthsimple
    },
    {
      name: "NGPF",
      urlPattern: /ngpf\.org\/bank-sim\/account/g,
      scrapeFunc: NGPF
    }
  ]
}

export default config;
