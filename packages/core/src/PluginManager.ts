import Plugin from "./Plugin";

export default class PluginManager {
  private plugins: Plugin[] = [];

  constructor(pluginList: Plugin[]) {
    pluginList.forEach((plugin) => this.register(plugin));
  }

  register(plugin: Plugin) {
    this.plugins.push(plugin);
  }

  findMatchingPlugin(baseUrl: string): Plugin | undefined {
    return this.plugins.find((plugin) => {
      const pattern = plugin.getUrlPattern();
      return pattern.test(baseUrl);
    });
  }
}
