import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FireflyClient from "@/chrome/core/FireflyClient";
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

  return (
    <div className="mt-4 p-4 border-t border-gray-200 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">
        Firefly III Configuration
      </h3>
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
            onChange={(e) => setFireflyHost(e.target.value)}
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
            onChange={(e) => setFireflyToken(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="text-sm text-gray-600">
            {transactions.length} transaction
            {transactions.length !== 1 ? "s" : ""} ready to post
          </span>
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
