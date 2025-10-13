"use client";

import type { FireflyTransaction } from "@/chrome/core/types/firefly";
import { type ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface EditableCategoryProps {
  transaction: FireflyTransaction;
  updateTransaction?: (
    external_id: string,
    updatedFields: Partial<FireflyTransaction>
  ) => Promise<void>;
}

function EditableCategory({
  transaction,
  updateTransaction,
}: EditableCategoryProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(transaction.category_name);

  const handleSave = async () => {
    if (updateTransaction && editValue !== transaction.category_name) {
      await updateTransaction(transaction.external_id, {
        category_name: editValue,
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(transaction.category_name);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="h-8 text-xs"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
          autoFocus
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSave}
          className="h-6 w-6 p-0"
        >
          <Check className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className="max-w-[100px] truncate cursor-pointer hover:bg-gray-100 rounded px-1"
      title={`${transaction.category_name} (click to edit)`}
      onClick={() => setIsEditing(true)}
    >
      {transaction.category_name}
    </div>
  );
}

export const createColumns = (
  updateTransaction?: (
    external_id: string,
    updatedFields: Partial<FireflyTransaction>
  ) => Promise<void>
): ColumnDef<FireflyTransaction>[] => [
  {
    id: "expander",
    header: "",
    cell: ({ row }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => row.toggleExpanded()}
          className="p-1 hover:cursor-pointer"
        >
          {row.getIsExpanded() ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      );
    },
  },
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
      return (
        <EditableCategory
          transaction={row.original}
          updateTransaction={updateTransaction}
        />
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

// Backward compatible export
export const columns = createColumns();
