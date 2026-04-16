import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  type ScoreDistribution,
  type QualityCorrection,
  DEFAULT_DISTRIBUTION,
  DEFAULT_QUALITY,
} from '../scoring/final-score';

interface ScoreSettingsState {
  distribution: ScoreDistribution;
  quality: QualityCorrection;
  setDistribution: (d: ScoreDistribution) => void;
  setQuality: (q: QualityCorrection) => void;
}

export const useScoreSettings = create<ScoreSettingsState>()(
  persist(
    (set) => ({
      distribution: { ...DEFAULT_DISTRIBUTION },
      quality: { ...DEFAULT_QUALITY },
      setDistribution: (d) => set({ distribution: d }),
      setQuality: (q) => set({ quality: q }),
    }),
    {
      name: 'arb_score_settings',
      partialize: (s) => ({
        distribution: s.distribution,
        quality: s.quality,
      }),
    },
  ),
);
