"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PaginationInfo,
  getPaginationRange,
  getPageInfo,
  canGoNext,
  canGoPrev,
} from "@/lib/pagination";
import { cn } from "@/lib/utils";

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
  showFirstLast?: boolean;
  className?: string;
}

export function Pagination({
  pagination,
  onPageChange,
  showInfo = true,
  showFirstLast = true,
  className,
}: PaginationProps) {
  const { page, totalPages } = pagination;
  const range = getPaginationRange(page, totalPages);

  if (totalPages <= 1) {
    return showInfo ? (
      <div className={cn("text-sm text-muted-foreground", className)}>
        {getPageInfo(pagination)}
      </div>
    ) : null;
  }

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4",
        className
      )}
    >
      {showInfo && (
        <div className="text-sm text-muted-foreground order-2 sm:order-1">
          {getPageInfo(pagination)}
        </div>
      )}

      <div className="flex items-center gap-1 order-1 sm:order-2">
        {showFirstLast && (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(1)}
            disabled={!canGoPrev(pagination)}
          >
            <ChevronsLeft className="h-4 w-4" />
            <span className="sr-only">第一頁</span>
          </Button>
        )}

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page - 1)}
          disabled={!canGoPrev(pagination)}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">上一頁</span>
        </Button>

        <div className="flex items-center gap-1">
          {range.map((item, index) =>
            item === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                ...
              </span>
            ) : (
              <Button
                key={item}
                variant={item === page ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(item)}
              >
                {item}
              </Button>
            )
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page + 1)}
          disabled={!canGoNext(pagination)}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">下一頁</span>
        </Button>

        {showFirstLast && (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(totalPages)}
            disabled={!canGoNext(pagination)}
          >
            <ChevronsRight className="h-4 w-4" />
            <span className="sr-only">最後一頁</span>
          </Button>
        )}
      </div>
    </div>
  );
}

// Simple pagination for mobile or compact views
interface SimplePaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  className?: string;
}

export function SimplePagination({
  pagination,
  onPageChange,
  className,
}: SimplePaginationProps) {
  const { page, totalPages } = pagination;

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={cn("flex items-center justify-center gap-4", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={!canGoPrev(pagination)}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        上一頁
      </Button>

      <span className="text-sm text-muted-foreground">
        {page} / {totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={!canGoNext(pagination)}
      >
        下一頁
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
