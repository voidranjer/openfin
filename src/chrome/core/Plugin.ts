import type { FireflyTransaction } from "./types/firefly";

export default abstract class Plugin<ApiResponse = unknown> {
  fireflyAccountName: string;
  
  constructor(fireflyAccountName: string) {
    this.fireflyAccountName = fireflyAccountName;
  }
  
  abstract getUrlPattern(): RegExp | string;
  abstract parseResponse(responseBody: ApiResponse): FireflyTransaction[];
}