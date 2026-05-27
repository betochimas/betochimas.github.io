import React, { useEffect, useState } from 'react';
import Footer from '../components/Footer.jsx';
import {
  listConflicts, listBattles, listParticipants, listNations,
  login, logout, isLoggedIn, createConflict, deleteConflict,
  CONFLICT_TYPES,
} from '../data/conflictsApi.ts';
import type { Conflict, Battle, Participant } from '../data/conflictsApi.ts';

const GITHUB_URL = 'https://github.com/betochimas/historical-conflicts-api';
const STACK = ['Java 21', 'Spring Boot', 'PostgreSQL', 'Redis', 'JWT', 'Docker'];

const card = 'border border-muted dark:border-white/15 rounded-md';
const chip = 'inline-block px-2 py-1 text-xs font-semibold bg-accent/10 text-accent border border-accent/30 rounded-md';
const btn = 'px-3 py-1 font-semibold border border-accent text-accent rounded-md ' +
  'hover:bg-accent hover:text-white transition-colors disabled:opacity-50';
const input = 'w-full px-2 py-1 bg-transparent border border-muted dark:border-white/20 rounded-md focus:outline-none focus:border-accent';

function fmtDate(d: string | null): string {
  return d ?? '—';
}

// ---- Expandable detail: battles + participants for one conflict ----

function ConflictDetail({ conflict, nations }: { conflict: Conflict; nations: Record<number, string> }) {
  const [battles, setBattles] = useState<Battle[] | null>(null);
  const [participants, setParticipants] = useState<Participant[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [b, p] = await Promise.all([listBattles(conflict.id), listParticipants(conflict.id)]);
        if (!cancelled) { setBattles(b.content); setParticipants(p.content); }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load details.');
      }
    })();
    return () => { cancelled = true; };
  }, [conflict.id]);

  if (error) return <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>;
  if (battles === null || participants === null) return <p className="mt-2 text-sm italic">Loading details…</p>;

  return (
    <div className="mt-3 space-y-3">
      {conflict.description && <p className="text-sm">{conflict.description}</p>}

      <div>
        <h4 className="font-semibold">Battles ({battles.length})</h4>
        {battles.length === 0 ? <p className="text-sm italic">None recorded.</p> : (
          <ul className="text-sm list-disc list-inside">
            {battles.map(b => (
              <li key={b.id}>
                <span className="font-semibold">{b.name}</span> — {fmtDate(b.date)}, {b.location ?? 'unknown'}
                {b.outcome ? ` (${b.outcome})` : ''}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h4 className="font-semibold">Participants ({participants.length})</h4>
        {participants.length === 0 ? <p className="text-sm italic">None recorded.</p> : (
          <ul className="text-sm list-disc list-inside">
            {participants.map(p => (
              <li key={p.id}>
                <span className="font-semibold">{nations[p.nationId] ?? `Nation #${p.nationId}`}</span>
                {' '}— {p.role.toLowerCase()}
                {p.casualties != null ? `, ${p.casualties.toLocaleString()} casualties` : ''}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ---- Create-conflict form (shown only when logged in) ----

function CreateConflictForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('');
  const [conflictType, setConflictType] = useState(CONFLICT_TYPES[0]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [outcome, setOutcome] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      await createConflict({
        name,
        conflictType,
        startDate: startDate || null,
        endDate: endDate || null,
        outcome: outcome || null,
        description: description || null,
      });
      setName(''); setStartDate(''); setEndDate(''); setOutcome(''); setDescription('');
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed.');
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={handleSubmit} className={`${card} p-4 mb-6 space-y-2`}>
      <h3 className="text-lg font-semibold">Add a conflict <span className="text-sm font-normal">(authenticated write)</span></h3>
      <input className={input} placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
      <div className="flex gap-2 flex-wrap">
        <select className={input + ' md:w-auto'} value={conflictType} onChange={e => setConflictType(e.target.value)}>
          {CONFLICT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input className={input + ' md:w-auto'} type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <input className={input + ' md:w-auto'} type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
      </div>
      <input className={input} placeholder="Outcome (optional)" value={outcome} onChange={e => setOutcome(e.target.value)} />
      <textarea className={input} placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} />
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <button className={btn} type="submit" disabled={busy}>{busy ? 'Saving…' : 'Create conflict'}</button>
    </form>
  );
}

// ---- Login box ----

function LoginBox({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('demo');
  const [password, setPassword] = useState('demo-password-123');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      await login(username, password);
      onLogin();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed.');
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={handleSubmit} className={`${card} p-4 mb-6`}>
      <h3 className="text-lg font-semibold mb-1">Demo login</h3>
      <p className="text-sm mb-3">
        Browsing is public. Log in with the shared demo account (prefilled below) to create or delete conflicts.
      </p>
      <div className="flex gap-2 flex-wrap items-center">
        <input className={input + ' md:w-auto'} value={username} onChange={e => setUsername(e.target.value)} placeholder="username" />
        <input className={input + ' md:w-auto'} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password" />
        <button className={btn} type="submit" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
}

// ---- Page ----

function HistoricalConflicts() {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [nations, setNations] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());

  async function load() {
    setLoading(true); setError(null);
    try {
      const [c, n] = await Promise.all([listConflicts(), listNations()]);
      setConflicts(c.content);
      const map: Record<number, string> = {};
      n.content.forEach(x => { map[x.id] = x.name; });
      setNations(map);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load conflicts.');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function handleLogout() { logout(); setLoggedIn(false); }

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this conflict?')) return;
    try {
      await deleteConflict(id);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed.');
      if (!isLoggedIn()) setLoggedIn(false); // token expired
    }
  }

  return (
    <>
      <div className="bg-surface dark:bg-surface-dark text-ink dark:text-ink-dark min-h-screen font-inter">
        <div className="max-w-7xl w-full mx-auto px-6 py-10">

          {/* Intro */}
          <h1 className="text-3xl md:text-4xl font-bold text-ink dark:text-ink-dark">Historical Conflicts API</h1>
          <p className="mt-2 max-w-3xl">
            A live demo of a REST API for cataloguing wars, their battles, and the nations involved.
            Data below is served by the running backend; the read endpoints are public, and the demo
            account unlocks the authenticated write endpoints.
          </p>
          <p className="mt-3 flex flex-wrap gap-2">
            {STACK.map(s => <span key={s} className={chip}>{s}</span>)}
          </p>
          <p className="mt-3 text-sm">
            <a className="underline" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">Source on GitHub</a>
          </p>

          <div className="h-8" />

          {/* Auth */}
          {loggedIn ? (
            <div className={`${card} p-4 mb-6 flex items-center justify-between flex-wrap gap-2`}>
              <span className="font-semibold">Logged in as the demo account — writes enabled.</span>
              <button className={btn} onClick={handleLogout}>Log out</button>
            </div>
          ) : (
            <LoginBox onLogin={() => setLoggedIn(true)} />
          )}

          {loggedIn && <CreateConflictForm onCreated={load} />}

          {/* Conflicts list */}
          <h2 className="text-2xl font-semibold text-ink dark:text-ink-dark mb-3">Conflicts</h2>

          {loading && <p className="italic">Loading…</p>}
          {error && (
            <div className={`${card} p-4 text-red-600 dark:text-red-400`}>
              <p>{error}</p>
              <button className={`${btn} mt-2`} onClick={load}>Retry</button>
            </div>
          )}
          {!loading && !error && conflicts.length === 0 && <p className="italic">No conflicts found.</p>}

          <div className="space-y-3">
            {conflicts.map(c => {
              const open = expandedId === c.id;
              return (
                <div key={c.id} className={`${card} p-4`}>
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <button
                      className="text-left flex-1"
                      onClick={() => setExpandedId(open ? null : c.id)}
                    >
                      <span className="text-lg font-semibold text-ink dark:text-ink-dark">{c.name}</span>
                      <span className="ml-2 text-sm">
                        {c.conflictType} · {fmtDate(c.startDate)} – {fmtDate(c.endDate)}
                        {c.outcome ? ` · ${c.outcome}` : ''}
                      </span>
                    </button>
                    <div className="flex gap-2 items-center">
                      <button className={btn} onClick={() => setExpandedId(open ? null : c.id)}>
                        {open ? 'Hide' : 'Details'}
                      </button>
                      {loggedIn && (
                        <button className={btn} onClick={() => handleDelete(c.id)}>Delete</button>
                      )}
                    </div>
                  </div>
                  {open && <ConflictDetail conflict={c} nations={nations} />}
                </div>
              );
            })}
          </div>

        </div>
        <Footer />
      </div>
    </>
  );
}

export default HistoricalConflicts;
