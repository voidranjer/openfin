"use client";

import type { FireflyTransaction } from "@/chrome/core/types/firefly";
import { type ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  Check,
  X,
  RotateCcw,
  Clock,
  Search,
  Upload,
  CheckCircle,
  XCircle,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface StatusIndicatorProps {
  status?:
    | "pending"
    | "checking"
    | "posting"
    | "success"
    | "error"
    | "duplicate";
}

function StatusIndicator({ status }: StatusIndicatorProps) {
  if (!status) {
    return (
      <div className="flex items-center justify-center">
        <Clock className="h-4 w-4 text-gray-400" />
      </div>
    );
  }

  switch (status) {
    case "pending":
      return (
        <div className="flex items-center justify-center" title="Pending">
          <Clock className="h-4 w-4 text-gray-500" />
        </div>
      );
    case "checking":
      return (
        <div
          className="flex items-center justify-center"
          title="Checking for duplicates"
        >
          <Search className="h-4 w-4 text-blue-500 animate-pulse" />
        </div>
      );
    case "posting":
      return (
        <div
          className="flex items-center justify-center"
          title="Posting to Firefly"
        >
          <Upload className="h-4 w-4 text-blue-600 animate-pulse" />
        </div>
      );
    case "success":
      return (
        <div
          className="flex items-center justify-center"
          title="Posted successfully"
        >
          <CheckCircle className="h-4 w-4 text-green-600" />
        </div>
      );
    case "error":
      return (
        <div className="flex items-center justify-center" title="Error posting">
          <XCircle className="h-4 w-4 text-red-600" />
        </div>
      );
    case "duplicate":
      return (
        <div
          className="flex items-center justify-center"
          title="Duplicate transaction"
        >
          <Copy className="h-4 w-4 text-orange-500" />
        </div>
      );
    default:
      return (
        <div className="flex items-center justify-center">
          <Clock className="h-4 w-4 text-gray-400" />
        </div>
      );
  }
}

interface EditableCategoryProps {
  transaction: FireflyTransaction;
  updateTransaction?: (
    external_id: string,
    updatedFields: Partial<FireflyTransaction>
  ) => Promise<void>;
  resetTransactionCategory?: (external_id: string) => Promise<void>;
}

function EditableCategory({
  transaction,
  updateTransaction,
  resetTransactionCategory,
}: EditableCategoryProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(transaction.category_name);

  // Check if the category has been edited from its original value
  const isEdited =
    transaction.original_category_name &&
    transaction.category_name !== transaction.original_category_name;

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
          onFocus={(e) => e.target.select()}
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

  const title = isEdited
    ? `${transaction.category_name} (edited from: ${transaction.original_category_name}) - click to edit`
    : `${transaction.category_name} (click to edit)`;

  return (
    <div className="flex items-center gap-1">
      <div
        className={cn(
          "max-w-[100px] truncate cursor-pointer hover:bg-gray-100 rounded px-1",
          isEdited && "text-blue-600 italic font-medium"
        )}
        title={title}
        onClick={() => setIsEditing(true)}
      >
        {transaction.category_name}
      </div>
      {isEdited && resetTransactionCategory && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            resetTransactionCategory(transaction.external_id);
          }}
          className="h-4 w-4 p-0 text-gray-500 hover:text-gray-700"
          title={`Reset to original: ${transaction.original_category_name}`}
        >
          <RotateCcw className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

export const createColumns = (
  updateTransaction?: (
    external_id: string,
    updatedFields: Partial<FireflyTransaction>
  ) => Promise<void>,
  resetTransactionCategory?: (external_id: string) => Promise<void>
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
    accessorKey: "status",
    header: () => <div className="text-center">Status</div>,
    cell: ({ row }) => {
      return <StatusIndicator status={row.original.status} />;
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
          resetTransactionCategory={resetTransactionCategory}
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
      const type = row.original.type as "deposit" | "withdrawal";
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
