import Plugin from "../core/Plugin";
// import { parseDate } from "../core/utils";
import type { FireflyTransaction } from "../core/types/firefly";
import type { ChequingApiResponse } from "./types/scotiabank";

export default class Scotiabank extends Plugin<
  ChequingApiResponse 
> {
  getUrlPattern() {
    return /recordingsuseless/;
  }

  parseResponse(_responseBody: ChequingApiResponse ) {
    const transactions: FireflyTransaction[] = [];

    return transactions;
  }
  
}
