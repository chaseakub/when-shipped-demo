import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { runAction } from './action-under-test/src/action.mjs';
import { createClient } from './action-under-test/src/client.mjs';

const repository = 'typesense/typesense-instantsearch-adapter';
const api = `/repos/${repository}`;
const issue = 273;
const issuePath = `${api}/issues/${issue}`;
const live = createClient('unused'); // Only its anonymous npm reader is used.
const comments = [];
let watching = false;

function readGitHub(path) {
  return JSON.parse(execFileSync('gh', ['api', '--method', 'GET', path], { encoding: 'utf8', maxBuffer: 4e6 }));
}

// Emulate a maintainer's command in a local issue. All HTTP requests are reads.
const client = {
  release: live.release,
  async list(path) {
    if (path === `${api}/issues?state=all&labels=when-shipped`) return watching ? [{ number: issue }] : [];
    assert.equal(path, `${issuePath}/comments`);
    return comments;
  },
  async request(method, path, data) {
    if (method === 'GET') {
      if (path === `${api}/collaborators/pilot-maintainer/permission`) return { permission: 'write' };
      if (path === `${api}/labels/when-shipped`) return { name: 'when-shipped' };
      return readGitHub(path);
    }
    if (method === 'POST' && path === `${issuePath}/labels`) {
      assert.deepEqual(data.labels, ['when-shipped']);
      watching = true;
      return;
    }
    if (method === 'DELETE' && path === `${issuePath}/labels/when-shipped`) {
      watching = false;
      return;
    }
    assert.equal(method, 'POST');
    assert.equal(path, `${issuePath}/comments`);
    comments.push({ body: data.body, user: { id: 41898282, type: 'Bot' } });
  },
};

const context = { repository, repoId: readGitHub(api).id, payload: {} };
const command = {
  action: 'created', issue: { number: issue },
  comment: { user: { login: 'pilot-maintainer', type: 'User' }, body: '/when-shipped #274' },
};
await runAction({ ...context, event: 'issue_comment', payload: command, version: '3.0.2' }, client);
assert.equal(comments.length, 1);
assert.match(comments[0].body, /^Watching /);
assert.equal(watching, true);

// Pin the historical stable version so this replay remains reproducible after future releases.
await runAction({ ...context, event: 'workflow_dispatch', version: '3.0.3' }, client);
assert.equal(comments.length, 2);
assert.match(comments[1].body, /npm install typesense-instantsearch-adapter@3\.0\.3/);
assert.equal(watching, false);
console.log(comments[1].body.split('\n\n').slice(0, 3).join('\n'));

await runAction({ ...context, event: 'schedule' }, client);
assert.equal(comments.length, 2);
console.log('PASS. One local watch, one stable-release reply, zero duplicate replies.');
