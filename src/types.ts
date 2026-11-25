export type Phase = 'lobby' | 'countdown' | 'game' | 'results' | 'bomb' | 'explosion' | 'final';
export type Player = { id: string; name: string; avatar: number; ready: boolean; online: boolean };
export type Rank = { id: string; name: string; avatar: number; points: number; correct: number; time: number; roundScores: number[]; bombed: number };
export type Question = { id: string; topic: string; text: string; type: 'MCQ' | 'SAQ'; options: string[]; difficulty: 'easy' | 'medium' | 'hard'; basePoints: number };
export type AdminQuestion = Question & { correct: number | null; answer: string; accepted: string[]; criteria: string; source: string; reference: string; conflict?: string; status: 'draft' | 'approved' };
export type Bomb = { holder: string; victim: string | null; amount: number; auto: boolean; round?: number };
export type Room = {
  code: string; phase: Phase; round: number; rounds: number; questionsPerRound: number; bank: 'demo' | 'approved';
  now: number; deadline: number | null; roundStarted: number; host: string; self: string; players: Player[];
  leaderboard: Rank[]; ranked: Rank[]; bomb: Bomb | null; history: Bomb[]; winners: string[]; question: Question | null; answered: number;
};
export type Feedback = { id: string; correct: boolean; points: number; criteria: string; expected: string };
export type Session = { code: string; token: string };
export type Reply = { room: Room; token?: string; feedback?: Feedback };
export async function api<T>(path: string, payload?: object, token?: string): Promise<T> {
  const result = await fetch('/api/' + path, {
    method: payload ? 'POST' : 'GET',
    cache: 'no-store',
    headers: { ...(payload ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: payload ? JSON.stringify(payload) : undefined
  });
  const data = await result.json();
  if (!result.ok) throw Object.assign(new Error(data.error || 'Could not connect to CHEMBOMB.'), { status: result.status });
  return data as T;
}
