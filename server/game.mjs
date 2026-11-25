import { demoBank } from './demo.mjs';

export const rounds = 5;
export const questionsPerRound = 4;
const maxPlayers = 12;
const roomAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export class GameError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
export function must(condition, message, status) {
  if (!condition) throw new GameError(message, status);
}
export function randomIndex(length) {
  const scale = 0x100000000;
  const ceiling = scale - scale % length;
  const bits = new Uint32Array(1);
  do crypto.getRandomValues(bits); while (bits[0] >= ceiling);
  return bits[0] % length;
}
export function code() {
  return Array.from({ length: 6 }, () => roomAlphabet[randomIndex(roomAlphabet.length)]).join('');
}
function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const other = randomIndex(index + 1);
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }
  return copy;
}
function newStats() {
  return { raw: 0, penalty: 0, correct: 0, time: 0, answers: [] };
}
export function addPlayer(room, input, now) {
  must(room.phase === 'lobby', 'This match has already started.', 409);
  must(room.players.length < maxPlayers, 'This room is full.', 409);
  const name = String(input.name ?? '').trim();
  must(name.length >= 1 && name.length <= 18, 'Enter a name with 1–18 characters.');
  must(!room.players.some(player => player.name.toLowerCase() === name.toLowerCase()), 'That name is already in use.', 409);
  must(Number.isInteger(input.avatar) && input.avatar >= 0 && input.avatar < 8, 'Choose a valid avatar.');
  const player = {
    id: crypto.randomUUID(), token: crypto.randomUUID(), name, avatar: input.avatar,
    ready: room.players.length === 0, seen: now, stats: Array.from({ length: rounds }, newStats), questionAt: 0
  };
  room.players.push(player);
  if (!room.host) room.host = player.id;
  return player;
}
export function makeRoom(input, now) {
  const room = {
    code: code(), host: '', phase: 'lobby', round: 0, deadline: null, roundStarted: 0,
    players: [], bomb: null, history: [], questions: [], bank: input.bank === 'approved' ? 'approved' : 'demo'
  };
  const player = addPlayer(room, input, now);
  room.host = player.id;
  return { room, player };
}
function compare(a, b) {
  return b.points - a.points || b.correct - a.correct || a.time - b.time;
}
function ranks(room, round) {
  return room.players.map(player => {
    const stats = round === undefined ? player.stats : [player.stats[round]];
    return {
      id: player.id, name: player.name, avatar: player.avatar,
      correct: stats.reduce((count, entry) => count + entry.correct, 0),
      points: stats.reduce((count, entry) => count + entry.raw - entry.penalty, 0),
      time: stats.reduce((count, entry) => count + entry.time, 0),
      roundScores: stats.map(entry => entry.raw - entry.penalty),
      bombed: room.history.filter(event => event.victim === player.id).length
    };
  }).sort(compare);
}
function startRound(room, at, roundMs) {
  room.phase = 'game';
  room.roundStarted = at;
  room.deadline = at + roundMs;
  for (const player of room.players) player.questionAt = at;
}
function roundResults(room, at) {
  const ordered = ranks(room, room.round);
  const tied = ordered.filter(row => compare(ordered[0], row) === 0);
  room.bomb = { holder: tied[randomIndex(tied.length)].id, victim: null, amount: 0, auto: false };
  room.phase = 'results';
  room.deadline = at + 4500;
}
function bomb(room, victimId, at, auto = false) {
  const victim = room.players.find(player => player.id === victimId && player.id !== room.bomb.holder);
  must(victim, 'Choose an eligible player.');
  const score = victim.stats[room.round];
  const amount = Math.min(score.raw, Math.round(score.raw * 0.25));
  score.penalty = amount;
  room.bomb = { ...room.bomb, victim: victim.id, amount, auto, round: room.round + 1 };
  room.history.push(room.bomb);
  room.phase = 'explosion';
  room.deadline = at + 3400;
}
export function advance(room, now, roundMs) {
  let changed = false;
  while (room.deadline !== null && now >= room.deadline) {
    const at = room.deadline;
    switch (room.phase) {
      case 'countdown': startRound(room, at, roundMs); break;
      case 'game':
        for (const player of room.players) {
          const score = player.stats[room.round];
          score.time += (questionsPerRound - score.answers.length) * roundMs;
        }
        roundResults(room, at);
        break;
      case 'results': room.phase = 'bomb'; room.deadline = at + 8000; break;
      case 'bomb': {
        const eligible = room.players.filter(player => player.id !== room.bomb.holder);
        bomb(room, eligible[randomIndex(eligible.length)].id, at, true);
        break;
      }
      case 'explosion':
        if (room.round === rounds - 1) {
          room.phase = 'final'; room.deadline = null;
        } else {
          room.round++;
          room.bomb = null;
          room.phase = 'countdown'; room.deadline = at + 3700;
        }
        break;
      default: room.deadline = null;
    }
    changed = true;
  }
  return changed;
}
function normalise(value) {
  return String(value).normalize('NFKC').replace(/[−–]/g, '-').trim().replace(/\s+/g, ' ').replace(/[.!]$/, '');
}
function matchesAnswer(input, option) {
  const expected = normalise(option);
  const actual = normalise(input);
  const formula = /^(?:[A-Z][a-z]?\d*|[()\d+\-^])+$/.test(expected) && /[A-Z]/.test(expected);
  return formula ? actual.replace(/\s+/g, '') === expected : actual.toLowerCase() === expected.toLowerCase();
}
export function answerPoints(question, correct, elapsed) {
  if (!correct) return 0;
  const multiplier = { easy: 1, medium: 1.5, hard: 2 }[question.difficulty];
  const speed = question.type === 'MCQ' ? { grace: 1000, window: 10000 } : { grace: 5000, window: 24000 };
  const fraction = Math.max(0, 1 - Math.max(0, elapsed - speed.grace) / speed.window);
  return Math.round(question.basePoints * multiplier * (1 + 0.3 * fraction));
}
export function play(room, player, action, input, now, approved) {
  if (action === 'leave') {
    must(room.phase === 'lobby', 'You can leave the lobby before the match starts.');
    room.players = room.players.filter(entry => entry.id !== player.id);
    if (room.host === player.id) {
      const next = room.players[0];
      room.host = next?.id ?? '';
      if (next) next.ready = true;
    }
  } else if (action === 'ready') {
    must(room.phase === 'lobby', 'Ready status is available in the lobby.');
    player.ready = Boolean(input.ready);
  } else if (action === 'start') {
    must(player.id === room.host, 'Only the host can start.', 403);
    must(room.phase === 'lobby', 'This match has already started.', 409);
    must(room.players.length >= 2, 'At least two players are needed.');
    must(room.players.every(entry => entry.ready), 'Every player must be ready.');
    const bank = room.bank === 'demo' ? demoBank : approved;
    must(bank.length >= rounds * questionsPerRound, 'Approve at least 20 questions to start a course-bank match.');
    const mcq = shuffle(bank.filter(question => question.type === 'MCQ'));
    const saq = shuffle(bank.filter(question => question.type === 'SAQ'));
    room.questions = Array.from({ length: rounds }, () => {
      const mixed = mcq.length && saq.length ? [mcq.pop(), saq.pop()] : [];
      while (mixed.length < questionsPerRound) mixed.push(mcq.pop() ?? saq.pop());
      return shuffle(mixed);
    });
    room.phase = 'countdown'; room.deadline = now + 3700;
  } else if (action === 'answer') {
    must(room.phase === 'game', 'This answer window has closed.', 409);
    const score = player.stats[room.round];
    const question = room.questions[room.round][score.answers.length];
    must(question && input.questionId === question.id, 'That question has already closed for you.', 409);
    let correct;
    if (question.type === 'MCQ') {
      must(Number.isInteger(input.answer) && input.answer >= 0 && input.answer < question.options.length, 'Choose an answer.');
      correct = input.answer === question.correct;
    } else {
      must(typeof input.answer === 'string' && input.answer.trim().length >= 1 && input.answer.length <= 500, 'Enter a short answer.');
      correct = question.accepted.some(option => matchesAnswer(input.answer, option));
    }
    const elapsed = Math.max(0, now - player.questionAt);
    const points = answerPoints(question, correct, elapsed);
    const feedback = {
      id: question.id, correct, points, criteria: question.criteria,
      expected: question.type === 'MCQ' ? question.options[question.correct] : question.answer
    };
    score.answers.push(feedback);
    score.raw += points;
    score.correct += Number(correct);
    score.time += elapsed;
    player.questionAt = now;
    return feedback;
  } else if (action === 'bomb') {
    must(room.phase === 'bomb', 'Bomb selection has closed.', 409);
    must(player.id === room.bomb.holder, 'Only the bomb holder can choose.', 403);
    bomb(room, input.victim, now);
  } else if (action === 'replay') {
    must(player.id === room.host, 'Only the host can reset the room.', 403);
    must(room.phase === 'final', 'Finish the match before replaying.');
    room.phase = 'lobby'; room.round = 0; room.deadline = null; room.bomb = null;
    room.history = []; room.questions = [];
    for (const entry of room.players) {
      entry.ready = entry.id === room.host;
      entry.stats = Array.from({ length: rounds }, newStats);
    }
  } else must(false, 'Unknown action.', 404);
}
export function view(room, player, now) {
  const leaderboard = ranks(room);
  const ranked = ranks(room, room.round);
  const stats = player.stats[room.round];
  const question = room.phase === 'game' ? room.questions[room.round][stats.answers.length] : null;
  return {
    code: room.code, phase: room.phase, round: room.round + 1, rounds, questionsPerRound, bank: room.bank,
    now, deadline: room.deadline, roundStarted: room.roundStarted, host: room.host, self: player.id,
    players: room.players.map(entry => ({
      id: entry.id, name: entry.name, avatar: entry.avatar, ready: entry.ready, online: now - entry.seen < 19000
    })),
    leaderboard, ranked, bomb: room.bomb, history: room.history, answered: stats.answers.length,
    winners: room.phase === 'final' ? leaderboard.filter(row => compare(leaderboard[0], row) === 0).map(row => row.id) : [],
    question: question ? {
      id: question.id, topic: question.topic, type: question.type, text: question.text,
      options: question.options, difficulty: question.difficulty, basePoints: question.basePoints
    } : null
  };
}
