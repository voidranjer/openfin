/**
 * Utility class for managing Chrome extension badge operations.
 * Provides a consistent interface for badge text and color management.
 */
export class BadgeManager {
  private static instance: BadgeManager;

  private constructor() {}

  /**
   * Get singleton instance of BadgeManager
   */
  static getInstance(): BadgeManager {
    if (!BadgeManager.instance) {
      BadgeManager.instance = new BadgeManager();
    }
    return BadgeManager.instance;
  }

  /**
   * Check if Chrome action API is available
   */
  private isActionAvailable(): boolean {
    return !!chrome?.action;
  }

  /**
   * Set badge text
   */
  async setBadgeText(text: string): Promise<boolean> {
    if (!this.isActionAvailable()) {
      console.warn("Chrome action API not available");
      return false;
    }

    try {
      await chrome.action.setBadgeText({ text });
      return true;
    } catch (error) {
      console.error("Failed to set badge text:", error);
      return false;
    }
  }

  /**
   * Set badge background color
   */
  async setBadgeBackgroundColor(color: string): Promise<boolean> {
    if (!this.isActionAvailable()) {
      console.warn("Chrome action API not available");
      return false;
    }

    try {
      await chrome.action.setBadgeBackgroundColor({ color });
      return true;
    } catch (error) {
      console.error("Failed to set badge background color:", error);
      return false;
    }
  }

  /**
   * Clear badge (set empty text)
   */
  async clearBadge(): Promise<boolean> {
    return await this.setBadgeText("");
  }

  /**
   * Show transaction count badge with green background
   */
  async showTransactionCount(count: number): Promise<boolean> {
    const textSet = await this.setBadgeText(count.toString());
    const colorSet = await this.setBadgeBackgroundColor("#4CAF50");
    return textSet && colorSet;
  }

  /**
   * Show error badge with red background
   */
  async showErrorBadge(text: string = "!"): Promise<boolean> {
    const textSet = await this.setBadgeText(text);
    const colorSet = await this.setBadgeBackgroundColor("#F44336");
    return textSet && colorSet;
  }

  /**
   * Show warning badge with orange background
   */
  async showWarningBadge(text: string = "?"): Promise<boolean> {
    const textSet = await this.setBadgeText(text);
    const colorSet = await this.setBadgeBackgroundColor("#FF9800");
    return textSet && colorSet;
  }
}

// Export singleton instance
export const badgeManager = BadgeManager.getInstance();
