import Plugin from "../core/Plugin";
import { parseDate } from "../core/utils";
import type { FireflyTransaction } from "../core/types/firefly";
import type { ScenePlusApiResponse } from "./types/scotiabank";

export default class ScotiabankChequing extends Plugin<ScenePlusApiResponse> {
  getUrlPattern() {
    return /secure\.scotiabank\.com.*transaction-history.*accountType=CREDITCARD/;
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
      })

    return transactions;
  }
}
