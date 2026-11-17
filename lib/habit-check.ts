import { HABIT_QUESTIONS } from '../constants';
export const HABIT_IDS = ['fiber-variety', 'fluid-intake', 'bathroom-routine'] as const;
export type HabitId = typeof HABIT_IDS[number];
export type HabitAnswers = Partial<Record<HabitId, number>>;
export function habitResult(answers: HabitAnswers) {
  if (!HABIT_IDS.every(id => Number.isInteger(answers[id]) && answers[id]! >= 0 && answers[id]! <= 2)) return null;
  const focus = HABIT_IDS.reduce((chosen, id) => answers[id]! < answers[chosen]! ? id : chosen);
  const consistent = HABIT_IDS.every(id => answers[id] === 2);
  const question = HABIT_QUESTIONS.find(item => item.id === focus)!;
  const planner = consistent || focus === 'bathroom-routine';
  return {
    focus: consistent ? 'consistency' : focus,
    title: consistent ? 'Keep what works. Make room for an ordinary busy day.' : focus === 'fiber-variety' ? 'Start with one manageable food addition.' : focus === 'fluid-intake' ? 'Give your next drink a cue you already notice.' : 'Give one routine a realistic place in your day.',
    guidance: consistent ? 'Your answers describe a steady foundation. Pick one routine to maintain, and plan a smaller version for a busy day. A change in symptoms still deserves appropriate medical advice.' : question.options[answers[focus]!].guidance,
    guideHref: focus === 'bathroom-routine' || consistent ? '/routine-reset' : '/fiber-guide',
    guideLabel: focus === 'bathroom-routine' || consistent ? 'Explore the routine reset' : 'Explore the fiber guide',
    product: planner ? 'planner' : 'workbook',
    productTitle: planner ? 'The 30-Day Gut Routine Planner' : 'The 14-Day Gut Clarity Workbook',
    price: planner ? 30 : 25,
    productHref: planner ? '/workbooks#30-day-gut-routine-planner' : '/workbooks#14-day-gut-clarity-workbook',
    productReason: planner ? 'Use the weekly Plan, Fit, Practice and Review pages to choose one routine and a smaller fallback. 31-page printable US Letter PDF.' : 'Use short daily observation logs and an appointment-prep summary to organize what you notice. 26-page printable US Letter PDF.',
  } as const;
}
