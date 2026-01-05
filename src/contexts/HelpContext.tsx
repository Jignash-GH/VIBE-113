import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

type HelpLevel = 'beginner' | 'advanced';

type HelpContextValue = {
  level: HelpLevel;
  setLevel: (l: HelpLevel) => void;
};

const HelpContext = createContext<HelpContextValue | undefined>(undefined);

const STORAGE_KEY = 'helpLevel';

export function HelpProvider({ children }: { children: ReactNode }) {
  const [level, setLevel] = useState<HelpLevel>(() => {
    const v = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    return (v === 'advanced' || v === 'beginner') ? v : 'beginner';
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, level);
    } catch {}
  }, [level]);

  const value = useMemo(() => ({ level, setLevel }), [level]);

  return <HelpContext.Provider value={value}>{children}</HelpContext.Provider>;
}

export function useHelp() {
  const ctx = useContext(HelpContext);
  if (!ctx) throw new Error('useHelp must be used within HelpProvider');
  return ctx;
}
