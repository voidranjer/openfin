import Plugin from "./Plugin";

export default class PluginManager {
  private plugins: Plugin[] = [];

  register(plugin: Plugin) {
    this.plugins.push(plugin);
  }

  findMatchingPlugin(baseUrl: string): Plugin | undefined {
    return this.plugins.find((plugin) => {
      const pattern = plugin.getBaseUrlPattern();
      return pattern.test(baseUrl);
    });
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
