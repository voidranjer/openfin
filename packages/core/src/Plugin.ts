import type { FireflyTransaction } from "./types/firefly";

export default abstract class Plugin {
  displayName: string = "Unnamed Plugin";

  constructor(displayName: string) {
    this.displayName = displayName;
  }

  // To match base URL for enabling the plugin
  abstract getUrlPattern(): RegExp;

  // TODO: docs here on why this must be standalone function
  abstract getScrapingFunc(): () => FireflyTransaction[];
}
