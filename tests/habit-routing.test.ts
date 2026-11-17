import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { habitResult } from '../lib/habit-check';
import { normalizePath, ROUTE_PATHS, ROUTES } from '../siteConfig';

describe('Habit recommendations and canonical route boundaries', () => {
  it('waits for three intentional, valid answers rather than inventing a result', () => {
    for (const value of [{}, { 'fiber-variety': 0 }, { 'fiber-variety': 0, 'fluid-intake': 1 }, { 'fiber-variety': -1, 'fluid-intake': 1, 'bathroom-routine': 1 }, { 'fiber-variety': 1.1, 'fluid-intake': 1, 'bathroom-routine': 1 }, { 'fiber-variety': 0, 'fluid-intake': 3, 'bathroom-routine': 1 }]) assert.equal(habitResult(value), null);
  });
  it('covers all 27 answer combinations with a non-diagnostic step and a real tool link', () => {
    for (let fiber = 0; fiber < 3; fiber++) for (let fluids = 0; fluids < 3; fluids++) for (let routine = 0; routine < 3; routine++) {
      const result = habitResult({ 'fiber-variety': fiber, 'fluid-intake': fluids, 'bathroom-routine': routine });
      assert.ok(result);
      assert.ok(result.guidance.length > 30);
      assert.ok(result.price === 25 || result.price === 30);
      assert.equal(normalizePath(result.guideHref) !== null, true);
      assert.equal(normalizePath(result.productHref), '/workbooks');
      assert.doesNotMatch(result.title, /diagnos|risk score|cure|disorder/i);
    }
  });
  it('prioritizes the selected habit and distinguishes observations from routine planning', () => {
    assert.equal(habitResult({ 'fiber-variety': 0, 'fluid-intake': 2, 'bathroom-routine': 2 })?.product, 'workbook');
    assert.equal(habitResult({ 'fiber-variety': 2, 'fluid-intake': 0, 'bathroom-routine': 2 })?.focus, 'fluid-intake');
    assert.equal(habitResult({ 'fiber-variety': 2, 'fluid-intake': 2, 'bathroom-routine': 0 })?.product, 'planner');
    assert.equal(habitResult({ 'fiber-variety': 2, 'fluid-intake': 2, 'bathroom-routine': 2 })?.focus, 'consistency');
  });
  it('has six actual canonical routes and rejects unknown routes without a homepage fallback', () => {
    assert.equal(ROUTE_PATHS.length, 6);
    for (const path of ROUTE_PATHS) {
      assert.equal(normalizePath(path + (path === '/' ? '' : '/') + '?source=qa#section'), path);
      assert.ok(ROUTES[path].title && ROUTES[path].description && ROUTES[path].h1);
    }
    for (const path of ['/missing', '/fiber-guide/missing', '/api/leads', '/admin', '/workbooks.exe', '/FIBER-GUIDE']) assert.equal(normalizePath(path), null);
  });
});
