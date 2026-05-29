'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';

interface SettingsHeaderProps {
  realAddress: string | null;
}

export default function SettingsHeader({ realAddress }: SettingsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border">
      <div>
        <h1 className="text-fluid-lg font-black tracking-tight text-foreground flex items-center gap-2">
          System Settings
        </h1>
        <p className="text-fluid-sm text-muted-foreground mt-1 max-w-xl">
          Configure secure EVM private keys, manage local sandboxed identity credentials, and adjust agent execution parameters.
        </p>
      </div>
    </div>
  );
}
