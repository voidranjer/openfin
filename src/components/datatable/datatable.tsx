"use client";

import React, { useEffect, useState } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getExpandedRowModel,
  // getPaginationRowModel,
} from "@tanstack/react-table";
import type { FireflyTransaction } from "@/chrome/core/types/firefly";

// import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export default function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [isAnimating, setIsAnimating] = useState(false);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    // getPaginationRowModel: getPaginationRowModel(),
    // initialState: { pagination: { pageSize: 50 } },
  });

  useEffect(() => {
    if (data.length > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [data]);

  return (
    <div>
      <div className="overflow-scroll rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      isAnimating && "animate-[wipeDown_0.6s_ease-out_both]"
                    )}
                    style={
                      isAnimating
                        ? { animationDelay: `${index * 50}ms` }
                        : undefined
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && (
                    <TableRow key={`${row.id}-expanded`}>
                      <TableCell
                        colSpan={columns.length}
                        className="p-4 bg-gray-50/50 border-t-0"
                      >
                        <div className="space-y-2 text-xs text-gray-700">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                            <div className="flex flex-col md:col-span-2">
                              <span className="font-medium text-gray-900">
                                Full Description:
                              </span>
                              <span className="text-gray-600">
                                {
                                  (row.original as FireflyTransaction)
                                    .description
                                }
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">
                                External ID:
                              </span>
                              <span className="text-gray-600 break-all">
                                {
                                  (row.original as FireflyTransaction)
                                    .external_id
                                }
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">
                                Type:
                              </span>
                              <span className="text-gray-600 capitalize">
                                {(row.original as FireflyTransaction).type}
                              </span>
                            </div>
                            {(row.original as FireflyTransaction)
                              .source_name && (
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900">
                                  Source:
                                </span>
                                <span className="text-gray-600">
                                  {
                                    (row.original as FireflyTransaction)
                                      .source_name
                                  }
                                </span>
                              </div>
                            )}
                            {(row.original as FireflyTransaction)
                              .destination_name && (
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900">
                                  Destination:
                                </span>
                                <span className="text-gray-600">
                                  {
                                    (row.original as FireflyTransaction)
                                      .destination_name
                                  }
                                </span>
                              </div>
                            )}
                          </div>
                          {(row.original as FireflyTransaction).notes && (
                            <div className="pt-2 border-t border-gray-200">
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900">
                                  Notes:
                                </span>
                                <span className="text-gray-600 mt-1 leading-relaxed">
                                  {(row.original as FireflyTransaction).notes}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div> */}
    </div>
  );
}
