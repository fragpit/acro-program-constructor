import { describe, it, expect } from 'vitest';
import { runBonusUsage, BONUS_LIMITS } from '../bonus-usage';
import { MANOEUVRES_BY_ID } from '../../data/manoeuvres';
import { placedTrick, run } from '../../rules/validators/__tests__/helpers';

describe('runBonusUsage', () => {
  it('returns zeros for an empty run', () => {
    expect(runBonusUsage(run(), MANOEUVRES_BY_ID)).toEqual({
      twisted: 0,
      reversed: 0,
      flipped: 0,
    });
  });

  it('counts selected bonus categories across tricks', () => {
    const r = run(
      placedTrick('wingovers', { selectedBonuses: ['twisted'] }),
      placedTrick('misty_to_helicopter', { selectedBonuses: ['reverse'] }),
      placedTrick('stall', { side: null, selectedBonuses: ['flip'] }),
    );
    expect(runBonusUsage(r, MANOEUVRES_BY_ID)).toEqual({
      twisted: 1,
      reversed: 1,
      flipped: 1,
    });
  });

  it('counts a trick at most once per category', () => {
    const r = run(
      placedTrick('stall', { side: null, selectedBonuses: ['twisted', 'devil_twist'] }),
    );
    expect(runBonusUsage(r, MANOEUVRES_BY_ID).twisted).toBe(1);
  });

  it('counts even tricks that exceed the category limit', () => {
    const r = run(
      placedTrick('wingovers', { selectedBonuses: ['twisted'] }),
      placedTrick('wingovers', { selectedBonuses: ['twisted'] }),
      placedTrick('wingovers', { selectedBonuses: ['twisted'] }),
      placedTrick('wingovers', { selectedBonuses: ['twisted'] }),
      placedTrick('wingovers', { selectedBonuses: ['twisted'] }),
      placedTrick('wingovers', { selectedBonuses: ['twisted'] }),
    );
    expect(runBonusUsage(r, MANOEUVRES_BY_ID).twisted).toBe(6);
  });

  it('exports FAI 3.5 limits', () => {
    expect(BONUS_LIMITS).toEqual({ twisted: 5, reversed: 3, flipped: 2 });
  });
});
