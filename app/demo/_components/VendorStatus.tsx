'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ShoppingBag, ShieldAlert, Check } from 'lucide-react';
import { motion } from 'motion/react';
import vendorsData from '@/app/_data/vendors.json';

interface VendorInfo {
  slug: string;
  name: string;
  category: string;
  role: string;
  cost: string;
  recipient: string;
  description: string;
}

export default function VendorStatus({ activeSlug }: { activeSlug?: string }) {
  // Dynamically extract categories
  const categories = React.useMemo(() => {
    const list = Array.from(new Set(vendorsData.map((v) => v.category)));
    return list.filter(Boolean);
  }, []);

  // Default to first category
  const [activeTab, setActiveTab] = useState(categories[0] || '');

  // Auto-switch tab to the category of the activeSlug when it changes
  useEffect(() => {
    if (activeSlug) {
      const activeVendor = vendorsData.find((v) => v.slug === activeSlug);
      if (activeVendor && activeVendor.category) {
        setActiveTab(activeVendor.category);
      }
    }
  }, [activeSlug]);

  return (
    <Card className="border border-border bg-card/65 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-foreground font-bold text-base">x402 Compliant Mock Vendors</CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
                Dynamic ecosystem of enterprise APIs demanding cryptographic payments.
              </CardDescription>
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground/80 font-mono self-end sm:self-center bg-muted/30 px-2.5 py-1 rounded-md border border-border">
            TOTAL VENDORS: <span className="font-bold text-foreground">{vendorsData.length}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="w-full overflow-x-auto scrollbar-none pb-1">
            <TabsList className="flex w-max bg-muted p-1 rounded-full gap-1">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="text-xs px-3.5 py-1.5 transition-all duration-200 cursor-pointer"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {categories.map((category) => {
            const filteredVendors = vendorsData.filter((v) => v.category === category);
            return (
              <TabsContent key={category} value={category} className="mt-4 outline-none">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5"
                >
                  {filteredVendors.map((vendor) => {
                    const isActive = activeSlug === vendor.slug;
                    return (
                      <motion.div
                        key={vendor.slug}
                        whileHover={{ scale: 1.01, y: -2 }}
                        className={`relative rounded-xl border p-4 transition-all duration-350 flex flex-col justify-between h-full gap-3 ${
                          isActive
                            ? 'border-foreground bg-muted/70 shadow-sm ring-1 ring-foreground/10'
                            : 'border-border bg-muted/10 hover:border-muted-foreground/35 hover:bg-muted/20'
                        }`}
                      >
                        {/* Visual glow ring for active node */}
                        {isActive && (
                          <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-primary"></span>
                          </span>
                        )}

                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-foreground text-xs leading-snug line-clamp-1" title={vendor.name}>
                              {vendor.name}
                            </h4>
                            <Badge variant="outline" className="shrink-0 border-border bg-secondary text-secondary-foreground text-[9px] font-semibold">
                              {vendor.cost} ETH
                            </Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground font-semibold mt-0.5 tracking-wide uppercase">{vendor.role}</p>
                          <p className="text-[10px] text-muted-foreground/80 leading-relaxed mt-2.5 line-clamp-2">
                            {vendor.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-border/60 flex flex-col gap-1 text-[9px] font-mono text-muted-foreground/75">
                          <div className="flex items-center justify-between">
                            <span>x402 ROUTE:</span>
                            {isActive ? (
                              <span className="text-emerald-500 font-bold flex items-center gap-0.5">
                                <Check className="h-2.5 w-2.5" /> ACTIVE CALL
                              </span>
                            ) : (
                              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                                <ShieldAlert className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" /> SECURE
                              </span>
                            )}
                          </div>
                          <div className="truncate" title={`Recipient: ${vendor.recipient}`}>
                            TO: {vendor.recipient.slice(0, 8)}...{vendor.recipient.slice(-6)}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}
