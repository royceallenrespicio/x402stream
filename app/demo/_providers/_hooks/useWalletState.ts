'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getAccountFromKey, getMorphBalance } from '@/lib/morph';

export function useWalletState(customRpcUrl?: string) {
  const [privateKey, setPrivateKeyInternal] = useState<string>('');
  const [mockBalance, setMockBalance] = useState<number>(1.50);
  const [realBalance, setRealBalance] = useState<string>('0.00');

  // Load from local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('x402stream_pk');
      const savedMock = localStorage.getItem('x402stream_mock_balance');
      if (savedKey) {
        setPrivateKeyInternal(savedKey);
      }
      if (savedMock) {
        const val = parseFloat(savedMock);
        if (val === 1000.00) {
          setMockBalance(1.50);
          localStorage.setItem('x402stream_mock_balance', '1.50');
        } else {
          setMockBalance(val);
        }
      } else {
        setMockBalance(1.50);
        localStorage.setItem('x402stream_mock_balance', '1.50');
      }
    }
  }, []);

  // Derive address from private key
  const realAddress = React.useMemo(() => {
    if (privateKey) {
      const account = getAccountFromKey(privateKey);
      return account ? account.address : '';
    }
    return '';
  }, [privateKey]);

  const setPrivateKey = (key: string) => {
    setPrivateKeyInternal(key);
    if (key) {
      localStorage.setItem('x402stream_pk', key);
    } else {
      localStorage.removeItem('x402stream_pk');
    }
  };

  const updateMockBalance = (val: number | ((prev: number) => number)) => {
    setMockBalance(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      localStorage.setItem('x402stream_mock_balance', next.toString());
      return next;
    });
  };

  const refreshRealBalance = useCallback(async () => {
    if (realAddress) {
      const bal = await getMorphBalance(realAddress, customRpcUrl);
      setRealBalance(bal);
    } else {
      setRealBalance('0.00');
    }
  }, [realAddress, customRpcUrl]);

  useEffect(() => {
    if (realAddress) {
      refreshRealBalance();
    }
  }, [realAddress, refreshRealBalance]);

  return {
    privateKey,
    setPrivateKey,
    mockBalance,
    setMockBalance: updateMockBalance,
    realBalance,
    realAddress,
    refreshRealBalance
  };
}
