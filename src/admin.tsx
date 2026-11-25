import React, { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { api } from './types';
import type { AdminQuestion } from './types';

type Material = { id: string; name: string; kind: string; count: number };
type Bank = { questions: AdminQuestion[]; materials: Material[]; ai: boolean };
const empty: AdminQuestion = {
  id: '', topic: '', text: '', type: 'MCQ', options: ['', '', '', ''], correct: 0, answer: '', accepted: [],
  criteria: '', difficulty: 'medium', basePoints: 100, source: '', reference: '', conflict: '', status: 'draft'
};
const errorText = (error: unknown) => error instanceof Error ? error.message : 'Request failed.';
function Panel({ title, children }: { title: string; children: ReactNode }) {
  return <section className="frame"><div className="panel-bar">{title}</div><div className="stage-content">{children}</div></section>;
}
export default function Admin() {
  const [key, setKey] = useState(() => sessionStorage.getItem('chembomb-admin') || '');
  const [bank, setBank] = useState<Bank>();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [topic, setTopic] = useState('');
  const [draft, setDraft] = useState<AdminQuestion>();
  const [file, setFile] = useState<File>();
  const [kind, setKind] = useState('teaching');
  const [sourceId, setSourceId] = useState('');
  const [preview, setPreview] = useState<{ name: string; passages: { text: string; reference: string }[] }>();
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function refresh() {
    setBank(await api<Bank>('admin/list', undefined, key));
  }
  async function run(work: () => Promise<void>) {
    if (busy) return;
    setBusy(true); setError(''); setNotice('');
    try { await work(); } catch (problem) { setError(errorText(problem)); }
    finally { setBusy(false); }
  }
  useEffect(() => {
    if (key) void run(refresh);
  }, []);
  function patch(data: Partial<AdminQuestion>) {
    setDraft(current => current && { ...current, ...data });
  }
  async function unlock(event: FormEvent) {
    event.preventDefault();
    await run(async () => { await refresh(); sessionStorage.setItem('chembomb-admin', key); });
  }
  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!file) return;
    await run(async () => {
      const { extract } = await import('./extract');
      const passages = (await extract(file)).filter(pass => pass.text.trim()).slice(0, 300);
      if (!passages.length) throw new Error('No readable text found. A scanned PDF needs OCR before uploading.');
      const added = await api<{ id: string; count: number }>('admin/material', { name: file.name, kind, passages }, key);
      setSourceId(added.id); setPreview(undefined); setFile(undefined); form.reset(); setKind('teaching');
      await refresh(); setNotice('Imported ' + added.count + ' source passages.');
    });
  }
  async function generate() {
    await run(async () => {
      const result = await api<{ count: number }>('admin/generate', { materialId: sourceId }, key);
      await refresh(); setFilter('draft'); setTopic(''); setQuery(''); setNotice('Created ' + result.count + ' drafts for review.');
    });
  }
  async function save(status: AdminQuestion['status']) {
    if (!draft) return;
    await run(async () => {
      const result = await api<{ question: AdminQuestion }>('admin/question', { ...draft, status }, key);
      setDraft(result.question); await refresh(); setNotice(status === 'approved' ? 'Question approved for gameplay.' : 'Draft saved.');
    });
  }
  async function remove() {
    if (!draft?.id || !confirm('Delete this question from the bank?')) return;
    await run(async () => {
      await api('admin/delete', { id: draft.id }, key);
      setDraft(undefined); await refresh(); setNotice('Question deleted.');
    });
  }
  const topics = bank ? [...new Set(bank.questions.map(question => question.topic))].sort() : [];
  const filtered = bank?.questions.filter(question => (!filter || filter === question.status) && (!topic || topic === question.topic) &&
    [question.text, question.topic, question.source, question.reference].some(value => value.toLowerCase().includes(query.toLowerCase()))) ?? [];
  return <div className="admin">
    <h1>CONTENT ADMIN</h1>
    {notice && <p className="notice" role="status">{notice}</p>}
    {error && <p className="error global-error" role="alert">{error}</p>}
    {!bank ? <Panel title="ADMIN ACCESS"><form className="admin-form" onSubmit={unlock}>
      <label>Access key<input type="password" value={key} onChange={e => setKey(e.target.value)} required /></label>
      <button className="button primary" disabled={busy}>UNLOCK</button>
    </form></Panel> : <>
      <div className="admin-grid">
        <Panel title="IMPORT SOURCE"><form className="admin-form" onSubmit={upload}>
          <label>Document<input type="file" accept=".pptx,.pdf,.docx" required onChange={e => setFile(e.target.files?.[0])} /></label>
          <label>Role in the course<select value={kind} onChange={e => setKind(e.target.value)}><option value="teaching">Teaching slides</option><option value="worksheet">Worksheet</option><option value="revision">Revision paper</option><option value="answers">Answer guide</option></select></label>
          <button className="button primary" disabled={busy || !file}>EXTRACT AND IMPORT</button>
        </form></Panel>
        <Panel title="SOURCE LIBRARY"><div className="admin-form">
          <label>Source document<select value={sourceId} onChange={e => { setSourceId(e.target.value); setPreview(undefined); }}><option value="">Choose a document</option>{bank.materials.map(item => <option key={item.id} value={item.id}>{item.name} ({item.count})</option>)}</select></label>
          <div className="admin-actions">
            <button className="button secondary" disabled={busy || !sourceId} onClick={() => void run(async () => setPreview(await api('admin/source', { id: sourceId }, key)))}>PREVIEW TEXT</button>
            <button className="button primary" disabled={busy || !sourceId || !bank.ai} onClick={() => void generate()}>GENERATE DRAFTS</button>
          </div>
          {!bank.ai && <p className="dim">Manual editing is available. Configure the AI provider to generate drafts.</p>}
        </div></Panel>
      </div>
      {preview && <Panel title={preview.name}><div className="admin-list">{preview.passages.map((passage, index) => <details key={index}><summary>{passage.reference}</summary><p style={{ whiteSpace: 'pre-wrap' }}>{passage.text}</p></details>)}</div></Panel>}
      <div className="admin-grid">
        <Panel title={bank.questions.filter(question => question.status === 'approved').length + ' APPROVED QUESTIONS'}>
          <div className="admin-form">
            <button className="button primary" onClick={() => setDraft({ ...empty })}>NEW QUESTION</button>
            <label>Search questions<input value={query} onChange={e => setQuery(e.target.value)} /></label>
            <label>Topic<select value={topic} onChange={e => setTopic(e.target.value)}><option value="">All topics</option>{topics.map(item => <option key={item}>{item}</option>)}</select></label>
            <label>Review status<select value={filter} onChange={e => setFilter(e.target.value)}><option value="">All questions</option><option value="draft">Drafts</option><option value="approved">Approved</option></select></label>
          </div>
          <div className="admin-list">{filtered.map(question => <button className="admin-item" key={question.id} onClick={() => setDraft(question)}>
            <span><strong>{question.text}</strong><small>{question.topic} · {question.status}{question.conflict ? ' · CONFLICT' : ''}</small><small>{question.source}</small></span>
          </button>)}{!filtered.length && <p className="dim">No questions match the current filters.</p>}</div>
        </Panel>
        <Panel title={draft?.id ? 'EDIT QUESTION' : 'QUESTION EDITOR'}>{draft ? <form className="admin-form" onSubmit={e => { e.preventDefault(); void save('draft'); }}>
          <label>Question<textarea value={draft.text} onChange={e => patch({ text: e.target.value })} required /></label>
          <div className="admin-grid"><label>Topic<input value={draft.topic} onChange={e => patch({ topic: e.target.value })} required /></label>
          <label>Type<select value={draft.type} onChange={e => patch({ type: e.target.value as AdminQuestion['type'] })}><option>MCQ</option><option>SAQ</option></select></label></div>
          {draft.type === 'MCQ' ? <>
            <label>Options, one per line<textarea value={draft.options.join('\n')} onChange={e => patch({ options: e.target.value.split('\n') })} required /></label>
            <label>Correct option (1–6)<input type="number" min="1" max="6" value={(draft.correct ?? 0) + 1} onChange={e => patch({ correct: Number(e.target.value) - 1 })} /></label>
          </> : <>
            <label>Correct answer<input value={draft.answer} onChange={e => patch({ answer: e.target.value })} required /></label>
            <label>Accepted alternatives, one per line<textarea value={draft.accepted.join('\n')} onChange={e => patch({ accepted: e.target.value.split('\n') })} /></label>
          </>}
          <label>Marking criteria<textarea value={draft.criteria} onChange={e => patch({ criteria: e.target.value })} required /></label>
          <div className="admin-grid"><label>Difficulty<select value={draft.difficulty} onChange={e => patch({ difficulty: e.target.value as AdminQuestion['difficulty'] })}><option>easy</option><option>medium</option><option>hard</option></select></label>
          <label>Base points<input type="number" min="1" max="10000" value={draft.basePoints} onChange={e => patch({ basePoints: Number(e.target.value) })} required /></label></div>
          <label>Source document<input value={draft.source} onChange={e => patch({ source: e.target.value })} list="sources" required />
            <datalist id="sources">{bank.materials.map(item => <option key={item.id} value={item.name} />)}</datalist></label>
          <label>Slide, page or question reference<input value={draft.reference} onChange={e => patch({ reference: e.target.value })} /></label>
          <label>Source conflict for review<textarea value={draft.conflict || ''} onChange={e => patch({ conflict: e.target.value })} /></label>
          <div className="admin-actions">
            <button className="button secondary" disabled={busy}>SAVE AS DRAFT</button>
            <button className="button primary" type="button" disabled={busy || !!draft.conflict} onClick={() => void save('approved')}>APPROVE</button>
            {draft.id && <button className="button danger" type="button" disabled={busy} onClick={() => void remove()}>DELETE</button>}
          </div>
        </form> : <p className="dim">Select a question or create a new one.</p>}</Panel>
      </div>
      <button className="button secondary" onClick={() => { sessionStorage.removeItem('chembomb-admin'); setKey(''); setBank(undefined); setDraft(undefined); }}>LOCK ADMIN</button>
    </>}
  </div>;
}
