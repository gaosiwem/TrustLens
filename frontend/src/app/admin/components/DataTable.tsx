"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import Pager from "../../../components/Pager";
import React from "react";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  sortable?: boolean;
  sortKey?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  total: number;
  loading: boolean;
  limit: number;
  offset: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onParamsChange: (params: {
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    search?: string;
  }) => void;
  onRowClick?: (item: T) => void;
  searchPlaceholder?: string;
  useStandardPager?: boolean;
}

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  total,
  loading,
  limit,
  offset,
  sortBy,
  sortOrder,
  onParamsChange,
  onRowClick,
  searchPlaceholder = "Search...",
  useStandardPager = false,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");

  // Debounce search
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }

    const handler = setTimeout(() => {
      onParamsChange({ search: searchTerm, offset: 0 });
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm, onParamsChange, isFirstRender]);

  const toggleSort = (key: string) => {
    if (sortBy === key) {
      onParamsChange({ sortOrder: sortOrder === "asc" ? "desc" : "asc" });
    } else {
      onParamsChange({ sortBy: key, sortOrder: "asc" });
    }
  };

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="space-y-4">
      {/* Search & Actions */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg flex items-center justify-center pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="input-base w-full pl-12 pr-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="text-caption text-muted-foreground font-medium">
          Showing {offset + 1} to {Math.min(offset + limit, total)} of {total}{" "}
          results
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl bg-card border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-small">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                {columns.map((col, idx) => {
                  const sortKey =
                    col.sortKey ||
                    (typeof col.accessor === "string" ? col.accessor : "");
                  return (
                    <th
                      key={idx}
                      className={clsx(
                        "p-4 text-left font-semibold text-muted-foreground",
                        col.sortable &&
                          "cursor-pointer hover:text-foreground transition-colors",
                      )}
                      onClick={() =>
                        col.sortable && sortKey && toggleSort(sortKey)
                      }
                    >
                      <div className="flex items-center gap-1">
                        {col.header}
                        {col.sortable && (
                          <span className="material-symbols-outlined text-sm">
                            {sortBy === sortKey
                              ? sortOrder === "asc"
                                ? "arrow_upward"
                                : "arrow_downward"
                              : "unfold_more"}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {columns.map((_, j) => (
                      <td key={j} className="p-4">
                        <div className="h-4 bg-muted rounded w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="p-12 text-center text-muted-foreground"
                  >
                    No results found matching your criteria.
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={clsx(
                      "transition-colors",
                      onRowClick ? "cursor-pointer hover:bg-muted/30" : "",
                    )}
                  >
                    {columns.map((col, idx) => {
                      const content =
                        typeof col.accessor === "function"
                          ? col.accessor(item)
                          : (item[col.accessor] as React.ReactNode);
                      return (
                        <td key={idx} className="p-4">
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {useStandardPager ? (
        <Pager
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page: number) =>
            onParamsChange({ offset: (page - 1) * limit })
          }
          loading={loading}
        />
      ) : (
        totalPages > 1 && (
          <div className="p-4 bg-muted/20 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1 || loading}
                onClick={() =>
                  onParamsChange({ offset: Math.max(0, offset - limit) })
                }
                className="p-2 rounded-lg hover:bg-muted disabled:opacity-50 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">
                  chevron_left
                </span>
              </button>
              <div className="text-caption font-bold px-3">
                Page {currentPage} of {totalPages}
              </div>
              <button
                disabled={currentPage === totalPages || loading}
                onClick={() => onParamsChange({ offset: offset + limit })}
                className="p-2 rounded-lg hover:bg-muted disabled:opacity-50 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">
                  chevron_right
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-caption text-muted-foreground">
              Rows per page:
              <select
                value={limit}
                onChange={(e) =>
                  onParamsChange({ limit: parseInt(e.target.value), offset: 0 })
                }
                className="bg-transparent font-bold focus:outline-none"
              >
                {[10, 20, 50, 100].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )
      )}
    </div>
  );
}
