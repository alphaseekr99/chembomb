import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createApi } from '../server/api.mjs';
import { answerPoints } from '../server/game.mjs';
import { localDatabase } from '../server/local-db.mjs';
import { courseBank } from '../server/course.mjs';
import { sourceMaterials } from '../server/materials.mjs';

function harness(t) {
  const { store, close } = localDatabase(':memory:');
  t.after(close);
  let now = 10000000;
  const api = createApi({ ROUND_SECONDS: '60', ADMIN_KEY: 'testing-only' }, store, () => now);
  async function request(path, data, token) {
    const response = await api(new Request('http://chembomb.test/api/' + path, {
      method: data ? 'POST' : 'GET',
      headers: token ? { Authorization: 'Bearer ' + token } : undefined,
      body: data && JSON.stringify(data)
    }));
    return { ...await response.json(), status: response.status };
  }
  const get = session => request('rooms/' + session.room.code, undefined, session.token);
  const play = (session, action, data = {}) => request('rooms/' + session.room.code + '/' + action, data, session.token);
  const join = (session, name, avatar = 1) => request('rooms/' + session.room.code + '/join', { name, avatar });
  const at = timestamp => { now = timestamp; };
  const tick = delay => { now += delay; };
  return { request, get, play, join, at, tick };
}

test('concurrent joins, ready state, start authorization, synchronized server deadlines and reconnect', async t => {
  const h = harness(t);
  const host = await h.request('rooms', { name: 'Host', avatar: 0, bank: 'approved' });
  assert.equal(host.status, 201);
  assert.match(host.room.code, /^[A-Z2-9]{6}$/);
  const [guest, third] = await Promise.all([h.join(host, 'Guest'), h.join(host, 'Third', 3)]);
  assert.equal(guest.status, 200);
  assert.equal(third.status, 200);
  assert.equal((await h.get(host)).room.players.length, 3);
  assert.equal((await h.play(guest, 'start')).status, 403);
  assert.equal((await h.play(host, 'start')).status, 400);
  await Promise.all([h.play(guest, 'ready', { ready: true }), h.play(third, 'ready', { ready: true })]);
  const started = await h.play(host, 'start');
  assert.equal(started.room.phase, 'countdown');
  assert.equal((await h.join(host, 'Too late')).status, 409);
  h.at(started.room.deadline);
  const [a, b, c] = await Promise.all([h.get(host), h.get(guest), h.get(third)]);
  assert.equal(a.room.phase, 'game');
  assert.equal(a.room.deadline, b.room.deadline);
  assert.equal(b.room.deadline, c.room.deadline);
  assert.equal(a.room.question.id, b.room.question.id);
  assert.ok(!('answer' in a.room.question) && !('criteria' in a.room.question) && !('accepted' in a.room.question));
  assert.ok(!('token' in a.room.players[0]));
  h.tick(21000);
  const stale = await h.get(host);
  assert.equal(stale.room.players.find(p => p.id === guest.room.self).online, false);
  const resumed = await h.get(guest);
  assert.equal(resumed.room.self, guest.room.self);
  assert.equal(resumed.room.question.id, b.room.question.id);
  assert.equal(resumed.room.players.find(p => p.id === guest.room.self).online, true);
  assert.equal((await h.request('rooms/' + host.room.code)).status, 401);
});

test('course bank covers all topics and its classifications, sources and accepted answer forms are valid', () => {
  assert.equal(new Set(courseBank.map(question => question.topic)).size, 16);
  assert.equal(sourceMaterials.length, 47);
  assert.ok(sourceMaterials.every(material => material.passages.length > 0));
  assert.equal(new Set(courseBank.map(question => question.id)).size, courseBank.length);
  for (const question of courseBank) {
    assert.ok(sourceMaterials.some(material => material.name === question.source));
    assert.equal(question.status, question.conflict ? 'draft' : 'approved');
    assert.ok(question.reference && question.criteria && question.basePoints > 0);
    if (question.type === 'SAQ') assert.ok(question.accepted.includes(question.answer));
    else assert.equal(question.answer, question.options[question.correct]);
  }
});

test('difficulty weights and writing grace award points consistently', () => {
  const mcq = { type: 'MCQ', difficulty: 'easy', basePoints: 100 };
  assert.equal(answerPoints(mcq, false, 0), 0);
  assert.equal(answerPoints(mcq, true, 0), 130);
  assert.equal(answerPoints(mcq, true, 11000), 100);
  assert.equal(answerPoints({ ...mcq, difficulty: 'medium' }, true, 11000), 150);
  assert.equal(answerPoints({ ...mcq, difficulty: 'hard' }, true, 11000), 200);
  const saq = { ...mcq, type: 'SAQ' };
  assert.equal(answerPoints(saq, true, 5000), 130);
  assert.ok(answerPoints(saq, true, 11000) > answerPoints(mcq, true, 11000));
});

test('all five rounds, both answer types, duplicate protection, live ranks, manual and automatic bombs, winner and replay', async t => {
  const h = harness(t);
  const host = await h.request('rooms', { name: 'Sodium', avatar: 0, bank: 'approved' });
  const guest = await h.join(host, 'Chlorine');
  await h.play(guest, 'ready', { ready: true });
  let state = (await h.play(host, 'start')).room;
  let hostPoints = 0, guestPoints = 0;
  const types = new Set();
  const unique = new Set();
  for (let round = 1; round <= 5; round++) {
    assert.equal(state.round, round);
    h.at(state.deadline);
    const game = await h.get(host);
    const roundEnd = game.room.deadline;
    const answer = async (session, count) => {
      let points = 0;
      for (let item = 0; item < count; item++) {
        h.tick(1200);
        const current = (await h.get(session)).room;
        const question = courseBank.find(entry => entry.id === current.question.id);
        assert.ok(!question.conflict);
        if (session === host) {
          assert.ok(!unique.has(question.id));
          unique.add(question.id);
        }
        types.add(question.type);
        const payload = { questionId: question.id, answer: question.type === 'MCQ' ? question.correct : question.accepted.at(-1) };
        if (round === 1 && item === 0 && session === host) {
          const duplicate = await Promise.all([h.play(session, 'answer', payload), h.play(session, 'answer', payload)]);
          assert.deepEqual(duplicate.map(reply => reply.status).sort(), [200, 409]);
          points += duplicate.find(reply => reply.feedback).feedback.points;
        } else {
          const response = await h.play(session, 'answer', payload);
          assert.equal(response.status, 200, response.error);
          assert.equal(response.feedback.correct, true);
          points += response.feedback.points;
        }
      }
      return points;
    };
    const hostRound = await answer(host, 4);
    const guestRound = round === 2 ? 0 : await answer(guest, 1);
    hostPoints += hostRound;
    guestPoints += guestRound - Math.round(guestRound * 0.25);
    assert.equal((await h.get(host)).room.leaderboard[0].points, hostPoints);
    h.at(roundEnd);
    const results = (await h.get(guest)).room;
    assert.equal(results.phase, 'results');
    assert.equal(results.bomb.holder, host.room.self);
    h.at(results.deadline);
    const selection = (await h.get(guest)).room;
    assert.equal(selection.phase, 'bomb');
    assert.equal(selection.deadline - selection.now, 8000);
    assert.equal((await h.play(guest, 'bomb', { victim: host.room.self })).status, 403);
    let explosion;
    if (round === 2) {
      h.at(selection.deadline);
      explosion = (await h.get(guest)).room;
      assert.equal(explosion.bomb.auto, true);
      assert.equal(explosion.players.find(entry => entry.id === host.room.self).online, false);
    } else {
      assert.equal((await h.play(host, 'bomb', { victim: host.room.self })).status, 400);
      explosion = (await h.play(host, 'bomb', { victim: guest.room.self })).room;
      assert.equal(explosion.bomb.auto, false);
    }
    assert.equal(explosion.phase, 'explosion');
    assert.equal(explosion.bomb.victim, guest.room.self);
    assert.equal(explosion.bomb.amount, Math.round(guestRound * 0.25));
    assert.equal(explosion.ranked.find(row => row.id === guest.room.self).points, guestRound - explosion.bomb.amount);
    h.at(explosion.deadline);
    state = (await h.get(host)).room;
  }
  assert.deepEqual(types, new Set(['MCQ', 'SAQ']));
  assert.equal(unique.size, 20);
  assert.equal(state.phase, 'final');
  assert.equal(state.history.length, 5);
  assert.deepEqual(state.winners, [host.room.self]);
  assert.equal(state.leaderboard[0].points, hostPoints);
  assert.equal(state.leaderboard[0].correct, 20);
  assert.equal(state.leaderboard[1].points, guestPoints);
  assert.equal(state.leaderboard[1].correct, 4);
  assert.equal(state.leaderboard[1].bombed, 5);
  assert.equal(state.leaderboard[1].roundScores.length, 5);
  assert.equal((await h.play(guest, 'replay')).status, 403);
  const replay = (await h.play(host, 'replay')).room;
  assert.equal(replay.phase, 'lobby');
  assert.equal(replay.round, 1);
  assert.equal(replay.leaderboard[0].points, 0);
});

test('all unanswered rounds still resolve, share a final tie and never deduct below zero', async t => {
  const h = harness(t);
  const host = await h.request('rooms', { name: 'A', avatar: 0 });
  const guest = await h.join(host, 'B');
  await h.play(guest, 'ready', { ready: true });
  const start = await h.play(host, 'start');
  assert.equal(start.room.phase, 'countdown');
  h.tick(500000);
  const final = (await h.get(host)).room;
  assert.equal(final.phase, 'final');
  assert.deepEqual(new Set(final.winners), new Set([host.room.self, guest.room.self]));
  assert.equal(final.history.length, 5);
  for (const event of final.history) {
    assert.notEqual(event.holder, event.victim);
    assert.equal(event.amount, 0);
    assert.equal(event.auto, true);
  }
});

test('admin access, source uploads, manual review, approval and seeded item deletion', async t => {
  const h = harness(t);
  assert.equal((await h.request('admin/list')).status, 401);
  const key = 'testing-only';
  const bank = await h.request('admin/list', undefined, key);
  assert.equal(bank.questions.length, courseBank.length);
  assert.equal(bank.materials.length, 47);
  const initialApproved = (await h.request('bank')).approved;
  const source = await h.request('admin/material', {
    name: 'Test.docx', kind: 'worksheet', passages: [{ reference: 'Question 1', text: 'Carbon has 6 protons.' }]
  }, key);
  assert.equal(source.status, 200);
  assert.equal((await h.request('admin/source', { id: source.id }, key)).passages[0].reference, 'Question 1');
  const manual = {
    type: 'SAQ', topic: 'Atoms', text: 'How many protons does carbon have?', answer: '6', accepted: ['six'],
    difficulty: 'easy', basePoints: 100, source: 'Test.docx', reference: 'Question 1', criteria: 'Carbon has 6 protons.'
  };
  const draft = await h.request('admin/question', { ...manual, status: 'draft' }, key);
  assert.equal(draft.status, 200);
  assert.equal((await h.request('bank')).approved, initialApproved);
  assert.equal((await h.request('admin/question', { ...manual, status: 'approved', conflict: 'Review required' }, key)).status, 400);
  const approved = await h.request('admin/question', { ...draft.question, status: 'approved' }, key);
  assert.equal(approved.question.status, 'approved');
  assert.equal((await h.request('bank')).approved, initialApproved + 1);
  assert.equal((await h.request('admin/delete', { id: courseBank[0].id }, key)).status, 200);
  assert.equal((await h.request('bank')).approved, initialApproved);
  assert.equal((await h.request('admin/generate', { materialId: source.id }, key)).status, 400);
});
