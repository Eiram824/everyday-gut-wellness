/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HabitQuestion, FiberFood, MealUpgradeExample, DailyHabitItem, MythFactItem, WarningSign } from './types';

export const HABIT_QUESTIONS: HabitQuestion[] = [
  {
    id: 'fiber-variety',
    question: 'Are you getting fiber from a variety of foods?',
    whyItMatters: 'Different plant fibers perform distinct physiological functions. Soluble fiber dissolves or disperses in water and can form a gel, which can help support softer stool consistency, while insoluble fiber generally does not dissolve and can help add bulk to stool. Because effects vary by fiber type and food source, eating a variety of whole foods supports balanced digestive function.',
    options: [
      {
        label: 'Mostly processed or refined grains',
        description: 'White bread, standard pasta, quick meals with few whole plants.',
        guidance: 'Start small: Introduce one serving of rolled oats, canned rinsed beans, or a whole pear with its skin. Increasing fiber gradually helps limit temporary gas or bloating, so pace your additions over 1–2 weeks alongside adequate water.'
      },
      {
        label: 'Some fruits and vegetables, but irregular',
        description: 'You eat produce when convenient, but whole legumes and seeds are rare.',
        guidance: 'Aim for steady variety: Add 1–2 tablespoons of chia or ground flax seeds to your morning cereal, or keep frozen berries and canned beans on hand for easy weekday meals.'
      },
      {
        label: 'Diverse whole grains, legumes, fruits, and greens',
        description: 'Your meals regularly feature whole plants, beans, seeds, and root vegetables.',
        guidance: 'Great dietary diversity! Ensure your fluid intake matches your fiber intake so that fiber has the moisture it needs to work effectively.'
      }
    ]
  },
  {
    id: 'fluid-intake',
    question: 'Are you drinking enough fluids for your needs?',
    whyItMatters: 'Your colon absorbs water as digestive contents travel through it. When fluid intake is low, the colon reabsorbs more moisture from the stool, which can contribute to firmer or harder stool. Adequate fluid intake is essential to help fiber work comfortably.',
    options: [
      {
        label: 'Rarely drink plain water; mostly coffee or soda',
        description: 'Under 3–4 glasses of hydrating liquids per day; often feel dry mouth.',
        guidance: 'Place a glass of room-temperature water on your bedside table or workspace. Drinking a glass upon waking gives your body an immediate hydration baseline before morning beverages.'
      },
      {
        label: 'Moderate fluids, but easily forget during busy hours',
        description: 'Around 4–6 cups daily; hydration drops on hectic workdays or travel.',
        guidance: 'Anchor fluid intake to everyday cues: enjoy a glass with each meal, one mid-morning, and one mid-afternoon. Water, herbal teas, and clear broths all contribute to daily fluid balance.'
      },
      {
        label: 'Consistent hydration throughout the entire day',
        description: 'Pale straw-colored urine; steady intake of water, broths, or herbal teas.',
        guidance: 'Healthy routine! Adjust your fluid intake during hot weather, dry indoor environments, or days with increased physical activity.'
      }
    ]
  },
  {
    id: 'bathroom-routine',
    question: 'Do you have time for movement and an unhurried bathroom routine?',
    whyItMatters: 'Physical movement supports colon motility (the natural contractions that move waste along). Equally helpful is respecting the gastrocolic reflex—a natural digestive response often triggered after eating, especially after breakfast. Repeatedly rushing or delaying the urge can make bowel movements less regular over time.',
    options: [
      {
        label: 'Constantly rushed mornings; frequently postpone the urge',
        description: 'You delay using the restroom due to commutes, meetings, or busy mornings.',
        guidance: 'Try waking 10–15 minutes earlier to sit quietly with breakfast or a warm beverage. When you notice the urge, give yourself unhurried time rather than postponing it.'
      },
      {
        label: 'Desk-bound most of the day with sporadic movement',
        description: 'Sedentary work hours; physical activity is limited during weekdays.',
        guidance: 'Incorporate short walking breaks after meals. Gentle physical activity naturally supports abdominal circulation and digestive transit.'
      },
      {
        label: 'Regular physical activity and a dedicated morning window',
        description: 'You give yourself calm, unpressured time in the restroom and stay active.',
        guidance: 'You have a strong habit foundation! Consider elevating your feet slightly on a small footstool to support a more relaxed pelvic floor posture.'
      }
    ]
  }
];

export const FIBER_FOODS: FiberFood[] = [
  { name: 'Rolled / Steel-Cut Oats', category: 'both', serving: '1 cup cooked (81g)', fiberGrams: 4.0, highlight: 'Contains beta-glucans, a soluble fiber that dissolves in water and can form a viscous gel.' },
  { name: 'Black Beans / Lentils', category: 'both', serving: '1/2 cup cooked (86g)', fiberGrams: 7.5, highlight: 'Provides both soluble and insoluble fiber components from whole legumes.' },
  { name: 'Fresh Bartlett / Bosc Pear', category: 'both', serving: '1 medium fruit with skin', fiberGrams: 5.5, highlight: 'Contains a natural blend of soluble and insoluble fibers along with fruit moisture.' },
  { name: 'Raspberries / Blackberries', category: 'both', serving: '1 cup fresh (123g)', fiberGrams: 8.0, highlight: 'Provides a rich mix of plant fibers, including insoluble seed fiber.' },
  { name: 'Chia Seeds / Ground Flax', category: 'both', serving: '2 tablespoons (28g)', fiberGrams: 7.0, highlight: 'Soluble fiber that disperses in liquid and can form a gel-like consistency.' },
  { name: 'Steamed Broccoli / Greens', category: 'insoluble', serving: '1 cup cooked (156g)', fiberGrams: 5.1, highlight: 'Contains insoluble vegetable fiber that can help add bulk to stool.' }
];

export const MEAL_UPGRADE_EXAMPLES: MealUpgradeExample[] = [
  {
    id: 'breakfast',
    mealName: 'Morning Breakfast Bowl',
    baseMeal: 'Plain Greek yogurt with honey',
    baseFiber: 0,
    upgradeAddition: '+ 1/2 cup fresh raspberries and 1 tbsp ground flaxseeds',
    addedFiber: 6.5,
    totalFiber: 6.5,
    hydrationTip: 'Enjoy alongside an 8 oz glass of water or herbal tea; adequate fluids help fiber work effectively.'
  },
  {
    id: 'lunch',
    mealName: 'Midday Grain or Salad Bowl',
    baseMeal: 'Grilled chicken over white rice',
    baseFiber: 1.0,
    upgradeAddition: '+ 1/2 cup warm black beans and roasted carrots',
    addedFiber: 8.0,
    totalFiber: 9.0,
    hydrationTip: 'Sip water steadily across your afternoon rather than drinking large amounts all at once.'
  },
  {
    id: 'snack',
    mealName: 'Afternoon Energy Snack',
    baseMeal: 'Standard granola bar or crackers',
    baseFiber: 1.5,
    upgradeAddition: '+ 1 crisp unpeeled pear and a small handful of raw almonds',
    addedFiber: 6.5,
    totalFiber: 8.0,
    hydrationTip: 'Pair fruit and nuts with a glass of fresh water to support comfortable digestion.'
  },
  {
    id: 'dinner',
    mealName: 'Comforting Evening Dinner',
    baseMeal: 'Pasta with marinara sauce',
    baseFiber: 2.5,
    upgradeAddition: '+ 1 cup steamed broccoli florets and 1/3 cup cooked brown lentils folded into the sauce',
    addedFiber: 7.5,
    totalFiber: 10.0,
    hydrationTip: 'Keep evening meals balanced and allow 2–3 hours before sleep for comfortable gastric emptying.'
  }
];

export const ROUTINE_CHECKLIST: DailyHabitItem[] = [
  {
    id: 'morning-fluid',
    timeWindow: 'Upon Waking (7:00 – 8:00 AM)',
    title: 'Morning Baseline Hydration',
    description: 'Drink a glass of room-temperature or lukewarm water before coffee or morning tasks.',
    whyItHelps: 'Rehydrates your body after overnight rest and gently awakens digestive processes.'
  },
  {
    id: 'unhurried-time',
    timeWindow: 'Post-Breakfast (8:00 – 9:00 AM)',
    title: 'Respect the Gastrocolic Reflex',
    description: 'Allow 10–15 unhurried minutes after your morning meal. Never strain; sit calmly if you feel the urge.',
    whyItHelps: 'Eating or warm liquids trigger natural colonic peristalsis. Rushing can suppress this natural window.'
  },
  {
    id: 'fiber-anchor',
    timeWindow: 'Lunchtime (12:00 – 1:30 PM)',
    title: 'Incorporate One High-Fiber Plant Anchor',
    description: 'Include beans, lentils, a whole grain, or a generous portion of colorful vegetables.',
    whyItHelps: 'Supplies steady fiber to help support normal stool bulk and nourishment for gut bacteria.'
  },
  {
    id: 'movement-break',
    timeWindow: 'Afternoon (2:00 – 4:00 PM)',
    title: '15-Minute Movement or Walking Pause',
    description: 'Step away from your desk for a brisk stroll, gentle stretching, or stair climbing.',
    whyItHelps: 'Physical mobility supports abdominal circulation and can help encourage natural bowel motility.'
  },
  {
    id: 'steady-fluids',
    timeWindow: 'Late Afternoon (4:00 – 6:00 PM)',
    title: 'Midday Fluid Refill',
    description: 'Sip an herbal tea (such as chamomile or peppermint) or fresh filtered water.',
    whyItHelps: 'Helps ensure that dietary fiber consumed during the day remains adequately hydrated.'
  },
  {
    id: 'gentle-evening',
    timeWindow: 'Evening (7:00 – 9:00 PM)',
    title: 'Mindful Evening Wind-Down & Ergonomics',
    description: 'Avoid very heavy late meals. When using the restroom, consider elevating feet slightly on a stool.',
    whyItHelps: 'Elevating the knees helps align the anorectal angle, supporting a more relaxed posture.'
  }
];

export const MYTH_FACT_ITEMS: MythFactItem[] = [
  {
    id: 'detox-myth',
    myth: 'Every digestive problem means your colon is toxic and you need a detox cleanse.',
    fact: 'Your body has natural waste-processing and elimination systems, and commercial detoxes or colon cleanses are not routinely necessary for general digestive wellness.',
    explanation: 'The human body is naturally equipped with organs—primarily the liver, kidneys, and digestive tract—that continuously filter, process, and eliminate metabolic waste. Commercial detox teas, intense flushes, and aggressive laxatives are not required for normal digestive function and can sometimes cause cramping, fluid loss, or electrolyte imbalances. At the same time, lifestyle choices are not a cure-all: ongoing or severe digestive symptoms should not be ignored and warrant evaluation by a qualified medical professional to identify any underlying causes.',
    scienceNote: 'Healthy human physiology continuously processes waste products through normal liver, kidney, and gastrointestinal functions without the need for commercial cleansing regimens.'
  },
  {
    id: 'fiber-overload-myth',
    myth: 'If fiber is helpful for digestion, adding as much fiber as possible right away is best.',
    fact: 'Increasing fiber too rapidly—especially without drinking enough fluids—can contribute to temporary gas, bloating, and abdominal discomfort.',
    explanation: 'Dietary fiber is broken down by resident gut bacteria through fermentation, producing gas as a normal byproduct. When fiber intake jumps suddenly, the digestive system and intestinal microbes may need time to adapt to the higher volume and fermentation activity. Increasing fiber gradually over days or weeks, paired with consistent fluid intake, helps minimize digestive discomfort while supporting bowel regularity.',
    scienceNote: 'Gradually introducing fiber in modest increments gives your gastrointestinal tract and resident microbes time to adapt comfortably.'
  },
  {
    id: 'supplement-replacement-myth',
    myth: 'A dietary supplement or pill can take the place of a balanced, whole-food diet.',
    fact: 'Supplements supply isolated nutrients or single fiber types, whereas whole plant foods deliver a diverse combination of fibers, fluids, and essential nutrients.',
    explanation: 'Targeted fiber supplements can be helpful additions for certain individuals when recommended by a healthcare provider, but they do not duplicate the nutritional complexity of whole foods. Fruits, vegetables, legumes, and whole grains naturally provide multiple forms of soluble and insoluble fiber alongside water, vitamins, and minerals that work together to support digestive wellness.',
    scienceNote: 'Whole foods remain the foundational source of dietary fiber and nourishment; supplements can serve as optional additions when appropriate, but not total substitutes.'
  }
];

export const WARNING_SIGNS: WarningSign[] = [
  {
    id: 'blood-stool',
    severity: 'urgent',
    symptom: 'Blood in Stool or Black, Tarry Stools',
    reason: 'May indicate bleeding in the upper or lower gastrointestinal tract.',
    actionRequired: 'Seek prompt medical evaluation from a physician or emergency provider immediately.'
  },
  {
    id: 'severe-pain',
    severity: 'urgent',
    symptom: 'Severe, Sudden, or Unbearable Abdominal Pain',
    reason: 'Could indicate acute surgical or medical conditions requiring immediate clinical assessment.',
    actionRequired: 'Requires immediate emergency medical evaluation, especially if the abdomen is rigid, swollen, or tender to light touch.'
  },
  {
    id: 'no-gas-stool',
    severity: 'urgent',
    symptom: 'Inability to Pass Gas Alongside Inability to Have a Bowel Movement',
    reason: 'Can be a warning sign of a mechanical bowel obstruction.',
    actionRequired: 'Seek urgent emergency medical care without delay.'
  },
  {
    id: 'vomiting-fluids',
    severity: 'urgent',
    symptom: 'Persistent Vomiting or Inability to Retain Fluids',
    reason: 'Can lead to rapid dehydration and electrolyte imbalances, signaling acute distress.',
    actionRequired: 'Consult an urgent care physician or emergency facility for prompt evaluation and rehydration.'
  },
  {
    id: 'persistent-change',
    severity: 'routine',
    symptom: 'Persistent Change in Bowel Habits Lasting More Than a Few Weeks',
    reason: 'An unexplained, lasting change in frequency, consistency, or stool caliber warrants diagnostic investigation.',
    actionRequired: 'Schedule a comprehensive consultation with a primary care doctor or gastroenterologist.'
  },
  {
    id: 'unexplained-weight-loss',
    severity: 'routine',
    symptom: 'Unintended Weight Loss, Unexplained Fatigue, or Persistent Low-Grade Fever',
    reason: 'Can indicate malabsorption, inflammatory conditions, or other medical issues requiring evaluation.',
    actionRequired: 'Contact your physician for routine clinical and laboratory evaluation.'
  }
];