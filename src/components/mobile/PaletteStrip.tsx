import { useState } from 'react';
import { loadRecentTricks, pushRecentTrick } from '../../store/recent-tricks';
import TrickPicker from './TrickPicker';

interface Props {
  armedManoeuvreId: string | null;
  onArm: (id: string | null) => void;
}

export default function PaletteStrip({ armedManoeuvreId, onArm }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>(() => loadRecentTricks());

  function handlePick(id: string) {
    setRecent((prev) => pushRecentTrick(prev, id));
    onArm(id);
    setPickerOpen(false);
  }

  return (
    <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <div className="px-3 py-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="shrink-0 px-3 py-1.5 text-sm rounded-full border border-sky-500 bg-sky-500/10 text-sky-700 dark:text-sky-300 font-medium active:bg-sky-500/20"
        >
          + Add trick
        </button>
        <div className="flex-1" />
        {armedManoeuvreId && (
          <button
            type="button"
            onClick={() => onArm(null)}
            className="shrink-0 px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-300 hover:border-red-500 hover:text-red-500"
            aria-label="Cancel selection"
          >
            Cancel
          </button>
        )}
      </div>
      {armedManoeuvreId && (
        <div className="px-3 pb-2 text-[11px] text-sky-700 dark:text-sky-300">
          Tap an empty slot below to insert, or tap Cancel to drop the selection.
        </div>
      )}
      <TrickPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={handlePick}
        recent={recent}
      />
    </div>
  );
}
