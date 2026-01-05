import { ReactNode } from 'react';
import { useHelp } from '../contexts/HelpContext';

type ExplainProps = {
  beginner: ReactNode;
  advanced: ReactNode;
  className?: string;
};

export function Explain({ beginner, advanced, className }: ExplainProps) {
  const { level } = useHelp();
  return <div className={className}>{level === 'beginner' ? beginner : advanced}</div>;
}
