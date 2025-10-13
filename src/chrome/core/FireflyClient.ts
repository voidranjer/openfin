import { type FireflyTransaction } from "./types/firefly";
import { parseDateReverse } from "./utils";
import { type TransactionStatusUpdateEvent } from "./types/requestBodyPipeline";

export default class FireflyClient {
  private fireflyUrl: string;
  private fireflyToken: string;

  constructor(fireflyUrl: string, fireflyToken: string) {
    this.fireflyUrl = fireflyUrl.replace(/\/$/, "");
    this.fireflyToken = fireflyToken;
  }

  private notifyStatusUpdate(
    external_id: string,
    status:
      | "pending"
      | "checking"
      | "posting"
      | "success"
      | "error"
      | "duplicate"
  ) {
    const message: TransactionStatusUpdateEvent = {
      type: "TRANSACTION_STATUS_UPDATE",
      source: "firefly-client",
      external_id,
      status,
    };

    try {
      chrome.runtime.sendMessage(message);
    } catch {
      // UI might not be open, that's okay
      console.debug(
        "No message receiver available for transaction status update notification"
      );
    }
  }

  async isDuplicate(external_id: string) {
    const url = `${this.fireflyUrl}/api/v1/search/transactions?query=external_id_is:${external_id}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${this.fireflyToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const body = await response.json();
    return body.meta.pagination.total > 0;
  }

  async postTransactions(transactions: FireflyTransaction[]) {
    console.log("\n\n--------------------------------------------------");

    // Set all transactions to pending status initially
    transactions.forEach((t) => {
      this.notifyStatusUpdate(t.external_id, "pending");
    });

    // Check for duplicates before posting
    const validTransactions: FireflyTransaction[] = [];
    let numDupes = 0;
    const duplicateChecks = transactions.map(async (t) => {
      this.notifyStatusUpdate(t.external_id, "checking");
      const isDupe = await this.isDuplicate(t.external_id);
      if (!isDupe) {
        validTransactions.push(t);
        return;
      }
      numDupes++;
      this.notifyStatusUpdate(t.external_id, "duplicate");
      console.log(
        ` Duplicate |  ${parseDateReverse(t.date)}  ${t.description.padEnd(
          30
        )}  $ ${t.amount.toFixed(2).toString().padEnd(10)}  |  ${
          this.fireflyUrl
        }/search?search=external_id_is%3A%27${t.external_id}%27`
      );
    });
    await Promise.all(duplicateChecks);

    // Post non-duplicate transactions
    let numSuccess = 0;
    let numErrors = 0;
    const transactionsToPost = validTransactions.map(async (t) => {
      this.notifyStatusUpdate(t.external_id, "posting");

      const response = await fetch(`${this.fireflyUrl}/api/v1/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${this.fireflyToken}`,
        },
        body: JSON.stringify({
          error_if_duplicate_hash: true,
          transactions: [t],
        }),
      });

      const responseStatus = response.status;
      const responseBody = await response.json();
      if (!response.ok) {
        console.error(
          `Request failed with status ${responseStatus}: ${JSON.stringify(
            responseBody,
            null,
            2
          )}`
        );
        this.notifyStatusUpdate(t.external_id, "error");
        numErrors++;
        return;
      }
      this.notifyStatusUpdate(t.external_id, "success");
      numSuccess++;
      console.log(
        ` Success   |  ${parseDateReverse(t.date)}  ${t.description.padEnd(
          30
        )}  $ ${t.amount.toFixed(2).toString().padEnd(10)}`
      );
    });

    await Promise.all(transactionsToPost);

    console.log("--------------------------------------------------\n\n");
    console.log(`${"Errors".padEnd(14)}  >  ${numErrors}`);
    console.log(`${"Duplicates".padEnd(14)}  >  ${numDupes}`);
    console.log(`${"Success".padEnd(14)}  >  ${numSuccess}`);
    console.log("--------------------");
    console.log(`${"Total".padEnd(14)}  >  ${transactions.length}`);
  }
}
