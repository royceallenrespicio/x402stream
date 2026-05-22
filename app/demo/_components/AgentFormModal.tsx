'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Field,
  FieldLabel,
  FieldContent,
} from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Edit2, UserPlus, X } from 'lucide-react';
import { CustomAgent } from '@/types/orchestrator';
import vendorsData from '@/app/_data/vendors.json';

const VENDORS_MAP = vendorsData;

interface AgentFormModalProps {
  isOpen: boolean;
  editingAgent: CustomAgent | null;
  onClose: () => void;
  onSubmit: (agentData: {
    name: string;
    role: string;
    vendorSlug: string;
    prompt: string;
  }) => void;
}

export default function AgentFormModal({
  isOpen,
  editingAgent,
  onClose,
  onSubmit,
}: AgentFormModalProps) {
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formVendor, setFormVendor] = useState(VENDORS_MAP[0].slug);
  const [formPrompt, setFormPrompt] = useState('');



  useEffect(() => {
    if (isOpen) {
      if (editingAgent) {
        setFormName(editingAgent.name);
        setFormRole(editingAgent.role);
        setFormVendor(editingAgent.vendorSlug);
        setFormPrompt(editingAgent.prompt);
      } else {
        setFormName('');
        setFormRole('');
        setFormVendor(VENDORS_MAP[0].slug);
        setFormPrompt('');
      }
    }
  }, [editingAgent, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formRole.trim() || !formPrompt.trim()) return;

    onSubmit({
      name: formName,
      role: formRole,
      vendorSlug: formVendor,
      prompt: formPrompt,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="max-w-lg p-0 overflow-hidden border border-border bg-card rounded-xl">
        <DialogHeader className="pt-6 pb-4 px-6 border-b border-border bg-muted/20">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-foreground text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider flex-row">
              {editingAgent ? (
                <Edit2 className="h-4 w-4 text-amber-500" />
              ) : (
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              )}
              {editingAgent ? 'Edit Machine Agent' : 'Assemble New Machine Agent'}
            </DialogTitle>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground cursor-pointer pointer-events-auto p-1 rounded-md hover:bg-muted/40 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <DialogDescription className="text-[10px] text-muted-foreground mt-1 text-left">
            {editingAgent
              ? 'Modify the agent parameters and change associated APIs.'
              : 'Configure parameters and associate payment gates.'}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <ScrollArea className="max-h-[350px] pr-2">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <Field className="space-y-1">
                    <FieldLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                      Agent Identifier / Name
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        required
                        placeholder="e.g. MayaRemitter, puregoldLogistics"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="h-9 text-xs border-border bg-muted/50 focus:border-border text-foreground"
                      />
                    </FieldContent>
                  </Field>
                  <Field className="space-y-1">
                    <FieldLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                      Specialist Role Title
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        required
                        placeholder="e.g. Ledger Acquirer, Stock Auditing"
                        value={formRole}
                        onChange={(e) => setFormRole(e.target.value)}
                        className="h-9 text-xs border-border bg-muted/50 focus:border-border text-foreground"
                      />
                    </FieldContent>
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  <Field className="space-y-1">
                    <FieldLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                      Settle Enterprise Vendor
                    </FieldLabel>
                    <FieldContent>
                      <Select
                        value={formVendor}
                        onValueChange={(val) => setFormVendor(val || VENDORS_MAP[0].slug)}
                      >
                        <SelectTrigger className="w-full h-9 border border-border bg-muted/50 focus:border-border text-foreground rounded-md text-xs px-2.5 flex items-center justify-between">
                          <SelectValue placeholder="Select a vendor..." />
                        </SelectTrigger>
                        <SelectContent position="popper" className="w-[var(--radix-select-trigger-width)] bg-popover border border-border text-popover-foreground rounded-xl max-h-[300px] overflow-y-auto">
                          {Object.entries(
                            VENDORS_MAP.reduce((acc, v) => {
                              const cat = v.category || 'Other';
                              if (!acc[cat]) acc[cat] = [];
                              acc[cat].push(v);
                              return acc;
                            }, {} as Record<string, typeof VENDORS_MAP>)
                          ).map(([cat, items]) => (
                            <SelectGroup key={cat} className="p-1">
                              <SelectLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider px-2.5 py-1 bg-muted/30 rounded-md mb-1 block select-none pointer-events-none">
                                {cat}
                              </SelectLabel>
                              {items.map((v) => (
                                <SelectItem
                                  key={v.slug}
                                  value={v.slug}
                                  className="text-xs text-foreground/80 focus:bg-accent focus:text-accent-foreground rounded-lg cursor-pointer ml-1"
                                >
                                  {v.name} ({v.cost} ETH)
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          ))}
                        </SelectContent>
                      </Select>
                    </FieldContent>
                  </Field>
                </div>

                <Field className="space-y-1">
                  <FieldLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                    Core Prompt Instructions
                  </FieldLabel>
                  <FieldContent>
                    <Textarea
                      required
                      placeholder="Specify the precise actions the agent must perform..."
                      value={formPrompt}
                      onChange={(e) => setFormPrompt(e.target.value)}
                      className="min-h-[100px] text-xs border-border bg-muted/50 focus:border-border text-foreground resize-none py-2.5 px-3.5 rounded-xl font-sans leading-relaxed"
                    />
                  </FieldContent>
                </Field>
              </div>
            </ScrollArea>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                className="h-8.5 border-border hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold px-4 cursor-pointer pointer-events-auto"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-8.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold px-4 pointer-events-auto cursor-pointer"
              >
                {editingAgent ? 'Save Changes' : 'Add to Assembly'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
