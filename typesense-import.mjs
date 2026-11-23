import assert from 'node:assert/strict';

const versions = [
  ['stable-before', '3.0.2', false],
  ['prerelease-one', '3.0.3-1', false],
  ['prerelease-two', '3.0.3-2', true],
  ['stable-after', '3.0.3', true],
];

for (const [alias, version, expectedToLoad] of versions) {
  let imported;
  let failure;
  try {
    imported = await import(alias);
  } catch (error) {
    failure = error;
  }
  console.log(`${version}: ${failure ? failure.message : typeof imported.default}`);
  if (expectedToLoad) {
    assert.ifError(failure);
    assert.equal(typeof imported.default, 'function');
  } else {
    assert.equal(failure?.code, 'ERR_MODULE_NOT_FOUND');
    assert.match(failure.message, /\/lib\/Configuration['"]/);
  }
}
