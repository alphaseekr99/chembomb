import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/press-start-2p/latin-400.css';
import '@fontsource/space-mono/latin-400.css';
import '@fontsource/space-mono/latin-700.css';
import './style.css';
import { Avatar, avatarNames, Mascot, Pixel } from './pixel';
import { sound } from './audio';
import { api } from './types';
import type { Feedback, Rank, Reply, Room, Session } from './types';

const Admin = lazy(() => import('./admin'));
const sessionKey = 'chembomb-session';
const seconds = (ms: number) => Math.max(0, Math.ceil(ms / 1000));
const display = (n: number) => n.toLocaleString('en-AU');
const plural = (n: number, singular: string) => n + ' ' + singular + (n === 1 ? '' : 's');
const errorText = (error: unknown) => error instanceof Error ? error.message : 'An unexpected error occurred.';
const loadSession = (): Session | null => {
  try { return JSON.parse(sessionStorage.getItem(sessionKey) || 'null'); } catch { return null; }
};

function Heading({ children, icon }: { children: ReactNode; icon: string }) {
  return <h2 className="section-title"><Pixel name={icon} />{children}</h2>;
}
function Stage({ title, tag, children }: { title: string; tag?: string; children: ReactNode }) {
  return <section className="frame stage">
    <div className="panel-bar"><span>{title}</span>{tag && <span className="panel-tag">{tag}</span>}</div>
    <div className="stage-content">{children}</div>
  </section>;
}
const steps = [
  { icon: 'players', name: 'Squad up', text: 'Create a room and share the code with your friends.', color: 'yellow' },
  { icon: 'bolt', name: 'Think fast', text: 'Answer chemistry questions for points. Speed counts.', color: 'red' },
  { icon: 'bomb', name: 'Drop the bomb', text: 'Win the round to take 25% off a rival’s round score.', color: 'green' }
];

function MainMenu({ choose }: { choose: (mode: 'create' | 'join') => void }) {
  return <>
    <section className="intro">
      <div className="kicker"><span /> MULTIPLAYER CHEMISTRY ARCADE <span /></div>
      <h1>CHEM<span>BOMB</span></h1>
      <p>Five rounds. One winner. <strong>Watch the fuse.</strong></p>
    </section>
    <div className="landing-grid">
      <section className="frame art-panel" aria-label="CHEMBOMB game mascot">
        <div className="panel-bar"><span><i className="status-square" /> ARCADE MODE</span><span className="panel-tag">YEAR 9 SEAL</span></div>
        <div className="art-grid">
          <div className="reticle left-top" /><div className="reticle right-top" />
          <div className="reticle left-bottom" /><div className="reticle right-bottom" />
          <span className="deco deco-a"><Pixel name="flask" /></span><span className="deco deco-b">+</span>
          <span className="deco deco-c">+</span><span className="deco deco-d"><Pixel name="bolt" /></span>
          <div className="mascot-area"><Mascot /></div>
          <div className="art-caption"><Pixel name="flame" /> FUSE LIT</div>
        </div>
        <div className="hazard" />
      </section>
      <section className="frame instructions">
        <Heading icon="target">HOW TO PLAY</Heading>
        <ol>{steps.map(step => <li key={step.name}>
          <div className={'step-icon ' + step.color}><Pixel name={step.icon} /></div>
          <div><strong>{step.name}</strong><p>{step.text}</p></div>
        </li>)}</ol>
        <div className="menu-actions">
          <button className="button primary" onClick={() => choose('create')}><Pixel name="play" /> CREATE GAME</button>
          <button className="button secondary" onClick={() => choose('join')}><Pixel name="players" /> JOIN GAME</button>
        </div>
      </section>
    </div>
  </>;
}

function RoomForm({ mode, goBack, done }: { mode: 'create' | 'join'; goBack: () => void; done: (reply: Reply) => void }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState(new URLSearchParams(location.search).get('room')?.toUpperCase().slice(0, 6) || '');
  const [avatar, setAvatar] = useState(0);
  const [bank, setBank] = useState<'approved' | 'demo'>('approved');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError(''); setBusy(true);
    try {
      done(await api<Reply>(mode === 'create' ? 'rooms' : 'rooms/' + code + '/join', { name, avatar, bank }));
    } catch (problem) { setError(errorText(problem)); }
    finally { setBusy(false); }
  }
  return <div className="centered">
    <button className="button text-button" onClick={goBack}><Pixel name="back" /> MAIN MENU</button>
    <Stage title={mode === 'create' ? 'CREATE GAME' : 'JOIN GAME'} tag={mode === 'create' ? 'HOST' : 'PLAYER'}>
      <form onSubmit={submit} className="room-form">
        {mode === 'join' && <label>Room code<input autoFocus value={code} onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z2-9]/g, '').slice(0, 6))} placeholder="E.G. K2Q8XZ" pattern="[A-Z2-9]{6}" autoComplete="off" required /></label>}
        <label>Display name<input autoFocus={mode === 'create'} autoComplete="nickname" placeholder="Enter your name" maxLength={18} value={name} onChange={e => setName(e.target.value)} required /></label>
        <fieldset><legend>Pick your avatar</legend><div className="avatars">
          {avatarNames.map((avatarName, index) => <button type="button" key={avatarName} aria-label={avatarName} aria-pressed={index === avatar} className={index === avatar ? 'selected' : ''} onClick={() => setAvatar(index)}><Avatar index={index} /></button>)}
        </div></fieldset>
        {mode === 'create' && <label>Question bank<select value={bank} onChange={e => setBank(e.target.value as typeof bank)}><option value="approved">Year 9 SEAL chemistry</option><option value="demo">Original demo practice</option></select></label>}
        {error && <p role="alert" className="error">{error}</p>}
        <button className="button primary" disabled={busy}><Pixel name={mode === 'create' ? 'play' : 'players'} />{busy ? 'CONNECTING…' : mode === 'create' ? 'CREATE ROOM' : 'JOIN ROOM'}</button>
      </form>
    </Stage>
  </div>;
}

function Ranking({ rows, self, brief = false }: { rows: Rank[]; self: string; brief?: boolean }) {
  return <ol className={'ranking' + (brief ? ' brief' : '')}>{rows.map((row, index) => <li key={row.id} className={row.id === self ? 'self' : undefined}>
    <span className="place">{String(index + 1).padStart(2, '0')}</span><Avatar index={row.avatar} />
    <span className="player-name">{row.name}{row.id === self && <small>YOU</small>}</span>
    <strong>{display(row.points)}</strong>
  </li>)}</ol>;
}
type Action = (action: string, data?: object) => Promise<Reply | undefined>;
function Lobby({ room, perform, busy, exit }: { room: Room; perform: Action; busy: boolean; exit: () => void }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const me = room.players.find(player => player.id === room.self)!;
  const host = room.host === room.self;
  const ready = room.players.length >= 2 && room.players.every(player => player.ready);
  async function copy() {
    try { await navigator.clipboard.writeText(room.code); setCopied(true); setCopyError(false); }
    catch { setCopyError(true); }
  }
  return <div className="centered lobby">
    <Stage title="GAME LOBBY" tag={host ? 'YOU ARE HOST' : room.bank === 'approved' ? 'COURSE BANK' : 'DEMO BANK'}>
      <div className="room-code"><span>ROOM CODE</span><strong>{room.code}</strong><button className="button secondary" onClick={() => void copy()}><Pixel name="copy" /> {copied ? 'COPIED' : 'COPY CODE'}</button>
        <p>{copyError ? 'Clipboard unavailable. Select and copy the code above.' : 'Share this code with players to join.'}</p></div>
      <div className="lobby-count"><Pixel name="players" /> PLAYERS <span>{room.players.length}/12</span></div>
      <ul className="lobby-players">{room.players.map(player => <li key={player.id}>
        <Avatar index={player.avatar} />
        <span className="player-name">{player.name} {player.id === room.self && <small>YOU</small>}</span>
        {player.id === room.host && <small className="host-label">HOST</small>}
        <span className={player.ready && player.online ? 'ready' : 'dim'}>{!player.online ? 'OFFLINE' : player.ready ? 'READY' : 'WAITING'}</span>
      </li>)}</ul>
      <div className="lobby-actions">
        {host ? <button className="button primary" disabled={!ready || busy} onClick={() => void perform('start')}><Pixel name="play" /> START GAME</button>
          : <button className={'button ' + (me.ready ? 'secondary' : 'primary')} disabled={busy} onClick={() => void perform('ready', { ready: !me.ready })}>{me.ready ? 'CANCEL READY' : 'I’M READY'}</button>}
        {host && !ready && <p className="help">{room.players.length < 2 ? 'Waiting for another player.' : 'Waiting for all players to ready up.'}</p>}
        {!host && me.ready && <p className="help">Waiting for the host to start.</p>}
        <button className="button text-button" disabled={busy} onClick={exit}><Pixel name="back" /> LEAVE ROOM</button>
      </div>
    </Stage>
  </div>;
}

function Timer({ remaining, alertAt = 10 }: { remaining: number; alertAt?: number }) {
  return <div className={'timer' + (remaining <= alertAt ? ' critical' : '')} aria-label={plural(remaining, 'second') + ' remaining'}><Pixel name="clock" />{String(remaining).padStart(2, '0')}<span>s</span></div>;
}
function Gameplay({ room, now, perform, busy }: { room: Room; now: number; perform: Action; busy: boolean }) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [answer, setAnswer] = useState('');
  const [chosen, setChosen] = useState<number | null>(null);
  const question = room.question;
  const left = seconds((room.deadline ?? now) - now);
  const max = (room.deadline ?? now) - room.roundStarted;
  const progress = max ? Math.min(100, Math.max(0, 100 * ((room.deadline ?? now) - now) / max)) : 0;
  const score = room.leaderboard.find(row => row.id === room.self)?.points || 0;
  async function submit(value: string | number) {
    if (!question || busy || left <= 0) return;
    const reply = await perform('answer', { questionId: question.id, answer: value });
    if (reply?.feedback) { setFeedback(reply.feedback); setAnswer(''); setChosen(null); }
  }
  return <>
    <div className="match-header"><div><div className="kicker">CHEMISTRY ARCADE</div><h1>ROUND {room.round}<span>/{room.rounds}</span></h1></div><Timer remaining={left} /></div>
    <div className="fuse-track" aria-hidden="true"><div style={{ width: progress + '%' }} /><Pixel name="bomb" /></div>
    <div className="match-grid">
      <Stage title={question ? 'QUESTION ' + (room.answered + 1) + ' / ' + room.questionsPerRound : 'ROUND COMPLETE'} tag={question?.type}>
        {question ? <>
          <div className="question-meta"><span>{question.topic}</span><span>{question.difficulty.toUpperCase()}</span></div>
          <h2 className="question">{question.text}</h2>
          {question.type === 'MCQ' ? <div className="options">{question.options.map((option, index) =>
            <button className={'option' + (index === chosen ? ' chosen' : '')} disabled={busy || left <= 0} key={index} onClick={() => { setChosen(index); void submit(index); }}><span>{String.fromCharCode(65 + index)}</span>{option}</button>
          )}</div> : <form className="saq" onSubmit={e => { e.preventDefault(); void submit(answer); }}>
            <label>Short answer <input value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Type your answer" maxLength={500} autoComplete="off" required /></label>
            <button className="button primary" disabled={busy || !answer.trim() || left <= 0}>SUBMIT ANSWER</button>
          </form>}
        </> : <div className="waiting"><Pixel name="flask" /><h2>Answers locked in</h2><p>The round closes when the timer runs out.</p></div>}
        {feedback && <div className={'feedback ' + (feedback.correct ? 'correct' : 'wrong')} role="status">
          <strong>{feedback.correct ? 'CORRECT  +' + display(feedback.points) + ' PTS' : 'INCORRECT  ·  ' + feedback.expected}</strong><p>{feedback.criteria}</p>
        </div>}
      </Stage>
      <Stage title="SCOREBOARD" tag={'YOU ' + display(score)}><Ranking rows={room.leaderboard} self={room.self} brief /></Stage>
    </div>
  </>;
}

function Intermission({ room, now, perform, busy }: { room: Room; now: number; perform: Action; busy: boolean }) {
  const left = seconds((room.deadline ?? now) - now);
  const holder = room.players.find(player => player.id === room.bomb?.holder);
  const victim = room.players.find(player => player.id === room.bomb?.victim);
  const ownBomb = room.self === holder?.id;
  const [selected, setSelected] = useState<string>();
  const activeTarget = room.players.find(player => player.id === selected);
  if (room.phase === 'countdown') {
    const count = Math.min(3, Math.max(0, Math.ceil(((room.deadline ?? now) - now - 700) / 1000)));
    return <div className="centered"><Stage title={'ROUND ' + room.round + ' / ' + room.rounds}>
      <div className={'countdown ' + (count ? '' : 'boom')}><Pixel name="bomb" /><span>{count || 'BOOM!'}</span><p>GET READY</p></div>
    </Stage></div>;
  }
  if (room.phase === 'results') return <div className="centered">
    <Stage title={'ROUND ' + room.round + ' RESULTS'} tag={left + 's'}>
      <Ranking rows={room.ranked} self={room.self} />
      {holder && <div className="bomb-note"><Pixel name="bomb" /><strong>{holder.name} holds the bomb</strong></div>}
    </Stage>
  </div>;
  if (room.phase === 'explosion') return <div className="centered">
    <Stage title={'BOMB DETONATED · ROUND ' + room.round} tag={left + 's'}>
      <div className="detonation" key={room.bomb?.round}>
        <div className="blast" aria-hidden="true" /><Avatar index={victim?.avatar ?? 0} /><h1>BOOM!</h1>
        <p>{victim?.name} got bombed!</p><strong className="deduction">−{display(room.bomb?.amount ?? 0)} PTS</strong>
        {room.bomb?.auto && <p className="help">Target selected automatically.</p>}
      </div>
    </Stage>
  </div>;
  return <div className="centered">
    <Stage title="BOMB SELECTION" tag={'ROUND ' + room.round}>
      <div className="bomb-intro"><div><h2>{ownBomb ? 'Pick your target' : holder?.name + ' is picking a target'}</h2><p>{ownBomb ? 'Select a rival to take 25% off their round score.' : 'The blast will deduct 25% of the target’s round score.'}</p></div><Timer remaining={left} alertAt={3} /></div>
      <div className="targets">{room.players.filter(player => player.id !== holder?.id).map(player => <button key={player.id} className={player.id === selected ? 'selected' : ''} aria-pressed={player.id === selected} disabled={!ownBomb || busy || left <= 0} onClick={() => setSelected(player.id)}><Avatar index={player.avatar} /><span>{player.name}</span></button>)}</div>
      {ownBomb && <button className="button danger" disabled={!selected || busy || left <= 0} onClick={() => { void perform('bomb', { victim: selected }); }}><Pixel name="bomb" /> {activeTarget ? 'BOMB ' + activeTarget.name.toUpperCase() : 'CONFIRM TARGET'}</button>}
    </Stage>
  </div>;
}

function Victory({ room, perform, busy }: { room: Room; perform: Action; busy: boolean }) {
  const winners = room.leaderboard.filter(row => room.winners.includes(row.id));
  return <>
    <div className="victory"><Pixel name="crown" /><div className="kicker">{winners.length > 1 ? 'SHARED VICTORY' : 'ARCADE CHAMPION'}</div>
      <h1>{winners.map(row => row.name).join(' & ')}</h1><p>{display(winners[0]?.points ?? 0)} <span>POINTS</span></p></div>
    <Stage title="FINAL LEADERBOARD" tag="5 ROUNDS COMPLETE">
      <div className="table-scroll"><table><thead><tr><th scope="col">Player</th>{Array.from({ length: room.rounds }, (_, i) => <th key={i} scope="col">R{i + 1}</th>)}<th scope="col">Total</th><th scope="col">Correct</th><th scope="col">Bombed</th></tr></thead>
        <tbody>{room.leaderboard.map(row => <tr key={row.id}><th scope="row"><Avatar index={row.avatar} />{row.name}</th>{row.roundScores.map((points, index) => <td key={index}>{display(points)}</td>)}<td><strong>{display(row.points)}</strong></td><td>{row.correct}</td><td>{row.bombed}</td></tr>)}</tbody>
      </table></div>
      <div className="replay">{room.host === room.self ? <button className="button primary" disabled={busy} onClick={() => void perform('replay')}><Pixel name="play" /> PLAY AGAIN</button> : <p className="help">The host can start a rematch in this room.</p>}</div>
    </Stage>
  </>;
}

function App() {
  const [session, setSession] = useState<Session | null>(loadSession);
  const [room, setRoom] = useState<Room | null>(null);
  const [mode, setMode] = useState<'create' | 'join' | null>(() => new URLSearchParams(location.search).has('room') ? 'join' : null);
  const [muted, setMuted] = useState(() => localStorage.getItem('chembomb-muted') === '1');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(false);
  const [now, setNow] = useState(Date.now());
  const skew = useRef(0);
  const pending = useRef(false);
  const revision = useRef(0);
  const interacted = useRef(false);
  const previousSound = useRef('');
  const adminMode = /^\/admin\/?$/.test(location.pathname);
  function makeSound(effect: string) {
    if (interacted.current) sound(effect, !muted);
  }
  function accept(snapshot: Room) {
    skew.current = snapshot.now - Date.now();
    setNow(snapshot.now); setRoom(snapshot);
  }
  useEffect(() => {
    const handle = window.setInterval(() => setNow(Date.now() + skew.current), 100);
    return () => window.clearInterval(handle);
  }, []);
  useEffect(() => {
    if (!session || adminMode) return;
    let ended = false, polling = false;
    async function poll() {
      if (polling || pending.current || !session) return;
      polling = true;
      const requested = revision.current;
      try {
        const reply = await api<Reply>('rooms/' + session.code, undefined, session.token);
        if (!ended && !pending.current && requested === revision.current) { accept(reply.room); setOffline(false); }
      } catch (problem) {
        if (ended || requested !== revision.current) return;
        const status = (problem as { status?: number }).status;
        if (status === 401 || status === 404) {
          sessionStorage.removeItem(sessionKey); setSession(null); setRoom(null); setError(errorText(problem));
        } else setOffline(true);
      } finally { polling = false; }
    }
    void poll();
    const handle = window.setInterval(poll, 650);
    window.addEventListener('online', poll);
    return () => { ended = true; window.clearInterval(handle); window.removeEventListener('online', poll); };
  }, [session, adminMode]);
  const countdown = room?.phase === 'countdown' ? Math.min(3, Math.max(0, Math.ceil(((room.deadline ?? now) - now - 700) / 1000))) : undefined;
  useEffect(() => {
    if (!room) return;
    const step = [room.code, room.round, room.phase, countdown].join(':');
    if (step === previousSound.current) return;
    previousSound.current = step;
    if (room.phase === 'countdown') makeSound('countdown');
    if (room.phase === 'bomb') makeSound('bomb');
    if (room.phase === 'explosion') {
      const timeout = window.setTimeout(() => makeSound('explosion'), 380);
      return () => window.clearTimeout(timeout);
    }
    if (room.phase === 'final') makeSound('victory');
  }, [room?.code, room?.round, room?.phase, countdown]);

  function done(reply: Reply) {
    const next = { code: reply.room.code, token: reply.token! };
    sessionStorage.setItem(sessionKey, JSON.stringify(next));
    accept(reply.room); setSession(next); setMode(null);
  }
  function clear() {
    revision.current++;
    sessionStorage.removeItem(sessionKey);
    setSession(null); setRoom(null); setMode(null);
    if (location.search) history.replaceState(null, '', location.pathname);
  }
  async function perform(action: string, data: object = {}) {
    if (!session || pending.current) return;
    pending.current = true; revision.current++;
    setBusy(true); setError('');
    try {
      const reply = await api<Reply>('rooms/' + session.code + '/' + action, data, session.token);
      if (action === 'leave') { clear(); return reply; }
      accept(reply.room); setOffline(false);
      if (reply.feedback) makeSound(reply.feedback.correct ? 'correct' : 'wrong');
      return reply;
    } catch (problem) { setError(errorText(problem)); }
    finally { revision.current++; pending.current = false; setBusy(false); }
  }
  return <div className="shell" onClickCapture={event => {
    const button = (event.target as Element).closest('button');
    if (button && !button.disabled) {
      interacted.current = true;
      if (!button.classList.contains('sound-toggle')) makeSound('click');
    }
  }} onKeyDownCapture={() => { interacted.current = true; }}>
    <header className="topbar">
      <a href="/" className="brand" aria-label="CHEMBOMB home"><span className="logo"><Pixel name="bomb" /></span>CHEM<span>BOMB</span></a>
      <button className="sound-toggle" aria-pressed={muted} onClick={() => {
        const next = !muted; setMuted(next); localStorage.setItem('chembomb-muted', next ? '1' : '0');
        if (!next) sound('click', true);
      }}><Pixel name={muted ? 'mute' : 'sound'} /> SOUND {muted ? 'OFF' : 'ON'}</button>
    </header>
    <main className={room || mode || adminMode ? 'inner' : ''}>
      {error && <div role="alert" className="error global-error">{error}<button className="text-button" onClick={() => setError('')} aria-label="Dismiss error">×</button></div>}
      {offline && session && <p role="status" className="offline">Connection lost. Reconnecting to room {session.code}…</p>}
      {adminMode ? <Suspense fallback={<p>Loading content admin…</p>}><Admin /></Suspense>
        : room?.phase === 'lobby' ? <Lobby room={room} perform={perform} busy={busy} exit={() => void perform('leave')} />
        : room?.phase === 'game' ? <Gameplay key={room.round} room={room} now={now} perform={perform} busy={busy} />
        : room?.phase === 'final' ? <Victory room={room} perform={perform} busy={busy} />
        : room ? <Intermission key={room.round} room={room} now={now} perform={perform} busy={busy} />
        : session ? <div className="centered"><p role="status">Reconnecting to room {session.code}…</p><button className="button secondary" onClick={clear}>MAIN MENU</button></div>
        : mode ? <RoomForm key={mode} mode={mode} goBack={() => setMode(null)} done={done} />
        : <MainMenu choose={setMode} />}
    </main>
    <footer><span><Pixel name="flask" /> CHEMISTRY REVISION ARCADE</span><a href={adminMode ? '/' : '/admin'}><Pixel name={adminMode ? 'back' : 'lock'} /> {adminMode ? 'MAIN MENU' : 'CONTENT ADMIN'}</a></footer>
  </div>;
}

createRoot(document.getElementById('root')!).render(<App />);
