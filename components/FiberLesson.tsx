/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FIBER_FOODS, MEAL_UPGRADE_EXAMPLES } from '../constants';
import { Droplet, Info, Plus, Sparkles, CheckCircle2 } from 'lucide-react';

export const FiberLesson: React.FC = () => {
  const [selectedMealId, setSelectedMealId] = useState<string>('breakfast');
  const activeMeal = MEAL_UPGRADE_EXAMPLES.find((m) => m.id === selectedMealId) || MEAL_UPGRADE_EXAMPLES[0];

  return (
    <section id="fiber-lesson" className="scroll-mt-24 py-20 md:py-28 bg-[#F3EFE6] border-b border-[#E5DFD5]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="text-xs font-semibold tracking-widest uppercase text-[#B85D36]">
            Nutritional Physiology
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#14382B] tracking-tight [text-wrap:balance]">
            The Fiber Lesson: Soluble, Insoluble & Gradual Pace
          </h2>
          <p className="text-base sm:text-lg text-[#635F57] leading-relaxed">
            Most people hear general advice to "eat more fiber," but different fibers act in different ways in the digestive tract—and increasing intake gradually with adequate fluids is key to comfort.
          </p>
        </div>

        {/* Soluble vs Insoluble Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Soluble Fiber Card */}
          <div className="bg-white rounded-2xl border border-[#E5DFD5] p-6 sm:p-8 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#14382B]">Type 01</span>
                <h3 className="text-2xl font-serif font-bold text-[#14382B]">Soluble Fiber</h3>
              </div>
              <span className="text-xs bg-[#EAF1ED] text-[#14382B] font-semibold px-2.5 py-1 rounded">
                Can Form a Gel
              </span>
            </div>

            <p className="text-sm text-[#4A463F] leading-relaxed">
              Soluble fiber dissolves or disperses in water and can form a gel-like consistency in the digestive tract. Its physiological effects and fermentation behavior vary by fiber type and food source, with many soluble fibers helping to support softer stool consistency and steady digestion.
            </p>

            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#635F57]">Food Examples:</h4>
              <ul className="text-sm text-[#2C2A26] space-y-1.5 list-disc list-inside">
                <li><strong className="text-[#14382B]">Rolled & Steel-Cut Oats:</strong> contains beta-glucans, a soluble fiber that absorbs water</li>
                <li><strong className="text-[#14382B]">Black Beans & Lentils:</strong> legumes containing both soluble and insoluble components</li>
                <li><strong className="text-[#14382B]">Pears & Apples:</strong> rich in soluble fruit fibers such as pectins</li>
                <li><strong className="text-[#14382B]">Chia & Flax Seeds:</strong> disperse in liquid and can form a viscous gel</li>
              </ul>
            </div>

            <div className="bg-[#FBF9F5] p-3.5 rounded-xl border border-[#E5DFD5] text-xs text-[#635F57] flex items-start gap-2">
              <Info className="w-4 h-4 text-[#14382B] shrink-0 mt-0.5" />
              <span>General role: Attracts water and can support softer stool consistency, though individual effects depend on the specific fiber type and fluid intake.</span>
            </div>
          </div>

          {/* Insoluble Fiber Card */}
          <div className="bg-white rounded-2xl border border-[#E5DFD5] p-6 sm:p-8 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#B85D36]">Type 02</span>
                <h3 className="text-2xl font-serif font-bold text-[#14382B]">Insoluble Fiber</h3>
              </div>
              <span className="text-xs bg-[#F8EFEA] text-[#B85D36] font-semibold px-2.5 py-1 rounded">
                Adds Bulk to Stool
              </span>
            </div>

            <p className="text-sm text-[#4A463F] leading-relaxed">
              Insoluble fiber generally does not dissolve in water. It tends to pass largely intact through the digestive tract and can help add bulk to stool, which helps support regular and comfortable bowel movements.
            </p>

            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#635F57]">Food Examples:</h4>
              <ul className="text-sm text-[#2C2A26] space-y-1.5 list-disc list-inside">
                <li><strong className="text-[#14382B]">Whole Grains & Wheat Bran:</strong> classic sources of plant structural fibers</li>
                <li><strong className="text-[#14382B]">Broccoli & Brussels Sprouts:</strong> cruciferous vegetables with sturdy plant cell walls</li>
                <li><strong className="text-[#14382B]">Fruit & Vegetable Skins:</strong> such as pear, apple, and root vegetable skins</li>
                <li><strong className="text-[#14382B]">Nuts & Pumpkin Seeds:</strong> provide intact plant cell wall fibers</li>
              </ul>
            </div>

            <div className="bg-[#FBF9F5] p-3.5 rounded-xl border border-[#E5DFD5] text-xs text-[#635F57] flex items-start gap-2">
              <Info className="w-4 h-4 text-[#B85D36] shrink-0 mt-0.5" />
              <span>General role: Can help add bulk to stool and support regular bowel movements, though individual response varies across diets.</span>
            </div>
          </div>
        </div>

        {/* Practical Note: Gradual Pacing and Adequate Fluids */}
        <div className="bg-[#EAF1ED] border border-[#14382B]/20 rounded-2xl p-6 sm:p-8 mb-16 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#14382B]">
            <CheckCircle2 className="w-4 h-4 text-[#14382B]" />
            <span>Practical Guideline · Gradual Increase & Fluids</span>
          </div>
          <h3 className="text-xl font-serif font-bold text-[#14382B]">
            Increase Fiber Gradually to Help Limit Gas or Bloating
          </h3>
          <p className="text-sm text-[#4A463F] leading-relaxed">
            When increasing dietary fiber, doing so gradually gives your digestive system and resident gut microbes time to adjust, which can help limit temporary gas, cramping, or bloating. A sensible guideline is adding an extra 3 to 5 grams of fiber every few days while observing how your body responds.
          </p>
          <p className="text-sm text-[#4A463F] leading-relaxed">
            <strong className="text-[#14382B]">Why adequate fluids are important:</strong> Fiber and water work in tandem. Because fiber absorbs and binds moisture as it travels, drinking sufficient fluids throughout the day helps fiber do its job comfortably and effectively.
          </p>
        </div>

        {/* Daily Intake Target Protocol */}
        <div className="bg-white rounded-2xl border border-[#E5DFD5] p-6 sm:p-8 md:p-10 shadow-sm mb-16 space-y-8">
          <div className="border-b border-[#E5DFD5] pb-6">
            <h3 className="text-2xl font-serif font-bold text-[#14382B] mb-2">
              General Intake Target: 22 to 34 Grams Daily
            </h3>
            <p className="text-sm text-[#635F57] leading-relaxed">
              General dietary recommendations for U.S. adults range from approximately <strong className="text-[#14382B]">22 to 28 grams</strong> daily for adult women and <strong className="text-[#14382B]">28 to 34 grams</strong> for adult men, depending on age, sex, and total caloric intake (roughly 14 grams per 1,000 calories). Individual needs and digestive tolerances vary.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* The Gradual Pacing Strategy */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#B85D36]">
                Pacing Your Fiber Additions
              </h4>
              <p className="text-sm text-[#4A463F] leading-relaxed">
                Rather than doubling your fiber intake in a single day, introduce fiber-rich foods across several meals over one to two weeks. This supports comfortable microbial fermentation and steady gastrointestinal motility.
              </p>
              <div className="p-4 bg-[#FBF9F5] border border-[#E5DFD5] rounded-xl text-xs space-y-2 text-[#4A463F]">
                <div className="font-semibold text-[#14382B]">Pacing guideline:</div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#B85D36]">+3 to 5 grams</span>
                  <span>every few days, paired with an extra glass of water.</span>
                </div>
              </div>
            </div>

            {/* The Fluid Partner Rule */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#14382B] flex items-center gap-2">
                <Droplet className="w-4 h-4 text-[#14382B]" />
                <span>The Fluid Rule: Hydration Helps Fiber Work</span>
              </h4>
              <p className="text-sm text-[#4A463F] leading-relaxed">
                Adequate fluids help ensure that fiber remains supple and easy to pass. Without sufficient water, increasing fiber intake can occasionally lead to firmer stool and digestive discomfort.
              </p>
              <div className="p-4 bg-[#EAF1ED] border border-[#14382B]/20 rounded-xl text-xs text-[#14382B] leading-relaxed">
                <strong>Everyday habit:</strong> Whenever you add a fiber-rich food like beans, oats, or seeds to your meal, drink a glass of water or herbal tea alongside it.
              </div>
            </div>
          </div>
        </div>

        {/* Practical Example: The 'Add One Food' Meal Upgrade */}
        <div className="bg-white rounded-2xl border border-[#E5DFD5] p-6 sm:p-8 md:p-10 shadow-sm space-y-8">
          <div>
            <div className="text-xs font-semibold tracking-widest uppercase text-[#B85D36] mb-2">
              Practical Kitchen Application
            </div>
            <h3 className="text-2xl font-serif font-bold text-[#14382B]">
              The "Add One Food" Upgrade
            </h3>
            <p className="text-sm text-[#635F57] mt-1">
              Adding just one fiber-rich whole food to an existing meal is an easy, gradual way to move toward your daily target:
            </p>
          </div>

          {/* Interactive Meal Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-[#E5DFD5] pb-3">
            {MEAL_UPGRADE_EXAMPLES.map((meal) => {
              const isActive = meal.id === selectedMealId;
              return (
                <button
                  key={meal.id}
                  type="button"
                  onClick={() => setSelectedMealId(meal.id)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                    isActive
                      ? 'bg-[#14382B] text-white shadow-sm'
                      : 'bg-[#FBF9F5] text-[#635F57] hover:bg-[#E5DFD5] hover:text-[#14382B]'
                  }`}
                >
                  {meal.mealName}
                </button>
              );
            })}
          </div>

          {/* Active Meal Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-[#FBF9F5] p-6 rounded-xl border border-[#E5DFD5]">
            <div className="md:col-span-5 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C877D]">Starting Meal</span>
              <div className="text-base font-semibold text-[#2C2A26]">{activeMeal.baseMeal}</div>
              <div className="text-xs text-[#635F57] flex items-center gap-1.5">
                <span>Estimated base fiber:</span>
                <span className="font-bold text-[#2C2A26]">{activeMeal.baseFiber}g</span>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-center text-[#B85D36]">
              <div className="w-8 h-8 rounded-full bg-[#F8EFEA] border border-[#EAD3C7] flex items-center justify-center font-bold">
                <Plus className="w-4 h-4" />
              </div>
            </div>

            <div className="md:col-span-5 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#B85D36]">
                Add One Whole Plant Food
              </span>
              <div className="text-base font-semibold text-[#14382B]">{activeMeal.upgradeAddition}</div>
              <div className="text-xs text-[#14382B] font-bold">
                +{activeMeal.addedFiber}g estimated fiber &rarr; ~{activeMeal.totalFiber}g total in this meal
              </div>
            </div>

            <div className="md:col-span-12 pt-3 border-t border-[#E5DFD5] text-xs text-[#635F57] flex items-start gap-2">
              <Droplet className="w-4 h-4 text-[#14382B] shrink-0 mt-0.5" />
              <span><strong className="text-[#14382B]">Fluid Pairing Tip:</strong> {activeMeal.hydrationTip}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default FiberLesson;
