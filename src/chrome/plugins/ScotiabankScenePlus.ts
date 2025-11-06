import Plugin from "@/chrome/core/Plugin";
import { parseDate } from "@/chrome/core/utils";
import type { FireflyTransaction } from "@/chrome/core/types/firefly";
import type { ScenePlusApiResponse } from "./types/scotiabank";

export default class ScotiabankScenePlus extends Plugin<ScenePlusApiResponse> {
  constructor(fireflyAccountName: string) {
    super(fireflyAccountName);
    this.displayName = "Scotiabank Scene Plus";
    this.iconUrl =
      "https://ofa.on.ca/wp-content/uploads/2023/11/MicrosoftTeams-image-5.png";
  }

  getBaseUrlPattern(): RegExp {
    return /secure\.scotiabank\.com\/accounts\/credit/;
  }

  getApiUrlPattern(): RegExp {
    return /transaction-history.*accountType=CREDITCARD/;
  }

  parseResponse(responseBody: ScenePlusApiResponse) {
    const transactions: FireflyTransaction[] = [];

    responseBody.data.settled.forEach((t) => {
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
