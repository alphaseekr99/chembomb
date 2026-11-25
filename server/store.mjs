export function sqliteStore(db) {
  return {
    async insert(room, now) {
      const result = await db.prepare('INSERT INTO rooms (code, state, updated) VALUES (?, ?, ?) ON CONFLICT DO NOTHING')
        .bind(room.code, JSON.stringify(room), now).run();
      return result.meta.changes === 1;
    },
    async get(code) {
      return db.prepare('SELECT state, version FROM rooms WHERE code = ?').bind(code).first();
    },
    async save(room, version, now) {
      const result = await db.prepare('UPDATE rooms SET state = ?, version = version + 1, updated = ? WHERE code = ? AND version = ?')
        .bind(JSON.stringify(room), now, room.code, version).run();
      return result.meta.changes === 1;
    },
    async list(table, status) {
      const query = table === 'materials'
        ? db.prepare('SELECT data FROM materials')
        : status ? db.prepare('SELECT data FROM questions WHERE status = ?').bind(status)
          : db.prepare('SELECT data FROM questions');
      return (await query.all()).results.map(row => JSON.parse(row.data));
    },
    async put(table, value) {
      const data = JSON.stringify(value);
      if (table === 'materials') {
        await db.prepare('INSERT INTO materials (id, data) VALUES (?, ?) ON CONFLICT (id) DO UPDATE SET data = excluded.data')
          .bind(value.id, data).run();
      } else {
        await db.prepare('INSERT INTO questions (id, data, status) VALUES (?, ?, ?) ON CONFLICT (id) DO UPDATE SET data = excluded.data, status = excluded.status')
          .bind(value.id, data, value.status).run();
      }
    },
    async removeQuestion(id) {
      await db.prepare('DELETE FROM questions WHERE id = ?').bind(id).run();
    }
  };
}

export function postgresStore(env) {
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  const base = env.SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/';
  async function request(path, method = 'GET', body, prefer) {
    const headers = { apikey: key, 'Content-Type': 'application/json' };
    if (!key.startsWith('sb_secret_')) headers.Authorization = `Bearer ${key}`;
    if (prefer) headers.Prefer = prefer;
    const response = await fetch(base + path, { method, headers, body: body && JSON.stringify(body) });
    if (!response.ok) throw new Error(`Supabase store request failed with ${response.status}`);
    return response.status === 204 || response.headers.get('content-length') === '0' ? [] : response.json();
  }
  return {
    async insert(room, now) {
      return (await request('rooms?on_conflict=code', 'POST', {
        code: room.code, state: JSON.stringify(room), updated: now
      }, 'resolution=ignore-duplicates,return=representation')).length === 1;
    },
    async get(code) {
      return (await request(`rooms?select=state,version&code=eq.${code}`))[0];
    },
    async save(room, version, now) {
      return (await request(`rooms?code=eq.${room.code}&version=eq.${version}`, 'PATCH', {
        state: JSON.stringify(room), version: version + 1, updated: now
      }, 'return=representation')).length === 1;
    },
    async list(table, status) {
      const rows = [];
      for (let offset = 0; ; offset += 500) {
        const batch = await request(`${table}?select=data&order=id&limit=500&offset=${offset}${status ? '&status=eq.' + status : ''}`);
        rows.push(...batch.map(row => JSON.parse(row.data)));
        if (batch.length < 500) return rows;
      }
    },
    async put(table, value) {
      const row = { id: value.id, data: JSON.stringify(value) };
      if (table === 'questions') row.status = value.status;
      await request(`${table}?on_conflict=id`, 'POST', row, 'resolution=merge-duplicates,return=minimal');
    },
    async removeQuestion(id) {
      await request('questions?id=eq.' + encodeURIComponent(id), 'DELETE');
    }
  };
}
