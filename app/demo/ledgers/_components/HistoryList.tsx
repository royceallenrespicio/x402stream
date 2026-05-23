'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { History, Coins, Users, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { SettlementHistoryItem } from '@/types/orchestrator';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface HistoryListProps {
  settlementHistory: SettlementHistoryItem[];
  selectedId: string | null;
  setSelectedId: (id: string) => void;
  deleteItem: (id: string, e: React.MouseEvent) => void;
}

export default function HistoryList({
  settlementHistory,
  selectedId,
  setSelectedId,
  deleteItem,
}: HistoryListProps) {
  const [currentPage, setCurrentPage] = React.useState(1);

  // Deduplicate items defensively to guarantee unique React keys
  const uniqueHistory = React.useMemo(() => {
    return Array.from(
      new Map(settlementHistory.map((item) => [item.id, item])).values()
    );
  }, [settlementHistory]);

  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(uniqueHistory.length / ITEMS_PER_PAGE);

  // Auto-clamp page if it becomes invalid (e.g. after deletion)
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [uniqueHistory.length, totalPages, currentPage]);

  if (settlementHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <History className="h-9 w-9 text-muted-foreground/60 mb-3" />
        <span className="text-sm font-bold text-muted-foreground">Ledger History Empty</span>
        <p className="text-xs text-muted-foreground/80 mt-1 max-w-xs">
          Completed multi-agent and single-agent pipelines will automatically log here with detailed metrics.
        </p>
      </div>
    );
  }

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedHistory = uniqueHistory.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {paginatedHistory.map((item) => {
          const isSelected = selectedId === item.id;

          return (
            <motion.div
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col gap-2.5 relative group pointer-events-auto ${
                isSelected
                  ? 'border-primary bg-accent/60'
                  : 'border-border bg-card/40 hover:border-border/80 hover:bg-accent/40'
              }`}
              layout
            >
              <div className="flex justify-between items-start gap-2.5">
                <div className="space-y-1 min-w-0 flex-1">
                  <span className="text-[9px] font-mono text-muted-foreground/60 block">{item.timestamp}</span>
                  <span className="text-xs font-semibold text-foreground line-clamp-1 block pr-4">
                    {item.goal}
                  </span>
                </div>
                <button
                  onClick={(e) => deleteItem(item.id, e)}
                  className="text-muted-foreground/60 hover:text-destructive p-1 rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all pointer-events-auto cursor-pointer"
                  title="Delete Log Entry"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-3 pt-1 border-t border-border/40">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Coins className="h-3 w-3 text-muted-foreground/80" />
                  <span className="font-mono">{item.totalCost} ETH</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Users className="h-3 w-3 text-muted-foreground/80" />
                  <span>{item.agentsCount} agents</span>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[8px] font-bold px-1.5 py-0 rounded-md shrink-0 uppercase tracking-wide ${
                    item.realOnChain
                      ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
                      : 'border-border bg-muted/40 text-muted-foreground'
                  }`}
                >
                  {item.realOnChain ? 'Morph L2' : 'Simulation'}
                </Badge>
              </div>
            </motion.div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <Pagination className="pt-2">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
                className={currentPage === 1 ? 'pointer-events-none opacity-45' : 'cursor-pointer'}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  isActive={page === currentPage}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(page);
                  }}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                }}
                className={currentPage === totalPages ? 'pointer-events-none opacity-45' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
