import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPageviewTracker, type PageviewPayload } from '../src/lib/site/analytics';

function setup(over: { dnt?: boolean; referrer?: string; language?: string } = {}) {
  const sent: PageviewPayload[] = [];
  let href = 'https://finalstop.org/';
  const track = createPageviewTracker({
    send: (p) => sent.push(p),
    doNotTrack: () => over.dnt ?? false,
    referrer: () => over.referrer ?? 'https://www.google.com/search?q=barber',
    href: () => href,
    language: () => over.language ?? 'en-US'
  });
  return {
    sent,
    go(path: string) {
      href = `https://finalstop.org${path}`;
      return track(path);
    }
  };
}

test('first view carries the external referrer and the language', () => {
  const t = setup();
  assert.equal(t.go('/'), true);
  assert.deepEqual(t.sent, [{ p_path: '/', p_referrer: 'https://www.google.com/search?q=barber', p_lang: 'en-US' }]);
});

test('client-side routes count once each, with the previous page as referrer', () => {
  const t = setup();
  t.go('/');
  t.go('/'); // re-render of the same route
  t.go('/barbers');
  t.go('/barbers/mika');
  assert.deepEqual(
    t.sent.map((p) => p.p_path),
    ['/', '/barbers', '/barbers/mika']
  );
  assert.equal(t.sent[1].p_referrer, 'https://finalstop.org/');
  assert.equal(t.sent[2].p_referrer, 'https://finalstop.org/barbers');
});

test('Do Not Track: nothing is sent', () => {
  const t = setup({ dnt: true });
  assert.equal(t.go('/'), false);
  assert.equal(t.sent.length, 0);
});

test('only http(s) referrers and well-formed languages are sent', () => {
  const t = setup({ referrer: 'android-app://com.google.android.gm/', language: '<x>' });
  t.go('/');
  assert.equal(t.sent[0].p_referrer, null);
  assert.equal(t.sent[0].p_lang, null);
});
