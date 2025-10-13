import type { FireflyTransaction } from "./types/firefly";

export default abstract class Plugin<ApiResponse = unknown> {
  fireflyAccountName: string;
  displayName: string = "Unnamed Plugin";
  iconUrl: string = "";

  constructor(fireflyAccountName: string) {
    this.fireflyAccountName = fireflyAccountName;
  }

  // To match base URL for enabling the plugin
  abstract getBaseUrlPattern(): RegExp;

  // To match actual API request for parsing the response
  abstract getApiUrlPattern(): RegExp;

  abstract parseResponse(responseBody: ApiResponse): FireflyTransaction[];
}
