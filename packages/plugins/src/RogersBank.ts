import { Plugin } from "@openbanker/core";
import { parseDate } from "@openbanker/core/utils";
import type { FireflyTransaction } from "@openbanker/core/types";

import type { RogersApiResponse } from "./types/rogersbank";

export default class RogersBank extends Plugin<RogersApiResponse> {
  constructor(fireflyAccountName: string) {
    super(fireflyAccountName);
    this.displayName = "Rogers Bank";
    this.iconUrl =
      "https://about.rogers.com/wp-content/uploads/2020/09/Rogers-Red-Background1-1.jpg";
  }

  getBaseUrlPattern(): RegExp {
    return /rogersbank\.com/;
  }

  getApiUrlPattern(): RegExp {
    return /corebank\/v1/;
  }

  parseResponse(responseBody: RogersApiResponse) {
    if (responseBody.statusCode !== "200")
      throw new Error("Invalid API response structure");

    const transactions: FireflyTransaction[] = [];

    responseBody.activitySummary.activities.forEach((t) => {
      if (t.activityStatus !== "APPROVED") {
        console.warn(`Skipping non-approved transaction: ${t.merchant.name}`);
        return;
      }

      const isPayment = parseFloat(t.amount.value) < 0;
      const amount = Math.abs(parseFloat(t.amount.value));

      const payload: FireflyTransaction = {
        type: isPayment ? "deposit" : "withdrawal",
        description: t.merchant.name,
        notes: t.merchant.categoryDescription,
        category_name: t.merchant.category,
        amount,
        date: parseDate(t.date),
        external_id: t.referenceNumber,
        source_name: isPayment ? undefined : this.fireflyAccountName,
        destination_name: isPayment ? this.fireflyAccountName : undefined,
      };

      transactions.push(payload);
    });

    return transactions;
  }
}
