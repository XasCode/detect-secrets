const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { resolve } = require('node:path');
const { test } = require('node:test');

function runCli(...args) {
  return spawnSync(process.execPath, [resolve(__dirname, '..', 'index.js'), ...args], {
    encoding: 'utf8',
    timeout: 120000,
  });
}

test('prints CLI help and exits successfully', () => {
  const result = runCli('--help');

  assert.equal(result.error, undefined, result.error?.message);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /usage:/i);
  assert.match(result.stdout, /\bscan\b/);
  assert.match(result.stdout, /\baudit\b/);
});

test('returns an error status for invalid options', () => {
  const result = runCli('--not-a-valid-option');

  assert.equal(result.error, undefined, result.error?.message);
  assert.equal(result.status, 2, result.stderr || result.stdout);
  assert.match(`${result.stdout}\n${result.stderr}`, /usage:/i);
});