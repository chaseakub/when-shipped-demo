import assert from 'node:assert/strict';
import test from 'node:test';
import { marked as before } from 'marked-before';
import { marked as after } from 'marked-after';

const markdown = ['```', '', '```'].join('\n');

test('marked@18.2.0 drops the only blank line in a fenced code block', () => {
  assert.equal(before.parse(markdown), '<pre><code></code></pre>\n');
});

test('marked@18.2.1 preserves the blank line', () => {
  assert.equal(after.parse(markdown), '<pre><code>\n</code></pre>\n');
});
