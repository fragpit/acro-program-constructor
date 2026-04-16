import type { ScoreDistribution } from '../scoring/final-score';
import { DEFAULT_DISTRIBUTION } from '../scoring/final-score';

interface Props {
  distribution: ScoreDistribution;
  onChange: (d: ScoreDistribution) => void;
}

const STEP = 5;

const KEYS: { key: keyof ScoreDistribution; label: string }[] = [
  { key: 'technical', label: 'Technical' },
  { key: 'choreo', label: 'Choreo' },
  { key: 'landing', label: 'Landing' },
];

const btnCls =
  'w-7 h-7 inline-flex items-center justify-center ' +
  'text-slate-700 dark:text-slate-200 ' +
  'hover:bg-slate-100 dark:hover:bg-slate-700 ' +
  'disabled:opacity-30 disabled:hover:bg-transparent ' +
  'disabled:cursor-not-allowed select-none text-sm';

export default function DistributionEditor({
  distribution,
  onChange,
}: Props) {
  const total =
    distribution.technical +
    distribution.choreo +
    distribution.landing;
  const over = total > 100;
  const isDefault =
    distribution.technical === DEFAULT_DISTRIBUTION.technical &&
    distribution.choreo === DEFAULT_DISTRIBUTION.choreo &&
    distribution.landing === DEFAULT_DISTRIBUTION.landing;

  function step(key: keyof ScoreDistribution, delta: number) {
    const cur = distribution[key];
    const next = Math.max(0, Math.min(100, cur + delta));
    if (next !== cur) onChange({ ...distribution, [key]: next });
  }

  return (
    <div className="space-y-2">
      {KEYS.map(({ key, label }) => {
        const val = distribution[key];
        return (
          <div
            key={key}
            className="flex items-center justify-between gap-3"
          >
            <span className="text-slate-700 dark:text-slate-200 text-sm">
              {label}
            </span>
            <div
              className="inline-flex items-center rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden"
              role="group"
              aria-label={`${label} distribution`}
            >
              <button
                type="button"
                onClick={() => step(key, -STEP)}
                disabled={val <= 0}
                aria-label={`Decrease ${label}`}
                className={btnCls}
              >
                -
              </button>
              <span className="min-w-[2.5rem] px-1 text-center text-sm tabular-nums select-none">
                {val}%
              </span>
              <button
                type="button"
                onClick={() => step(key, STEP)}
                disabled={val >= 100}
                aria-label={`Increase ${label}`}
                className={btnCls}
              >
                +
              </button>
            </div>
          </div>
        );
      })}
      <div className="flex items-center justify-between text-xs">
        <span
          className={
            total === 100
              ? 'text-emerald-600 dark:text-emerald-400'
              : over
                ? 'text-red-600 dark:text-red-400 font-semibold'
                : 'text-amber-600 dark:text-amber-400'
          }
        >
          Total: {total}%
          {total !== 100 && (
            over ? ' (over 100!)' : ' (must be 100%)'
          )}
        </span>
        {!isDefault && (
          <button
            type="button"
            onClick={() => onChange({ ...DEFAULT_DISTRIBUTION })}
            className="text-xs text-slate-500 hover:text-sky-600 dark:hover:text-sky-400"
          >
            reset
          </button>
        )}
      </div>
    </div>
  );
}
