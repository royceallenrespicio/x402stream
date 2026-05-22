'use client';

import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Edit2, Trash2, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { CustomAgent } from '@/types/orchestrator';
import vendorsData from '@/app/_data/vendors.json';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const VENDORS_MAP = vendorsData;

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

interface AgentWorkspaceProps {
  customAgents: CustomAgent[];
  running: boolean;
  loadPresets: () => void;
  runSingleAgent: (agent: CustomAgent) => Promise<void>;
  handleStartEdit: (agent: CustomAgent) => void;
  deleteCustomAgent: (id: string) => void;
  triggerAddForm: () => void;
}

export default function AgentWorkspace({
  customAgents,
  running,
  loadPresets,
  runSingleAgent,
  handleStartEdit,
  deleteCustomAgent,
  triggerAddForm,
}: AgentWorkspaceProps) {
  const [currentPage, setCurrentPage] = React.useState(1);

  const CARDS_PER_PAGE = 4;
  const showCreateCard = customAgents.length < 10;
  const totalItemsCount = customAgents.length + (showCreateCard ? 1 : 0);
  const totalPages = Math.ceil(totalItemsCount / CARDS_PER_PAGE);

  // Auto-clamp page if it becomes invalid (e.g. after deletion)
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [customAgents.length, totalPages, currentPage]);

  const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
  const paginatedAgents = customAgents.slice(startIndex, startIndex + CARDS_PER_PAGE);
  const renderCreateCard = showCreateCard && (currentPage === totalPages);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-muted-foreground tracking-wider uppercase flex items-center gap-1.5">
          Agent Assembly Workspace
          <Badge className="bg-secondary text-secondary-foreground border-border text-[10px]">
            {customAgents.length} / 10
          </Badge>
        </h2>

        {customAgents.length === 0 && (
          <button
            onClick={loadPresets}
            disabled={running}
            className="text-[10px] font-bold text-muted-foreground hover:text-foreground pointer-events-auto cursor-pointer transition-colors disabled:opacity-40"
          >
            Load Default Presets
          </button>
        )}
      </div>

      {/* Agents Assembly Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        {paginatedAgents.map((agent) => {
          const mappedVendor = VENDORS_MAP.find((v) => v.slug === agent.vendorSlug);

          return (
            <motion.div key={agent.id} variants={staggerItem} layout>
              <Card className="border border-border/60 bg-card hover:border-border transition-all duration-300 py-0">
                <CardContent className="p-4 flex flex-col justify-between h-full min-h-[170px] gap-3.5">
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm font-extrabold text-foreground truncate max-w-[180px] sm:max-w-[280px] md:max-w-[200px] lg:max-w-[280px] xl:max-w-[340px]">
                          {agent.name}
                        </h3>
                        <p className="text-xs text-muted-foreground font-semibold mt-0.5 truncate max-w-[180px] sm:max-w-[280px] md:max-w-[200px] lg:max-w-[280px] xl:max-w-[340px]">
                          {agent.role}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-border/40 bg-muted/40 text-foreground/80 text-[10px] font-mono whitespace-nowrap"
                      >
                        {mappedVendor?.cost || '0.00'} ETH
                      </Badge>
                    </div>
                    <p className="text-xs text-foreground/95 leading-relaxed line-clamp-3 italic font-medium">
                      &ldquo;{agent.prompt}&rdquo;
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-muted-foreground font-mono">
                        MAPPED VENDOR: <strong className="text-foreground/85 font-bold">{mappedVendor?.name || 'Unknown'}</strong>
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => runSingleAgent(agent)}
                        className="text-muted-foreground hover:text-emerald-500 transition-colors pointer-events-auto cursor-pointer p-0.5 rounded-md hover:bg-muted/30"
                        title="Run Agent Individually"
                      >
                        <Play className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleStartEdit(agent)}
                        disabled={running}
                        className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 pointer-events-auto cursor-pointer p-0.5 rounded-md hover:bg-muted/30"
                        title="Edit Agent Parameters"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => deleteCustomAgent(agent.id)}
                        disabled={running}
                        className="text-muted-foreground hover:text-rose-500 transition-colors disabled:opacity-30 pointer-events-auto cursor-pointer p-0.5 rounded-md hover:bg-muted/30"
                        title="Delete Agent"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {/* Create Custom Agent card toggler */}
        {renderCreateCard && (
          <motion.button
            variants={staggerItem}
            onClick={triggerAddForm}
            disabled={running}
            className="flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-primary/50 bg-muted/10 hover:bg-muted/20 rounded-xl py-6 min-h-[170px] text-center transition-all disabled:opacity-40 group pointer-events-auto cursor-pointer w-full"
          >
            <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/50 border border-border transition-colors mb-2">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-foreground/90 group-hover:text-foreground transition-colors">Create Custom Agent</span>
            <span className="text-[10px] text-muted-foreground mt-1 group-hover:text-muted-foreground/80 transition-colors">Add details, roles and vendor mappings</span>
          </motion.button>
        )}
      </motion.div>

      {/* Workspace Pagination Controls */}
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
