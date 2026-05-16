import { test } from 'node:test';
import assert from 'node:assert/strict';

// Smoke tests for <__TAG__>.
// NOTE: Web Components require a DOM. Run these tests under jsdom or
// happy-dom, OR via @web/test-runner in a real browser. Until then, this
// file imports the module to ensure it parses & registers without errors
// when given a minimal DOM stub.

test('__TAG__ module loads', async () => {
  if (typeof customElements === 'undefined') {
    // Skip without DOM
    return;
  }
  await import('../src/components/__KEBAB__.js');
  assert.ok(customElements.get('__TAG__'), '__TAG__ should be registered');
});
