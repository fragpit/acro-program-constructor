import type { BonusCategory, Manoeuvre, Run } from '../rules/types';

export const BONUS_LIMITS: Record<BonusCategory, number> = {
  twisted: 5,
  reversed: 3,
  flipped: 2,
};

export type BonusUsage = Record<BonusCategory, number>;

/**
 * Count of tricks per bonus category in a run (FAI 3.5 limits: 5/3/2).
 * A trick contributes at most once per category, even if multiple selected
 * bonuses map to the same category.
 */
export function runBonusUsage(
  run: Run,
  manoeuvres: Record<string, Manoeuvre>,
): BonusUsage {
  const usage: BonusUsage = { twisted: 0, reversed: 0, flipped: 0 };
  for (const t of run.tricks) {
    const m = manoeuvres[t.manoeuvreId];
    if (!m) continue;
    const cats = new Set<BonusCategory>();
    for (const b of t.selectedBonuses) {
      const cat = m.availableBonuses.find((ab) => ab.id === b)?.countsAs;
      if (cat) cats.add(cat);
    }
    for (const c of cats) usage[c]++;
  }
  return usage;
}
