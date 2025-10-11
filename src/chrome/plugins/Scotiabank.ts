import Plugin from "../core/Plugin";
import { parseDate } from "../core/utils";
import type { FireflyTransaction } from "../core/types/firefly";
import type {
  ChequingApiResponse,
  ScenePlusApiResponse,
} from "./types/scotiabank";

export default class Scotiabank extends Plugin<
  ChequingApiResponse | ScenePlusApiResponse
> {
  getUrlPattern() {
    return /secure\.scotiabank\.com.*transaction-history/;
  }

  parseResponse(responseBody: ChequingApiResponse | ScenePlusApiResponse) {
    const transactions: FireflyTransaction[] = [];

    // Scene Plus VISA
    if ("settled" in responseBody.data) {
      const rawTransactions = responseBody.data
        .settled as ScenePlusApiResponse["data"]["settled"];

      transactions.push(
        ...rawTransactions.map((t) => {
          const isWithdrawal = t.transactionType === "DEBIT";
          const type = isWithdrawal ? "withdrawal" : "deposit";
          const amount = t.transactionAmount.amount;
          const description = t.cleanDescription;
          const notes = t.userInputTag;
          const category_name = t.category.description;
          const date = parseDate(t.transactionDate);
          const external_id = t.key;
          const source_name = isWithdrawal
            ? this.fireflyAccountName
            : undefined;
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

          return payload;
        })
      );
    }

    // Chequing
    else {
      // const rawTransactions = responseBody.data as ChequingApiResponse["data"];
      // transactions.push(rawTransactions);
    }

    return transactions;
  }
  
}
