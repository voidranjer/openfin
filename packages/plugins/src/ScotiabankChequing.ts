import { Plugin } from "@openbanker/core";
import { parseDate } from "@openbanker/core/utils";
import type { FireflyTransaction } from "@openbanker/core/types";

import type { ChequingApiResponse } from "./types/scotiabank";

export default class ScotiabankChequing extends Plugin<ChequingApiResponse> {
  constructor(fireflyAccountName: string) {
    super(fireflyAccountName);
    this.displayName = "Scotiabank Chequing";
    this.iconUrl =
      "https://ofa.on.ca/wp-content/uploads/2023/11/MicrosoftTeams-image-5.png";
  }

  getBaseUrlPattern(): RegExp {
    return /secure\.scotiabank\.com\/accounts\/chequing/;
  }

  getApiUrlPattern(): RegExp {
    return /transaction-history.*accountType=DAYTODAY/;
  }

  parseResponse(responseBody: ChequingApiResponse) {
    const transactions: FireflyTransaction[] = [];

    responseBody.data.forEach((t) => {
      const isWithdrawal = t.transactionType === "DEBIT";
      const type = isWithdrawal ? "withdrawal" : "deposit";
      const amount = t.transactionAmount.amount;
      const description = t.cleanDescription;
      const notes = t.userInputTag;
      const category_name = t.category.description;
      const date = parseDate(t.transactionDate);
      const external_id = t.key;
      const source_name = isWithdrawal ? this.fireflyAccountName : undefined;
      const destination_name = isWithdrawal
        ? undefined
        : this.fireflyAccountName;

      const payload: FireflyTransaction = {
        type,
        description,
        notes,
        category_name,
        amount,
        date,
        external_id,
        source_name,
        destination_name,
      };

      transactions.push(payload);
    });

    return transactions;
  }
}
