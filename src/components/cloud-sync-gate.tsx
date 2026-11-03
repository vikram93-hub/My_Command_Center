"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

const STORAGE_KEYS = [
  "command-center-roadmaps",
  "command-center-projects",
  "command-center-tasks",
  "command-center-settings",
  "command-center-weekly-classes",
  "command-center-semester",
  "command-center-habits",
  "command-center-focus-stats",
] as const;
const TABLE = "command_center_workspaces";

type WorkspaceData = Record<string, string>;
type Props = { children: ReactNode };

function readLocalWorkspace(): WorkspaceData {
  const data: WorkspaceData = {};
  for (const key of STORAGE_KEYS) {
    const value = window.localStorage.getItem(key);
    if (value !== null) data[key] = value;
  }
  return data;
}

function writeLocalWorkspace(data: Record<string, unknown>, merge = false) {
  if (!merge) {
    for (const key of STORAGE_KEYS) window.localStorage.removeItem(key);
  }
  for (const key of STORAGE_KEYS) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];
      window.localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
    }
  }
}

function hasWorkspaceData(data: WorkspaceData) {
  return Object.keys(data).some((key) => {
    try {
      const parsed = JSON.parse(data[key]);
      return Array.isArray(parsed) ? parsed.length > 0 : parsed && Object.keys(parsed).length > 0;
    } catch {
      return Boolean(data[key]);
    }
  });
}

function makeSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
}

const inputStyle = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: 9,
  border: "1px solid #343744",
  background: "#171923",
  color: "#f4f4f5",
  fontSize: 14,
  outline: "none",
};
const buttonStyle = {
  width: "100%",
  padding: "13px 16px",
  border: 0,
  borderRadius: 9,
  background: "#a78bfa",
  color: "#171321",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
};
const secondaryButtonStyle = {
  ...buttonStyle,
  background: "#262936",
  border: "1px solid #3b4050",
  color: "#f4f4f5",
};

export default function CloudSyncGate({ children }: Props) {
  const supabase = useRef<SupabaseClient | null>(null);
  const [configured, setConfigured] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [migrationNeeded, setMigrationNeeded] = useState(false);
  const [syncReady, setSyncReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState("Connecting");
  const [backupFile, setBackupFile] = useState<File | null>(null);
  const lastUpdated = useRef<string | null>(null);
  const suppressSync = useRef(false);
  const pendingSync = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userRef = useRef<User | null>(null);

  useEffect(() => {
    const client = makeSupabaseClient();
    supabase.current = client;
    setConfigured(Boolean(client));
    if (!client) {
      setLoading(false);
      return;
    }

    client.auth.getSession().then(({ data, error: sessionError }) => {
      if (sessionError) setError(sessionError.message);
      setUser(data.session?.user ?? null);
      userRef.current = data.session?.user ?? null;
      setLoading(false);
    });

    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      userRef.current = session?.user ?? null;
      setSyncReady(false);
      setMigrationNeeded(false);
      setError("");
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const client = supabase.current;
    if (!client || !user) return;
    let cancelled = false;
    setLoading(true);
    setSyncStatus("Loading cloud workspace");

    async function loadWorkspace() {
      const { data, error: loadError } = await client
        .from(TABLE)
        .select("data, updated_at")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (cancelled) return;
      if (loadError) {
        setError("Could not load your cloud workspace: " + loadError.message);
        setLoading(false);
        return;
      }

      if (data) {
        suppressSync.current = true;
        writeLocalWorkspace((data.data ?? {}) as Record<string, unknown>);
        lastUpdated.current = data.updated_at ?? null;
        window.setTimeout(() => { suppressSync.current = false; }, 0);
        setSyncReady(true);
        setSyncStatus("Synced");
      } else {
        setMigrationNeeded(true);
        setSyncStatus("Waiting for first import");
      }
      setLoading(false);
    }

    loadWorkspace();
    return () => { cancelled = true; };
  }, [user]);

  async function saveWorkspace(data: WorkspaceData): Promise<boolean> {
    const client = supabase.current;
    const currentUser = userRef.current;
    if (!client || !currentUser) return false;
    setSyncStatus("Syncing");
    const { data: saved, error: saveError } = await client
      .from(TABLE)
      .upsert({ user_id: currentUser.id, data }, { onConflict: "user_id" })
      .select("updated_at")
      .single();

    if (saveError) {
      setSyncStatus("Sync error");
      setError("Cloud save failed: " + saveError.message);
      return false;
    }
    lastUpdated.current = saved?.updated_at ?? new Date().toISOString();
    setSyncStatus("Synced");
    setError("");
    return true;
  }

  async function migrateCurrentBrowser() {
    const data = readLocalWorkspace();
    if (!hasWorkspaceData(data)) {
      setError("No saved dashboard data was found in this browser. Import your JSON backup instead.");
      return;
    }
    const saved = await saveWorkspace(data);
    if (saved) {
      setMigrationNeeded(false);
      setSyncReady(true);
      setMessage("Your existing browser data is now backed up to your account.");
    }
  }

  async function importBackup() {
    if (!backupFile) {
      setError("Choose your Command Center JSON backup first.");
      return;
    }
    try {
      const parsed = JSON.parse(await backupFile.text());
      const imported = parsed?.data;
      if (!imported || typeof imported !== "object" || Array.isArray(imported)) {
        throw new Error("This file does not look like a Command Center export.");
      }
      const allowed: WorkspaceData = {};
      for (const key of STORAGE_KEYS) {
        if (Object.prototype.hasOwnProperty.call(imported, key)) {
          allowed[key] = typeof imported[key] === "string" ? imported[key] : JSON.stringify(imported[key]);
        }
      }
      if (!hasWorkspaceData(allowed)) throw new Error("The backup does not contain any dashboard data.");
      const existing = readLocalWorkspace();
      const merged = { ...existing, ...allowed };
      suppressSync.current = true;
      writeLocalWorkspace(merged);
      const saved = await saveWorkspace(merged);
      suppressSync.current = false;
      if (!saved) return;
      setMigrationNeeded(false);
      setSyncReady(true);
      setMessage("Backup imported and synced. Your dashboard is ready.");
    } catch (importError) {
      suppressSync.current = false;
      setError(importError instanceof Error ? importError.message : "Could not import this backup.");
    }
  }

  useLayoutEffect(() => {
    if (!syncReady || !user || !supabase.current) return;
    const originalSetItem = Storage.prototype.setItem;
    const originalRemoveItem = Storage.prototype.removeItem;

    const scheduleSync = () => {
      if (suppressSync.current) return;
      if (pendingSync.current) window.clearTimeout(pendingSync.current);
      setSyncStatus("Changes pending");
      pendingSync.current = window.setTimeout(() => {
        void saveWorkspace(readLocalWorkspace());
      }, 800);
    };

    Storage.prototype.setItem = function (key: string, value: string) {
      originalSetItem.call(this, key, value);
      if (this === window.localStorage && (STORAGE_KEYS as readonly string[]).includes(key)) scheduleSync();
    };
    Storage.prototype.removeItem = function (key: string) {
      originalRemoveItem.call(this, key);
      if (this === window.localStorage && (STORAGE_KEYS as readonly string[]).includes(key)) scheduleSync();
    };

    const pollId = window.setInterval(async () => {
      const client = supabase.current;
      const currentUser = userRef.current;
      if (!client || !currentUser || pendingSync.current) return;
      const { data, error: pollError } = await client
        .from(TABLE)
        .select("data, updated_at")
        .eq("user_id", currentUser.id)
        .maybeSingle();
      if (pollError || !data?.updated_at || data.updated_at === lastUpdated.current) return;
      suppressSync.current = true;
      writeLocalWorkspace((data.data ?? {}) as Record<string, unknown>);
      lastUpdated.current = data.updated_at;
      window.location.reload();
    }, 20000);

    return () => {
      Storage.prototype.setItem = originalSetItem;
      Storage.prototype.removeItem = originalRemoveItem;
      window.clearInterval(pollId);
      if (pendingSync.current) window.clearTimeout(pendingSync.current);
    };
  }, [syncReady, user]);

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const client = supabase.current;
    if (!client) return;
    if (!email.trim() || password.length < 8) {
      setError("Enter a valid email and a password with at least 8 characters.");
      return;
    }
    setLoading(true);
    const result = authMode === "signup"
      ? await client.auth.signUp({ email: email.trim(), password })
      : await client.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    if (authMode === "signup" && !result.data.session) {
      setMessage("Account created. Check your email to confirm it, then sign in here.");
    } else {
      setMessage(authMode === "signup" ? "Account created." : "Signed in.");
    }
  }

  async function signOut() {
    await supabase.current?.auth.signOut();
    setSyncReady(false);
    setMigrationNeeded(false);
    setUser(null);
  }

  function onBackupChange(event: ChangeEvent<HTMLInputElement>) {
    setBackupFile(event.target.files?.[0] ?? null);
  }

  if (!configured) {
    return (
      <GateShell>
        <h1>Connect your cloud workspace</h1>
        <p>Supabase environment variables are missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your local .env.local file and Vercel project settings, then redeploy.</p>
      </GateShell>
    );
  }

  if (loading) {
    return <GateShell><p>Loading your secure workspace…</p></GateShell>;
  }

  if (!user) {
    return (
      <GateShell>
        <div style={{ fontSize: 11, letterSpacing: 2, color: "#a78bfa", fontWeight: 700, marginBottom: 14 }}>MY COMMAND CENTER</div>
        <h1>{authMode === "login" ? "Welcome back." : "Create your account."}</h1>
        <p>Sign in with the same account on your laptop and phone. Your workspace will sync between them.</p>
        <form onSubmit={submitAuth} style={{ display: "grid", gap: 12, marginTop: 24 }}>
          <input style={inputStyle} type="email" autoComplete="email" placeholder="Email address" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <input style={inputStyle} type="password" autoComplete={authMode === "signup" ? "new-password" : "current-password"} placeholder="Password (at least 8 characters)" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} />
          <button style={buttonStyle} type="submit" disabled={loading}>{loading ? "Please wait…" : authMode === "login" ? "Sign in" : "Create account"}</button>
        </form>
        <button type="button" onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setError(""); setMessage(""); }} style={{ ...secondaryButtonStyle, marginTop: 12 }}>
          {authMode === "login" ? "New here? Create an account" : "Already registered? Sign in"}
        </button>
        {message && <p role="status" style={{ color: "#a7f3d0", marginTop: 16 }}>{message}</p>}
        {error && <p role="alert" style={{ color: "#fca5a5", marginTop: 16 }}>{error}</p>}
      </GateShell>
    );
  }

  if (migrationNeeded) {
    return (
      <GateShell>
        <div style={{ fontSize: 11, letterSpacing: 2, color: "#a78bfa", fontWeight: 700, marginBottom: 14 }}>FIRST-TIME SETUP</div>
        <h1>Bring your workspace over.</h1>
        <p>Your account is ready. Choose how to move your existing dashboard data into your private cloud workspace. This step runs once.</p>
        <button type="button" style={{ ...buttonStyle, marginTop: 22 }} onClick={migrateCurrentBrowser}>Migrate data from this browser</button>
        <div style={{ borderTop: "1px solid #303442", margin: "24px 0", paddingTop: 20 }}>
          <label style={{ display: "grid", gap: 10, color: "#d4d4d8", fontSize: 13, fontWeight: 600 }}>
            Or import the JSON backup
            <input type="file" accept="application/json,.json" onChange={onBackupChange} style={{ color: "#c4c4cc", fontSize: 13 }} />
          </label>
          <button type="button" style={{ ...secondaryButtonStyle, marginTop: 14 }} onClick={importBackup}>Import backup and sync</button>
        </div>
        {message && <p role="status" style={{ color: "#a7f3d0", marginTop: 16 }}>{message}</p>}
        {error && <p role="alert" style={{ color: "#fca5a5", marginTop: 16 }}>{error}</p>}
        <button type="button" onClick={signOut} style={{ ...secondaryButtonStyle, marginTop: 18 }}>Sign out</button>
      </GateShell>
    );
  }

  return (
    <>
      <div style={{ position: "sticky", top: 0, zIndex: 1000, minHeight: 34, padding: "7px 14px", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12, background: "#11131b", color: "#c4c4cc", borderBottom: "1px solid #292d39", fontSize: 11 }}>
        <span style={{ color: syncStatus === "Synced" ? "#a7f3d0" : "#fcd34d" }}>{syncStatus}</span>
        <span style={{ maxWidth: 170, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</span>
        <button type="button" onClick={signOut} style={{ color: "#c4c4cc", background: "transparent", border: 0, cursor: "pointer", fontSize: 11 }}>Sign out</button>
      </div>
      {message && <div role="status" style={{ padding: 8, textAlign: "center", background: "#15342c", color: "#a7f3d0", fontSize: 12 }}>{message}</div>}
      {children}
    </>
  );
}

function GateShell({ children }: { children: ReactNode }) {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20, background: "#0d0f16", color: "#f4f4f5", fontFamily: "Arial, sans-serif" }}>
      <section style={{ width: "min(100%, 430px)", padding: 30, border: "1px solid #2a2e3b", borderRadius: 16, background: "#141720", boxShadow: "0 24px 80px #0006" }}>
        {children}
        {errorPlaceholder}
      </section>
    </main>
  );
}

const errorPlaceholder = null;
