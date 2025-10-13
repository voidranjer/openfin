import { useEffect, useState, useRef } from "react";
import type { FireflyTransaction } from "@/chrome/core/types/firefly";

export interface RowAnimationState {
  [external_id: string]: {
    isNew: boolean;
    isUpdated: boolean;
    animationKey: number;
  };
}

interface UseDataTableAnimationsProps {
  transactions: FireflyTransaction[];
}

export function useDataTableAnimations({
  transactions,
}: UseDataTableAnimationsProps) {
  const [rowAnimations, setRowAnimations] = useState<RowAnimationState>({});
  const previousTransactionsRef = useRef<Map<string, FireflyTransaction>>(
    new Map()
  );
  const animationKeyRef = useRef(0);

  // Track transaction changes and trigger animations
  useEffect(() => {
    const prevMap = previousTransactionsRef.current;
    const newRowAnimations: RowAnimationState = {};
    const newMap = new Map<string, FireflyTransaction>();

    // Determine if this is new data (different external_ids) or updated data (same ids, different content)
    const currentIds = transactions
      .map((tx) => tx.external_id)
      .sort()
      .join(",");
    const previousIds = Array.from(prevMap.keys()).sort().join(",");
    const isNewData = currentIds !== previousIds;

    transactions.forEach((tx) => {
      newMap.set(tx.external_id, tx);
      const prevTx = prevMap.get(tx.external_id);

      if (!prevTx) {
        // Completely new transaction
        newRowAnimations[tx.external_id] = {
          isNew: isNewData, // Only animate as new if it's actually new data
          isUpdated: false,
          animationKey: isNewData ? ++animationKeyRef.current : 0,
        };
      } else {
        // Check if transaction was updated (ignore changes we don't care about)
        const isUpdated =
          prevTx.category_name !== tx.category_name ||
          prevTx.description !== tx.description ||
          prevTx.amount !== tx.amount;

        newRowAnimations[tx.external_id] = {
          isNew: false,
          isUpdated: isUpdated && !isNewData, // Only animate update if it's not new data
          animationKey: isUpdated ? ++animationKeyRef.current : 0,
        };
      }
    });

    setRowAnimations(newRowAnimations);
    previousTransactionsRef.current = newMap;

    // Clear animations after they complete
    if (
      Object.values(newRowAnimations).some(
        (anim) => anim.isNew || anim.isUpdated
      )
    ) {
      const timer = setTimeout(() => {
        setRowAnimations((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((key) => {
            updated[key] = {
              ...updated[key],
              isNew: false,
              isUpdated: false,
            };
          });
          return updated;
        });
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [transactions]);

  return {
    rowAnimations,
  };
}
