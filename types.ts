/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HabitQuestion {
  id: string;
  question: string;
  whyItMatters: string;
  options: {
    label: string;
    description: string;
    guidance: string;
  }[];
}

export interface FiberFood {
  name: string;
  category: 'soluble' | 'insoluble' | 'both';
  serving: string;
  fiberGrams: number;
  highlight: string;
}

export interface MealUpgradeExample {
  id: string;
  mealName: string;
  baseMeal: string;
  baseFiber: number;
  upgradeAddition: string;
  addedFiber: number;
  totalFiber: number;
  hydrationTip: string;
}

export interface DailyHabitItem {
  id: string;
  timeWindow: string;
  title: string;
  description: string;
  whyItHelps: string;
}

export interface MythFactItem {
  id: string;
  myth: string;
  fact: string;
  explanation: string;
  scienceNote: string;
}

export interface WarningSign {
  id: string;
  severity: 'urgent' | 'routine';
  symptom: string;
  reason: string;
  actionRequired: string;
}
