import Plugin from "@/chrome/core/Plugin";
import { parseDate } from "@/chrome/core/utils";
import type { FireflyTransaction } from "@/chrome/core/types/firefly";
import type { RbcApiResponse } from "./types/rbc";

export default class RBC extends Plugin<RbcApiResponse> {
  constructor(fireflyAccountName: string) {
    super(fireflyAccountName);
    this.displayName = "RBC";
    this.iconUrl =
      "https://smitherschamber.com/wp-content/uploads/2025/02/royal-bank-smithers-bc-logo.jpg";
  }

  getBaseUrlPattern(): RegExp {
    return /royalbank\.com/;
  }

  getApiUrlPattern(): RegExp {
    return /royalbank\.com.*transaction-presentation-service-v3-dbb/;
  }

  parseResponse(responseBody: RbcApiResponse) {
    if (responseBody.hasError)
      throw new Error("Invalid API response structure");

    const transactions: FireflyTransaction[] = [];

    responseBody.transactionList.forEach((t) => {
      // if (t.activityStatus !== "APPROVED") {
      //   console.warn(`Skipping non-approved transaction: ${t.merchant.name}`);
      //   return;
      // }

      const isPayment = t.creditDebitIndicator === 'DEBIT';

      const payload: FireflyTransaction = {
        type: isPayment ? "deposit" : "withdrawal",
        description: `${t.description[1]} ${t.merchantName}`,
        notes: t.notes,
        category_name: t.description[0],
        amount: t.amount,
        date: parseDate(t.bookingDate),
        external_id: t.id,
        source_name: isPayment ? undefined : this.fireflyAccountName,
        destination_name: isPayment ? this.fireflyAccountName : undefined,
      };

      transactions.push(payload);
    });

    return transactions;
  }
}
