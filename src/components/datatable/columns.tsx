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
    header: () => <div className="text-center">Description</div>,
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return (
        <div className="max-w-[200px] truncate" title={description}>
          {description}
        </div>
      );
    },
  },
  {
    accessorKey: "category_name",
    header: () => <div className="text-center">Category</div>,
    cell: ({ row }) => {
      const category = row.getValue("category_name") as string;
      return (
        <div className="max-w-[100px] truncate" title={category}>
          {category}
        </div>
      );
    },
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
    header: () => <div className="text-center">Amount</div>,
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
