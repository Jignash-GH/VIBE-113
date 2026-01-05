import { useHelp } from '../contexts/HelpContext';
import { ToggleLeft, ToggleRight } from 'lucide-react';

export function HelpToggle() {
  const { level, setLevel } = useHelp();
  const isBeginner = level === 'beginner';

  return (
    <button
      onClick={() => setLevel(isBeginner ? 'advanced' : 'beginner')}
      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm text-gray-700"
      title={isBeginner ? 'Switch to Advanced explanations' : 'Switch to Beginner explanations'}
    >
      {isBeginner ? (
        <ToggleLeft className="w-4 h-4 text-blue-600" />
      ) : (
        <ToggleRight className="w-4 h-4 text-purple-600" />
      )}
      <span>{isBeginner ? 'Beginner' : 'Advanced'}</span>
    </button>
  );
}
