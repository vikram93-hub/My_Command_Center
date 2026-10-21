"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Download, FileText, RotateCcw, Search } from "lucide-react";
import "./dsa-notes.css";

const weeks = [
  ["Arrays, Hashing & Two Pointers", "Array traversal, Big-O, HashSet, HashMap, prefix sums, two pointers", 14],
  ["Sliding Window & Stack", "Fixed/variable windows, substrings, stacks, monotonic stack", 13],
  ["Binary Search & Intervals", "Search boundaries, rotated arrays, merging intervals, scheduling", 13],
  ["Linked Lists", "Pointers, reversal, fast/slow pointers, cycles, merging", 11],
  ["Trees", "DFS, BFS, recursion, height, diameter, binary search trees", 15],
  ["Heaps & Greedy Algorithms", "PriorityQueue, top-K, scheduling, greedy choices", 15],
  ["Backtracking & Tries", "Subsets, permutations, combinations, pruning, prefix trees", 12],
  ["Graphs", "Representations, BFS, DFS, components, cycles, topological sort", 13],
  ["Advanced Graphs, Math & Geometry", "Shortest paths, Dijkstra, MST, DSU, number theory, geometry", 14],
  ["1D Dynamic Programming", "States, transitions, memoization, tabulation, space optimization", 12],
  ["2D Dynamic Programming", "Grid DP, LCS, knapsack, string DP", 11],
  ["Bit Manipulation & Final Revision", "Bitwise operators, binary representation, XOR, timed assessments", 7],
] as const;

type Daily = { concepts: string; problems: string; code: string; mistakes: string; complexity: string; status: string; updatedAt: string };
type Revision = { summary: string; patterns: string; mistakes: string; redo: string; assessment: string; updatedAt: string };
type Data = { daily: Record<string, Daily>; revision: Record<string, Revision> };
const blankDaily: Daily = { concepts: "", problems: "", code: "", mistakes: "", complexity: "", status: "Not started", updatedAt: "" };
const blankRevision: Revision = { summary: "", patterns: "", mistakes: "", redo: "", assessment: "", updatedAt: "" };
const storageKey = "dsa-study-tracker-v1";
const keyFor = (week: number, day: number) => `w${week}-d${day}`;

export default function DsaNotesPage() {
  const [week, setWeek] = useState(1);
  const [day, setDay] = useState(1);
  const [mode, setMode] = useState<"daily" | "revision">("daily");
  const [data, setData] = useState<Data>({ daily: {}, revision: {} });
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Loading notes...");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        setData({ daily: parsed.daily ?? {}, revision: parsed.revision ?? {} });
      }
    } catch { setStatus("Could not load saved notes"); }
    finally { setLoaded(true); }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(storageKey, JSON.stringify(data)); setStatus("Autosaved in this browser"); }
    catch { setStatus("Storage is full — export a backup"); }
  }, [data, loaded]);

  const dailyKey = keyFor(week, day);
  const note = data.daily[dailyKey] ?? blankDaily;
  const revision = data.revision[String(week)] ?? blankRevision;
  const doneDays = Object.values(data.daily).filter((item) => item.status === "Completed").length;
  const startedDays = Object.values(data.daily).filter((item) => [item.concepts, item.problems, item.code, item.mistakes, item.complexity].some((value) => value.trim())).length;
  const reviewedWeeks = Object.values(data.revision).filter((item) => item.summary.trim() && item.mistakes.trim()).length;
  const matchingWeeks = weeks.map((item, index) => ({ item, number: index + 1 })).filter(({ item, number }) => `week ${number} ${item[0]} ${item[1]}`.toLowerCase().includes(query.toLowerCase()));

  function updateDaily(field: keyof Daily, value: string) {
    setData((old) => ({ ...old, daily: { ...old.daily, [dailyKey]: { ...(old.daily[dailyKey] ?? blankDaily), [field]: value, updatedAt: new Date().toISOString() } } }));
  }
  function updateRevision(field: keyof Revision, value: string) {
    setData((old) => ({ ...old, revision: { ...old.revision, [String(week)]: { ...(old.revision[String(week)] ?? blankRevision), [field]: value, updatedAt: new Date().toISOString() } } }));
  }
  function exportBackup() {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ ...data, exportedAt: new Date().toISOString(), schema: 1 }, null, 2)], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = "dsa-study-notes-backup.json"; a.click(); URL.revokeObjectURL(url); setStatus("Backup exported");
  }
  function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed.daily || !parsed.revision) throw new Error("Invalid backup");
        if (confirm("This replaces the notes currently stored in this browser. Continue?")) { setData({ daily: parsed.daily, revision: parsed.revision }); setStatus("Backup imported"); }
      } catch { setStatus("Invalid backup file"); }
      event.target.value = "";
    };
    reader.readAsText(file);
  }
  function clearNote() {
    if (!confirm("Clear this note? Export a backup first if you may need it.")) return;
    setData((old) => {
      if (mode === "daily") { const daily = { ...old.daily }; delete daily[dailyKey]; return { ...old, daily }; }
      const revision = { ...old.revision }; delete revision[String(week)]; return { ...old, revision };
    });
  }

  return <main className="dsa-app">
    <aside className="dsa-sidebar">
      <a className="dsa-brand" href="/"><span className="dsa-brand-icon"><BookOpen size={19}/></span><span><strong>DSA <em>Notebook</em></strong><small>12-WEEK PREPARATION</small></span></a>
      <div className="dsa-side-label">YOUR WORKSPACE</div>
      <button className={mode === "daily" ? "dsa-nav active" : "dsa-nav"} onClick={() => setMode("daily")}><FileText size={16}/> Daily notes</button>
      <button className={mode === "revision" ? "dsa-nav active" : "dsa-nav"} onClick={() => setMode("revision")}><RotateCcw size={16}/> Weekly revision</button>
      <div className="dsa-side-label dsa-weeks-label">12-WEEK ROADMAP</div>
      <label className="dsa-search"><Search size={14}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a topic..."/></label>
      <nav className="dsa-week-list">{matchingWeeks.map(({ item, number }) => {
        const done = Array.from({ length: 6 }, (_, i) => data.daily[keyFor(number, i + 1)]?.status).filter((s) => s === "Completed").length;
        return <button key={number} className={week === number ? "dsa-week active" : "dsa-week"} onClick={() => { setWeek(number); setDay(1); }}><span className="dsa-week-num">{String(number).padStart(2, "0")}</span><span className="dsa-week-title">Week {number}<small>{item[0]}</small></span><span className="dsa-week-progress">{done}/6</span></button>;
      })}{!matchingWeeks.length && <p className="dsa-no-results">No matching topics.</p>}</nav>
      <div className="dsa-sidebar-bottom"><span className="dsa-storage-dot"/> Autosaves in this browser<small>Export backups regularly. Notes do not sync between devices.</small></div>
    </aside>
    <section className="dsa-main">
      <header className="dsa-topbar"><div className="dsa-breadcrumb"><a href="/">Command Center</a><span>/</span><strong>DSA Notebook</strong></div><div className="dsa-top-actions"><span className="dsa-save-status">{loaded ? status : "Loading notes..."}</span><button className="dsa-button secondary" onClick={exportBackup}><Download size={14}/> Export backup</button><label className="dsa-button secondary dsa-import">Import backup<input type="file" accept=".json,application/json" onChange={importBackup}/></label></div></header>
      <div className="dsa-content">
        <div className="dsa-heading-row"><div><div className="dsa-eyebrow"><span/> JAVA · DATA STRUCTURES & ALGORITHMS</div><h1>Your DSA <span>Notebook</span></h1><p>Daily learning, LeetCode solutions, mistakes, and weekly revision — in one place.</p></div><div className="dsa-date">12-week study plan</div></div>
        <div className="dsa-stats">
          <div className="dsa-stat"><span>DAILY SESSIONS COMPLETED</span><strong>{doneDays}<small> / 72</small></strong><div className="dsa-progress"><i style={{ width: `${Math.min(100, doneDays / 72 * 100)}%` }}/></div></div>
          <div className="dsa-stat"><span>WEEKLY REVIEWS WRITTEN</span><strong>{reviewedWeeks}<small> / 12</small></strong><div className="dsa-progress"><i style={{ width: `${reviewedWeeks / 12 * 100}%` }}/></div></div>
          <div className="dsa-stat"><span>DAILY NOTES STARTED</span><strong>{startedDays}<small> / 72</small></strong><div className="dsa-progress"><i style={{ width: `${Math.min(100, startedDays / 72 * 100)}%` }}/></div></div>
        </div>
        <section className="dsa-week-banner"><div className="dsa-week-badge">WEEK {String(week).padStart(2, "0")}</div><div className="dsa-week-banner-copy"><h2>{weeks[week - 1][0]}</h2><p>{weeks[week - 1][1]}</p><span>Target: {weeks[week - 1][2]} new LeetCode problems</span></div><div className="dsa-week-switch"><button aria-label="Previous week" disabled={week === 1} onClick={() => { setWeek(week - 1); setDay(1); }}><ChevronLeft size={17}/></button><button aria-label="Next week" disabled={week === 12} onClick={() => { setWeek(week + 1); setDay(1); }}><ChevronRight size={17}/></button></div></section>
        <div className="dsa-editor-toolbar"><div className="dsa-tabs"><button className={mode === "daily" ? "active" : ""} onClick={() => setMode("daily")}>Daily notes</button><button className={mode === "revision" ? "active" : ""} onClick={() => setMode("revision")}>Weekly revision</button></div><button className="dsa-clear" onClick={clearNote}>Clear current note</button></div>
        {mode === "daily" ? <section className="dsa-note-panel">
          <div className="dsa-day-selector"><div><span className="dsa-section-kicker">DAILY STUDY LOG</span><h2>Week {week} · Day {day}</h2><p>Capture what you learned and what you need to revisit.</p></div><div className="dsa-day-controls"><button aria-label="Previous day" disabled={day === 1} onClick={() => setDay(day - 1)}><ChevronLeft size={16}/></button><span>Day {day} of 6</span><button aria-label="Next day" disabled={day === 6} onClick={() => setDay(day + 1)}><ChevronRight size={16}/></button></div></div>
          <div className="dsa-day-track">{Array.from({ length: 6 }, (_, i) => { const d = i + 1; const n = data.daily[keyFor(week, d)]; return <button key={d} className={day === d ? "active" : ""} onClick={() => setDay(d)}><span>{n?.status === "Completed" ? <CheckCircle2 size={15}/> : String(d).padStart(2, "0")}</span><small>Day {d}</small></button>; })}</div>
          <div className="dsa-form-grid">
            <label className="dsa-field full"><span>Concepts learned</span><small>Explain the idea in your own words. Include patterns and key rules.</small><textarea rows={4} value={note.concepts} onChange={(e) => updateDaily("concepts", e.target.value)} placeholder={"Today I learned...\nKey idea:\nWhen to use it:"}/></label>
            <label className="dsa-field"><span>LeetCode problems</span><small>Problem number, title, result, and approach.</small><textarea rows={5} value={note.problems} onChange={(e) => updateDaily("problems", e.target.value)} placeholder={"217. Contains Duplicate — attempted / solved\nApproach: HashSet"}/></label>
            <label className="dsa-field"><span>Java code / patterns</span><small>Save reusable syntax or solutions you understand.</small><textarea className="dsa-code-area" rows={5} spellCheck={false} value={note.code} onChange={(e) => updateDaily("code", e.target.value)} placeholder="Paste Java snippets here..."/></label>
            <label className="dsa-field"><span>Mistakes and edge cases</span><small>Record bugs, wrong assumptions, and what fixed them.</small><textarea rows={4} value={note.mistakes} onChange={(e) => updateDaily("mistakes", e.target.value)} placeholder={"Mistake: used nums instead of num\nCorrection: ..."} /></label>
            <label className="dsa-field"><span>Complexity analysis</span><small>Time, auxiliary space, and why.</small><textarea rows={4} value={note.complexity} onChange={(e) => updateDaily("complexity", e.target.value)} placeholder={"Time: O(n) — one pass\nSpace: O(n) — HashSet"} /></label>
          </div>
          <div className="dsa-note-footer"><label className="dsa-status-label">Session status<select value={note.status} onChange={(e) => updateDaily("status", e.target.value)}><option>Not started</option><option>In progress</option><option>Completed</option></select></label><span className="dsa-auto-save">{note.updatedAt ? `Edited ${new Date(note.updatedAt).toLocaleString()}` : "Changes autosave as you type"}</span><button className="dsa-button primary" onClick={() => updateDaily("status", "Completed")}><CheckCircle2 size={15}/> Mark day complete</button></div>
        </section> : <section className="dsa-note-panel">
          <div className="dsa-day-selector"><div><span className="dsa-section-kicker">WEEKLY CONSOLIDATION</span><h2>Week {week} revision</h2><p>Summarize the week before moving to the next topic.</p></div><div className="dsa-revision-mark"><RotateCcw size={16}/> Review {week} of 12</div></div>
          <div className="dsa-revision-callout"><strong>Revision checklist</strong><span>Revisit difficult problems, explain patterns without notes, and solve at least one old problem from memory.</span></div>
          <div className="dsa-form-grid">
            <label className="dsa-field full"><span>Weekly summary</span><small>What did you learn? What can you now explain confidently?</small><textarea rows={5} value={revision.summary} onChange={(e) => updateRevision("summary", e.target.value)} placeholder="Summarize the most important concepts..."/></label>
            <label className="dsa-field"><span>Patterns worth remembering</span><small>When to use each pattern and its template.</small><textarea rows={5} value={revision.patterns} onChange={(e) => updateRevision("patterns", e.target.value)} placeholder="Pattern → recognition clues → approach..."/></label>
            <label className="dsa-field"><span>Recurring mistakes</span><small>Write the mistake and the rule that prevents it.</small><textarea rows={5} value={revision.mistakes} onChange={(e) => updateRevision("mistakes", e.target.value)} placeholder="Mistake → why it happened → correction..."/></label>
            <label className="dsa-field"><span>Problems to solve again</span><small>List problem numbers you could not solve independently.</small><textarea rows={4} value={revision.redo} onChange={(e) => updateRevision("redo", e.target.value)} placeholder="Problem number — reason to revisit..."/></label>
            <label className="dsa-field"><span>Weekly assessment</span><small>Score, timing, confidence, and weak topics.</small><textarea rows={4} value={revision.assessment} onChange={(e) => updateRevision("assessment", e.target.value)} placeholder={"Score:\nIndependent solves:\nWeak topics next week:"}/></label>
          </div>
          <div className="dsa-note-footer"><span className="dsa-auto-save">{revision.updatedAt ? `Edited ${new Date(revision.updatedAt).toLocaleString()}` : "Changes autosave as you type"}</span><button className="dsa-button primary" disabled={week === 12} onClick={() => { setWeek(Math.min(12, week + 1)); setDay(1); setMode("daily"); }}><ChevronRight size={15}/> Next week</button></div>
        </section>}
        <footer className="dsa-footer"><span>12-WEEK JAVA DSA PLAN</span><span>{doneDays} daily sessions complete · {reviewedWeeks} weekly reviews written</span></footer>
      </div>
    </section>
  </main>;
}
