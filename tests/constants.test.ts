import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GUT_CLARITY_PRODUCT, GUT_ROUTINE_PLANNER_PRODUCT, HABIT_QUESTIONS, FIBER_FOODS, MEAL_UPGRADE_EXAMPLES } from '../constants.js';

describe('Everyday Gut Wellness - Constants & Business Rules', () => {
  it('should define the digital workbook products accurately', () => {
    assert.equal(GUT_CLARITY_PRODUCT.id, '14-day-gut-clarity-workbook');
    assert.equal(GUT_CLARITY_PRODUCT.title, 'The 14-Day Gut Clarity Workbook');
    assert.equal(GUT_CLARITY_PRODUCT.priceUSD, 25);

    assert.equal(GUT_ROUTINE_PLANNER_PRODUCT.id, '30-day-gut-routine-planner');
    assert.equal(GUT_ROUTINE_PLANNER_PRODUCT.title, 'The 30-Day Gut Routine Planner');
    assert.equal(GUT_ROUTINE_PLANNER_PRODUCT.priceUSD, 30);
  });

  it('should have 3 foundational habit diagnostic questions with options and guidance', () => {
    assert.equal(HABIT_QUESTIONS.length, 3);
    for (const q of HABIT_QUESTIONS) {
      assert.ok(q.id.length > 0);
      assert.ok(q.question.length > 10);
      assert.ok(q.whyItMatters.length > 20);
      assert.equal(q.options.length, 3);
      for (const opt of q.options) {
        assert.ok(opt.label.length > 0);
        assert.ok(opt.description.length > 0);
        assert.ok(opt.guidance.length > 0);
      }
    }
  });

  it('should list evidence-informed fiber foods with valid positive gram values', () => {
    assert.ok(FIBER_FOODS.length >= 6);
    for (const food of FIBER_FOODS) {
      assert.ok(food.name.length > 0);
      assert.ok(['soluble', 'insoluble', 'both'].includes(food.category));
      assert.ok(food.fiberGrams > 0);
    }
  });

  it('should provide practical meal upgrade examples with increased fiber', () => {
    assert.ok(MEAL_UPGRADE_EXAMPLES.length >= 3);
    for (const meal of MEAL_UPGRADE_EXAMPLES) {
      assert.ok(meal.totalFiber > meal.baseFiber);
      assert.ok(meal.addedFiber > 0);
      assert.ok(meal.hydrationTip.length > 0);
    }
  });
});
