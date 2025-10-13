import Plugin from "./Plugin";
import type { FireflyTransaction } from "./types/firefly";

export default class PluginManager {
  private plugins: Plugin[] = [];

  register(plugin: Plugin) {
    this.plugins.push(plugin);
  }

  findMatchingPlugin(url: string): Plugin | undefined {
    return this.plugins.find((plugin) => {
      const pattern = plugin.getBaseUrlPattern();
      return pattern.test(url);
    });
  }

  findPluginForApiUrl(url: string): Plugin | undefined {
    return this.plugins.find((plugin) => {
      // First check if the base URL matches
      const basePattern = plugin.getBaseUrlPattern();
      if (!basePattern.test(url)) {
        return false;
      }

      // Then check if the API URL pattern matches
      const apiPattern = plugin.getApiUrlPattern();
      return apiPattern.test(url);
    });
  }

  parseApiResponse(
    url: string,
    responseBody: string
  ): FireflyTransaction[] | undefined {
    const plugin = this.findPluginForApiUrl(url);

    if (plugin) {
      return plugin.parseResponse(JSON.parse(responseBody));
    }
    return undefined;
  }

  getRegisteredPlugins() {
    return this.plugins.map((plugin) => ({
      displayName: plugin.displayName,
      iconUrl: plugin.iconUrl,
      fireflyAccountName: plugin.fireflyAccountName,
      baseUrlPattern: plugin.getBaseUrlPattern().source,
      apiUrlPattern: plugin.getApiUrlPattern().source,
    }));
  }
}
