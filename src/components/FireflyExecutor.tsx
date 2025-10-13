import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FireflyClient from "@/chrome/core/FireflyClient";
import { StorageManager } from "@/chrome/core/StorageManager";
import type { FireflyTransaction } from "@/chrome/core/types/firefly";

interface FireflyExecutorProps {
  transactions: FireflyTransaction[];
}

export default function FireflyExecutor({
  transactions,
}: FireflyExecutorProps) {
  const [fireflyHost, setFireflyHost] = useState("");
  const [fireflyToken, setFireflyToken] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );

  const storageManager = StorageManager.getInstance();

  // Load saved values from Chrome storage on component mount
  useEffect(() => {
    const loadStoredValues = async () => {
      try {
        const [savedHost, savedToken] = await Promise.all([
          storageManager.get("fireflyHost"),
          storageManager.get("fireflyToken"),
        ]);

        if (savedHost) {
          setFireflyHost(savedHost);
        }
        if (savedToken) {
          setFireflyToken(savedToken);
        }
      } catch (error) {
        console.error("Error loading stored Firefly configuration:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredValues();
  }, [storageManager]);

  // Save host URL to storage when it changes
  const handleHostChange = async (value: string) => {
    setFireflyHost(value);
    setSaveStatus("saving");
    try {
      await storageManager.set("fireflyHost", value);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1500);
    } catch (error) {
      console.error("Error saving Firefly host:", error);
      setSaveStatus("idle");
    }
  };

  // Save token to storage when it changes
  const handleTokenChange = async (value: string) => {
    setFireflyToken(value);
    setSaveStatus("saving");
    try {
      await storageManager.set("fireflyToken", value);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1500);
    } catch (error) {
      console.error("Error saving Firefly token:", error);
      setSaveStatus("idle");
    }
  };

  // Clear saved credentials from storage
  const handleClearSavedData = async () => {
    try {
      await Promise.all([
        storageManager.clear("fireflyHost"),
        storageManager.clear("fireflyToken"),
      ]);
      setFireflyHost("");
      setFireflyToken("");
    } catch (error) {
      console.error("Error clearing saved Firefly configuration:", error);
    }
  };

  const handleExecute = async () => {
    if (!fireflyHost || !fireflyToken) {
      alert("Please enter both Firefly Host and Token");
      return;
    }

    if (transactions.length === 0) {
      alert("No transactions to post");
      return;
    }

    setIsExecuting(true);
    try {
      const client = new FireflyClient(fireflyHost, fireflyToken);
      await client.postTransactions(transactions);
      alert("Transactions posted successfully!");
    } catch (error) {
      console.error("Error posting transactions:", error);
      alert("Error posting transactions. Check console for details.");
    } finally {
      setIsExecuting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-4 p-4 border-t border-gray-200 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">
          Firefly III Configuration
        </h3>
        <div className="text-sm text-gray-600">
          Loading saved configuration...
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 border-t border-gray-200 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">
          Firefly III Configuration
        </h3>
        {saveStatus === "saving" && (
          <span className="text-xs text-blue-600">Saving...</span>
        )}
        {saveStatus === "saved" && (
          <span className="text-xs text-green-600">✓ Saved</span>
        )}
      </div>
      <div className="space-y-3">
        <div>
          <label
            htmlFor="firefly-host"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Firefly Host URL
          </label>
          <Input
            id="firefly-host"
            type="url"
            placeholder="https://firefly.example.com"
            value={fireflyHost}
            onChange={(e) => handleHostChange(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <label
            htmlFor="firefly-token"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            API Token
          </label>
          <Input
            id="firefly-token"
            type="password"
            placeholder="Your Firefly III API token"
            value={fireflyToken}
            onChange={(e) => handleTokenChange(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {transactions.length} transaction
              {transactions.length !== 1 ? "s" : ""} ready to post
            </span>
            {(fireflyHost || fireflyToken) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSavedData}
                className="text-xs"
              >
                Clear Saved Data
              </Button>
            )}
          </div>
          <Button
            onClick={handleExecute}
            disabled={
              isExecuting ||
              !fireflyHost ||
              !fireflyToken ||
              transactions.length === 0
            }
            className="min-w-[100px]"
          >
            {isExecuting ? "Posting..." : "Execute"}
          </Button>
        </div>
      </div>
    </div>
  );
}
