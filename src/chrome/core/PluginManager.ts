import Plugin from "./Plugin";

export default class PluginManager {
  private plugins: Plugin[] = [];

  register(plugin: Plugin) {
    this.plugins.push(plugin);
  }
  
  findMatchingPlugin(url: string): Plugin | undefined {
    return this.plugins.find((plugin) => {
      const pattern = plugin.getUrlPattern();
      if (pattern instanceof RegExp) {
        return pattern.test(url);
      } else if (typeof pattern === 'string') {
        return url.includes(pattern);
      }
      return false;
    });
  }
}
