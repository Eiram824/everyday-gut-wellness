import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PLANNER_PRODUCT_INFO, HABIT_QUESTIONS, FIBER_FOODS, MEAL_UPGRADE_EXAMPLES } from '../constants.js';

describe('Everyday Gut Wellness - Constants & Business Rules', () => {
  it('defines the live 30-Day Gut Routine Planner listing accurately', () => {
    assert.equal(PLANNER_PRODUCT_INFO.id, '30-day-gut-routine-planner');
    assert.equal(PLANNER_PRODUCT_INFO.title, 'The 30-Day Gut Routine Planner');
    assert.equal(PLANNER_PRODUCT_INFO.defaultPrice, '$30');
    assert.ok(PLANNER_PRODUCT_INFO.pages.includes('31-page'));
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
