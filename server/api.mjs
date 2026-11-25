import { addPlayer, advance, GameError, makeRoom, must, play, view } from './game.mjs';
import { postgresStore, sqliteStore } from './store.mjs';
import { withCourseContent } from './seed-store.mjs';
import { admin } from './admin.mjs';

const respond = (data, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
const tokenPattern = /^[0-9a-f-]{36}$/;
const roundMilliseconds = env => Math.max(15000, Math.min(300000, Number(env.ROUND_SECONDS) * 1000 || 60000));

async function body(request, limit) {
  must(Number(request.headers.get('content-length')) <= limit, 'The request is too large.', 413);
  const reader = request.body?.getReader();
  must(reader, 'Expected a JSON object.');
  const decoder = new TextDecoder();
  let size = 0;
  let text = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      must(false, 'The request is too large.', 413);
    }
    text += decoder.decode(value, { stream: true });
  }
  try {
    const data = JSON.parse(text + decoder.decode());
    must(data && typeof data === 'object' && !Array.isArray(data), 'Expected a JSON object.');
    return data;
  } catch {
    throw new GameError('Expected a JSON object.');
  }
}

export function createApi(env, localStore, clock = Date.now) {
  const database = env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY ? postgresStore(env)
    : localStore ?? (env.DB ? sqliteStore(env.DB) : null);
  const store = database && withCourseContent(database);
  const roundMs = roundMilliseconds(env);
  return async request => {
    try {
      const [, api, area, code, action, extra] = new URL(request.url).pathname.split('/');
      must(api === 'api' && !extra, 'Unknown endpoint.', 404);
      const get = request.method === 'GET';
      must(get || request.method === 'POST', 'Method unavailable.', 405);
      if (area === 'health' && get) return respond({ ready: Boolean(store), roundSeconds: roundMs / 1000 });
      must(store, 'No game database is configured.', 503);
      if (area === 'admin') {
        must(get ? code === 'list' : code !== 'list', 'Method unavailable.', 405);
        return respond(await admin(request, env, store, code, get ? {} : await body(request, 2000000)));
      }
      if (area === 'bank' && get) return respond({ approved: (await store.list('questions', 'approved')).length });
      must(area === 'rooms', 'Unknown endpoint.', 404);
      if (!code) {
        must(!get, 'Method unavailable.', 405);
        const data = await body(request, 4096);
        for (let attempt = 0; attempt < 8; attempt++) {
          const now = clock();
          const { room, player } = makeRoom(data, now);
          if (await store.insert(room, now)) return respond({ room: view(room, player, now), token: player.token }, 201);
        }
        must(false, 'Could not allocate a room code. Try again.', 503);
      }
      must(/^[A-Z2-9]{6}$/.test(code), 'Enter a valid six-character room code.');
      const joining = action === 'join' && !get;
      must(get ? !action : Boolean(action), 'Method unavailable.', 405);
      const token = joining ? '' : (request.headers.get('Authorization') ?? '').replace(/^Bearer /, '');
      must(joining || tokenPattern.test(token), 'A player session is required.', 401);
      const data = get ? {} : await body(request, 4096);
      let approved;
      for (let attempt = 0; attempt < 14; attempt++) {
        const stored = await store.get(code);
        must(stored, 'Room not found. Check the code.', 404);
        const room = JSON.parse(stored.state);
        const now = clock();
        let player = joining ? null : room.players.find(entry => entry.token === token);
        must(joining || player, 'Your player session is no longer valid.', 401);
        const changed = advance(room, now, roundMs);
        let feedback;
        if (joining) player = addPlayer(room, data, now);
        if (!get && !joining) {
          try {
            if (action === 'start' && room.bank === 'approved' && player.id === room.host) {
              approved ??= await store.list('questions', 'approved');
            }
            feedback = play(room, player, action, data, now, approved);
          } catch (error) {
            if (changed && !await store.save(room, stored.version, now)) continue;
            throw error;
          }
        }
        const heartbeat = now - player.seen >= 9000;
        if (heartbeat || !get) player.seen = now;
        if (get && !changed && !heartbeat || await store.save(room, stored.version, now)) {
          return respond({ room: view(room, player, now), ...(joining ? { token: player.token } : {}), feedback });
        }
      }
      must(false, 'Room is busy. Try again.', 503);
    } catch (error) {
      if (error instanceof GameError) return respond({ error: error.message }, error.status);
      console.error(error);
      return respond({ error: 'The server could not complete that request.' }, 500);
    }
  };
}
