'use client';

import React, { useState } from 'react';
import { useOrchestrator } from '@/app/demo/_providers/OrchestratorProvider';
import { motion } from 'motion/react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Modular Components
import LedgerHeader from '@/app/demo/ledgers/_components/LedgerHeader';
import HistoryList from '@/app/demo/ledgers/_components/HistoryList';
import HistoryDetail from '@/app/demo/ledgers/_components/HistoryDetail';

const pageVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

export default function LedgersPage() {
  const {
    settlementHistory,
    setSettlementHistory,
  } = useOrchestrator();

  const isMobile = useIsMobile();

  // Archived settlements state
  const [selectedId, setSelectedId] = useState<string | null>(
    settlementHistory.length > 0 ? settlementHistory[0].id : null
  );

  const selectedItem = settlementHistory.find(
    (item) => item.id === (selectedId || (settlementHistory.length > 0 ? settlementHistory[0].id : ''))
  );

  const deleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextList = settlementHistory.filter((item) => item.id !== id);
    setSettlementHistory(nextList);
    localStorage.setItem('x402stream_history', JSON.stringify(nextList));
    if (selectedId === id) {
      setSelectedId(nextList.length > 0 ? nextList[0].id : null);
    }
  };

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const confirmClearAll = () => {
    setSettlementHistory([]);
    localStorage.removeItem('x402stream_history');
    setSelectedId(null);
    setIsConfirmOpen(false);
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Header */}
      <LedgerHeader />

      <div className="space-y-4">
        {/* Archived sub-header with clear button */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {settlementHistory.length} archived run{settlementHistory.length !== 1 ? 's' : ''}
          </p>
          {settlementHistory.length > 0 && (
            <Button
              onClick={() => setIsConfirmOpen(true)}
              variant="outline"
              className="border-destructive/30 hover:bg-destructive/10 text-destructive font-semibold text-xs h-8 px-3 shrink-0 pointer-events-auto cursor-pointer"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Clear All
            </Button>
          )}
        </div>

        {/* Master-detail layout */}
        {isMobile ? (
          <div className="flex flex-col gap-6">
            <HistoryList
              settlementHistory={settlementHistory}
              selectedId={selectedItem?.id || null}
              setSelectedId={setSelectedId}
              deleteItem={deleteItem}
            />
            {selectedItem && (
              <div className="space-y-4 pt-4 border-t border-border">
                <HistoryDetail selectedItem={selectedItem} />
              </div>
            )}
          </div>
        ) : (
          <ResizablePanelGroup
            orientation="horizontal"
            className="min-h-[560px] rounded-xl border border-border overflow-hidden bg-card shadow-sm"
          >
            <ResizablePanel
              defaultSize={35}
              minSize={20}
              maxSize={50}
              className="p-5 overflow-y-auto space-y-4 border-r border-border"
            >
              <HistoryList
                settlementHistory={settlementHistory}
                selectedId={selectedItem?.id || null}
                setSelectedId={setSelectedId}
                deleteItem={deleteItem}
              />
            </ResizablePanel>

            <ResizableHandle withHandle className="bg-border hover:bg-muted-foreground/30 w-[3px] transition-colors" />

            <ResizablePanel
              defaultSize={65}
              minSize={40}
              maxSize={80}
              className="p-5 flex flex-col justify-start overflow-y-auto"
            >
              <HistoryDetail selectedItem={selectedItem} />
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="max-w-md bg-card/90 backdrop-blur-xl border border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground font-heading font-bold text-lg flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Clear Settlement History
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm mt-2">
              Are you sure you want to permanently delete all archived transaction settlement logs? This action is irreversible and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              className="font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmClearAll}
              className="font-semibold cursor-pointer"
            >
              Confirm Clear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
