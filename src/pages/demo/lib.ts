import type { DecisionTrace, Individual } from '@/shared/api/xenochoice/types';

export type Action = 'STORE' | 'TRANSFER' | 'GROW' | 'DIVIDE';

export type Frame = {
  title: string;
  context: string;
  before: Individual;
  after: Individual;
  decision: DecisionTrace;
  explanation: {
    weights: number[];
    terms: Partial<Record<Action, number[]>>;
    blocked: Partial<Record<Action, string>>;
  };
  population: number;
};

export type Episode = { seed: number; frames: Frame[] };

export const ACTIONS: Action[] = ['STORE', 'TRANSFER', 'GROW', 'DIVIDE'];

export const ACTION_LABELS: Record<Action, string> = {
  STORE: 'Сохранить',
  TRANSFER: 'Передать',
  GROW: 'Расти',
  DIVIDE: 'Разделиться',
};

export const ACTION_VERBS: Record<Action, string> = {
  STORE: 'Сохраняет ресурс',
  TRANSFER: 'Помогает соседу',
  GROW: 'Наращивает структуру',
  DIVIDE: 'Создаёт потомка',
};

export const SCORE_TERMS = [
  'Запас',
  'Дефицит',
  'Помощь',
  'Размножение',
  'Потери',
] as const;

export const STAGES = ['Наблюдает', 'Сравнивает', 'Выбирает'] as const;

export const CHAPTER_SECONDS = 18;

export const formatNum = (n: number, digits = 2) => n.toFixed(digits);

export const formatSigned = (n: number) =>
  `${n >= 0 ? '+' : '−'}${Math.abs(n).toFixed(5)}`;

export const narrationForStage = (frame: Frame, stage: number): string => {
  const { decision: d, before: b } = frame;
  if (stage === 0) {
    return `${frame.context} Особь ${b.id} принимает решение с энергией ${formatNum(b.energy)} и структурой ${formatNum(b.biomass)}. Память ${formatNum(b.memory, 3)} влияет на приоритеты. Недоступные действия исключаются до выбора.`;
  }
  if (stage === 1) {
    const contributions =
      frame.explanation.terms[d.selectedAction as Action] ?? [];
    const strongest = contributions.reduce(
      (best, value, i) => (value > (contributions[best] ?? 0) ? i : best),
      0,
    );
    return (
      `Для ${d.selectedAction} наибольший положительный вклад даёт «${SCORE_TERMS[strongest]}»: ${formatSigned(contributions[strongest] ?? 0)}. ` +
      `Итог: ${formatNum(d.chosenScore, 5)}. Для переключения улучшение относительно STORE должно быть не меньше ${formatNum(b.genome.hThreshold, 3)}.`
    );
  }
  if (d.selectedAction === 'STORE') {
    return 'Ни один доступный вариант не дал достаточного улучшения относительно сохранения. Машина остаётся на STORE: высокий балл сам по себе ещё не гарантирует переключение.';
  }
  return `${ACTION_LABELS[d.selectedAction as Action]} — лучший доступный вариант, прошедший порог переключения. Преимущество перед STORE: ${formatNum(d.chosenScore - d.scores.STORE, 5)}, при пороге h = ${formatNum(b.genome.hThreshold, 5)}.${d.selectedTarget ? ` Получатель: ${d.selectedTarget}.` : ''}`;
};
