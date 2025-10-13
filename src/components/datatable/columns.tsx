"use client";

import type { FireflyTransaction } from "@/chrome/core/types/firefly";
import { type ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type DataTableTransaction = Pick<
  FireflyTransaction,
  "type" | "description" | "category_name" | "amount" | "date"
>;

export const columns: ColumnDef<DataTableTransaction>[] = [
  {
    accessorKey: "description",
    header: () => <div className="text-left">Description</div>,
  },
  {
    accessorKey: "category_name",
    header: () => <div className="text-center">Category</div>,
  },
  {
    accessorKey: "date",
    header: () => <div className="text-center">Date</div>,
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"));
      return (
        <div className="text-center">
          {date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const type = row.getValue("type") as "deposit" | "withdrawal";
      const isDeposit = type === "deposit";

      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      const displayAmount = isDeposit ? `+${formatted}` : `-${formatted}`;

      return (
        <div
          className={cn(
            "text-right font-medium",
            isDeposit ? "text-green-600" : "text-red-600"
          )}
        >
          {displayAmount}
        </div>
      );
    },
  },
];
