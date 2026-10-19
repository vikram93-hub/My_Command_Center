"use client";
import { useEffect, useState, type FormEvent } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ListTodo,
  TrendingUp,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarDays,
  CalendarCheck,
  Check,
  ChevronDown,
  Clock3,
  Command,
  Download,
  Flame,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Moon,
  MoreHorizontal,
  Plus,
  Pencil,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Search,
  Settings,
  Sparkles,
  Sun,
  Target,
  Timer,
  Trash2,
  X,
  Zap,
} from "lucide-react";

const initialTasks = [
  {
    id: 1,
    title: "Revise arrays and strings",
    category: "DSA · Java",
    time: "45 min",
    done: false,
  },
  {
    id: 2,
    title: "Complete React fundamentals",
    category: "Web development",
    time: "60 min",
    done: false,
  },
  {
    id: 3,
    title: "Review today's lecture notes",
    category: "College",
    time: "30 min",
    done: true,
  },
  {
    id: 4,
    title: "Read 10 pages",
    category: "Personal growth",
    time: "20 min",
    done: false,
  },
];

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Tasks", icon: Check },
  { label: "Calendar", icon: CalendarDays },
  { label: "Roadmaps", icon: BookOpen },
  { label: "Projects", icon: FolderKanban },
  { label: "Habits", icon: Activity },
];

const schedule = [
  {
    time: "09:00",
    end: "10:00",
    title: "Deep work session",
    detail: "DSA practice",
    color: "purple",
  },
  {
    time: "10:30",
    end: "12:00",
    title: "Learning block",
    detail: "React & TypeScript",
    color: "blue",
  },
  {
    time: "14:00",
    end: "15:00",
    title: "Project development",
    detail: "My Command Center",
    color: "green",
  },
];

type Habit = {
  id: string;
  name: string;
  createdAt: string;
  completedDates: string[];
};

function indiaDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

type ClassEntry = {
  id: string;
  day: string;
  subject: string;
  start: string;
  end: string;
  location: string;
};

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const defaultClassForm = { day: "Monday", subject: "", start: "09:00", end: "10:00", location: "" };

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

type ProjectStatus = "Planning" | "In progress" | "On hold" | "Completed";
type ProjectPriority = "Low" | "Medium" | "High";
type Project = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  deadline: string;
  repoUrl: string;
  liveUrl: string;
  createdAt: string;
};
const emptyProjectForm = { title: "", description: "", category: "Development", status: "Planning" as ProjectStatus, priority: "Medium" as ProjectPriority, deadline: "", repoUrl: "", liveUrl: "" };

type RoadmapStep = { id: string; title: string; done: boolean };
type Roadmap = { id: string; title: string; description: string; category: string; targetDate: string; steps: RoadmapStep[]; createdAt: string };
const emptyRoadmapForm = { title: "", description: "", category: "Software Engineering", targetDate: "", stepsText: "" };

export default function Home() {
  const [referenceDate, setReferenceDate] = useState<Date | null>(null);
  const [tasks, setTasks] = useState(initialTasks);
  const [tasksLoaded, setTasksLoaded] = useState(false);
  const [dark, setDark] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [displayName, setDisplayName] = useState("My profile");
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">("default");
  const [settingsMessage, setSettingsMessage] = useState("");
  const [settingsDataMessage, setSettingsDataMessage] = useState("");
  const [reminderPreferences, setReminderPreferences] = useState({
    tasks: { enabled: false, time: "09:00" },
    habits: { enabled: false, time: "20:00" },
    classes: { enabled: false, time: "08:00" },
    focus: { enabled: false, time: "14:00" },
  });
  const [activePage, setActivePage] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [analyticsRange, setAnalyticsRange] = useState<"7d" | "30d" | "all">("7d");
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [classes, setClasses] = useState<ClassEntry[]>([]);
  const [classesLoaded, setClassesLoaded] = useState(false);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [classForm, setClassForm] = useState(defaultClassForm);
  const [showClassForm, setShowClassForm] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [semesterStart, setSemesterStart] = useState("");
  const [semesterEnd, setSemesterEnd] = useState("");
  const [timerMode, setTimerMode] = useState<"focus" | "break">("focus");
  const [focusDuration, setFocusDuration] = useState(25);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [focusStats, setFocusStats] = useState({ date: "", sessions: 0, minutes: 0 });
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitsLoaded, setHabitsLoaded] = useState(false);
  const [habitName, setHabitName] = useState("");
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectFilter, setProjectFilter] = useState<"All" | ProjectStatus>("All");
  const [projectSearch, setProjectSearch] = useState("");
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [roadmapsLoaded, setRoadmapsLoaded] = useState(false);
  const [showRoadmapForm, setShowRoadmapForm] = useState(false);
  const [roadmapForm, setRoadmapForm] = useState(emptyRoadmapForm);
  const [editingRoadmapId, setEditingRoadmapId] = useState<string | null>(null);
  const [roadmapSearch, setRoadmapSearch] = useState("");
  const [expandedRoadmapId, setExpandedRoadmapId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("command-center-roadmaps");
      if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed)) setRoadmaps(parsed); }
    } catch (error) { console.error("Could not load roadmaps:", error); }
    finally { setRoadmapsLoaded(true); }
  }, []);

  useEffect(() => {
    if (!roadmapsLoaded) return;
    try { window.localStorage.setItem("command-center-roadmaps", JSON.stringify(roadmaps)); }
    catch (error) { console.error("Could not save roadmaps:", error); }
  }, [roadmaps, roadmapsLoaded]);

  function saveRoadmap(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = roadmapForm.title.trim();
    if (!title) return;
    const existing = roadmaps.find((item) => item.id === editingRoadmapId);
    const steps = roadmapForm.stepsText.split("\n").map((line) => line.trim()).filter(Boolean).map((stepTitle) => {
      const previous = existing?.steps.find((step) => step.title === stepTitle);
      return { id: previous?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, title: stepTitle, done: previous?.done ?? false };
    });
    const next: Roadmap = { id: editingRoadmapId ?? `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, title, description: roadmapForm.description.trim(), category: roadmapForm.category, targetDate: roadmapForm.targetDate, steps, createdAt: existing?.createdAt ?? todayKey };
    setRoadmaps((current) => editingRoadmapId ? current.map((item) => item.id === editingRoadmapId ? next : item) : [next, ...current]);
    setRoadmapForm(emptyRoadmapForm); setEditingRoadmapId(null); setShowRoadmapForm(false); setExpandedRoadmapId(next.id);
  }

  function editRoadmap(item: Roadmap) {
    setRoadmapForm({ title: item.title, description: item.description, category: item.category, targetDate: item.targetDate, stepsText: item.steps.map((step) => step.title).join("\n") });
    setEditingRoadmapId(item.id); setShowRoadmapForm(true);
  }

  function deleteRoadmap(id: string) {
    if (!window.confirm("Delete this roadmap and its milestone progress?")) return;
    setRoadmaps((current) => current.filter((item) => item.id !== id));
    if (editingRoadmapId === id) { setEditingRoadmapId(null); setRoadmapForm(emptyRoadmapForm); setShowRoadmapForm(false); }
  }

  function toggleRoadmapStep(roadmapId: string, stepId: string) {
    setRoadmaps((current) => current.map((item) => item.id === roadmapId ? { ...item, steps: item.steps.map((step) => step.id === stepId ? { ...step, done: !step.done } : step) } : item));
  }

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("command-center-projects");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setProjects(parsed);
      }
    } catch (error) {
      console.error("Could not load projects:", error);
    } finally {
      setProjectsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!projectsLoaded) return;
    try {
      window.localStorage.setItem("command-center-projects", JSON.stringify(projects));
    } catch (error) {
      console.error("Could not save projects:", error);
    }
  }, [projects, projectsLoaded]);

  function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = projectForm.title.trim();
    if (!title) return;
    const nextProject: Project = {
      ...projectForm,
      title,
      description: projectForm.description.trim(),
      repoUrl: projectForm.repoUrl.trim(),
      liveUrl: projectForm.liveUrl.trim(),
      id: editingProjectId ?? `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: editingProjectId ? projects.find((item) => item.id === editingProjectId)?.createdAt ?? todayKey : todayKey,
    };
    setProjects((current) => editingProjectId
      ? current.map((item) => item.id === editingProjectId ? nextProject : item)
      : [nextProject, ...current]);
    setProjectForm(emptyProjectForm);
    setEditingProjectId(null);
    setShowProjectForm(false);
  }

  function editProject(project: Project) {
    const { title, description, category, status, priority, deadline, repoUrl, liveUrl } = project;
    setProjectForm({ title, description, category, status, priority, deadline, repoUrl, liveUrl });
    setEditingProjectId(project.id);
    setShowProjectForm(true);
  }

  function deleteProject(id: string) {
    if (!window.confirm("Delete this project? This cannot be undone.")) return;
    setProjects((current) => current.filter((project) => project.id !== id));
    if (editingProjectId === id) {
      setEditingProjectId(null);
      setProjectForm(emptyProjectForm);
      setShowProjectForm(false);
    }
  }

  const completed = tasks.filter((task) => task.done).length;
  const progress = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  const [today, setToday] = useState("");
  const [todayDayName, setTodayDayName] = useState("Monday");

  useEffect(() => {
    try {
      const savedTasks = window.localStorage.getItem("command-center-tasks");
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);
        if (Array.isArray(parsedTasks)) setTasks(parsedTasks);
      }
    } catch (error) {
      console.error("Could not load saved tasks:", error);
    } finally {
      setTasksLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!tasksLoaded) return;
    try {
      window.localStorage.setItem("command-center-tasks", JSON.stringify(tasks));
    } catch (error) {
      console.error("Could not save tasks:", error);
    }
  }, [tasks, tasksLoaded]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("command-center-settings");
      if (saved) {
        const preferences = JSON.parse(saved);
        if (typeof preferences.dark === "boolean") setDark(preferences.dark);
        if (typeof preferences.displayName === "string" && preferences.displayName.trim()) {
          setDisplayName(preferences.displayName);
        }
        if ([25, 50, 90].includes(preferences.focusDuration)) {
          setFocusDuration(preferences.focusDuration);
        }
        if (preferences.reminderPreferences && typeof preferences.reminderPreferences === "object") {
          const defaults = {
            tasks: { enabled: false, time: "09:00" },
            habits: { enabled: false, time: "20:00" },
            classes: { enabled: false, time: "08:00" },
            focus: { enabled: false, time: "14:00" },
          };
          const loaded = preferences.reminderPreferences;
          setReminderPreferences(Object.fromEntries(Object.keys(defaults).map((key) => {
            const candidate = loaded[key];
            return [key, candidate && typeof candidate === "object" ? {
              enabled: typeof candidate.enabled === "boolean" ? candidate.enabled : false,
              time: typeof candidate.time === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(candidate.time) ? candidate.time : defaults[key as keyof typeof defaults].time,
            } : defaults[key as keyof typeof defaults]];
          })) as typeof defaults);
        }
      }
      if ("Notification" in window) setNotificationPermission(Notification.permission);
      else setNotificationPermission("unsupported");
    } catch (error) {
      console.error("Could not load settings:", error);
    } finally {
      setSettingsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!settingsLoaded) return;
    try {
      window.localStorage.setItem("command-center-settings", JSON.stringify({ dark, displayName, focusDuration, reminderPreferences }));
    } catch (error) {
      console.error("Could not save settings:", error);
    }
  }, [dark, displayName, focusDuration, reminderPreferences, settingsLoaded]);

  useEffect(() => {
    if (!settingsLoaded || notificationPermission !== "granted") return;
    const sent = new Set<string>();
    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const date = indiaDateKey(now);
      const labels: Record<string, string> = {
        tasks: "Review your open tasks",
        habits: "Check in on your daily habits",
        classes: "Check your class schedule",
        focus: "Time for a focused work block",
      };
      for (const [key, preference] of Object.entries(reminderPreferences)) {
        const reminderId = `${date}:${key}:${currentTime}`;
        if (preference.enabled && preference.time === currentTime && !sent.has(reminderId)) {
          try {
            new Notification("My Command Center", { body: labels[key] || "Your scheduled reminder", tag: reminderId });
            sent.add(reminderId);
          } catch (error) {
            console.error("Could not show reminder:", error);
          }
        }
      }
    };
    checkReminders();
    const intervalId = window.setInterval(checkReminders, 15000);
    return () => window.clearInterval(intervalId);
  }, [settingsLoaded, notificationPermission, reminderPreferences]);

  useEffect(() => {
    try {
      const savedClasses = window.localStorage.getItem("command-center-weekly-classes");
      const savedSemester = window.localStorage.getItem("command-center-semester");
      if (savedClasses) {
        const parsed = JSON.parse(savedClasses);
        if (Array.isArray(parsed)) setClasses(parsed);
      }
      if (savedSemester) {
        const parsed = JSON.parse(savedSemester);
        if (parsed && typeof parsed === "object") {
          setSemesterStart(parsed.start || "");
          setSemesterEnd(parsed.end || "");
        }
      }
    } catch (error) {
      console.error("Could not load timetable:", error);
    } finally {
      setClassesLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!classesLoaded) return;
    try {
      window.localStorage.setItem("command-center-weekly-classes", JSON.stringify(classes));
      window.localStorage.setItem("command-center-semester", JSON.stringify({ start: semesterStart, end: semesterEnd }));
    } catch (error) {
      console.error("Could not save timetable:", error);
    }
  }, [classes, classesLoaded, semesterStart, semesterEnd]);

  useEffect(() => {
    try {
      const savedHabits = window.localStorage.getItem("command-center-habits");
      if (savedHabits) {
        const parsed = JSON.parse(savedHabits);
        if (Array.isArray(parsed)) setHabits(parsed);
      }
    } catch (error) {
      console.error("Could not load habits:", error);
    } finally {
      setHabitsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!habitsLoaded) return;
    try {
      window.localStorage.setItem("command-center-habits", JSON.stringify(habits));
    } catch (error) {
      console.error("Could not save habits:", error);
    }
  }, [habits, habitsLoaded]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("command-center-focus-stats");
      if (saved) {
        const parsed = JSON.parse(saved);
        const localDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
        if (parsed && parsed.date === localDate && Number.isFinite(parsed.sessions) && Number.isFinite(parsed.minutes)) {
          setFocusStats(parsed);
        }
      }
    } catch (error) {
      console.error("Could not load focus stats:", error);
    }
  }, []);

  useEffect(() => {
    if (!focusStats.date) return;
    try {
      window.localStorage.setItem("command-center-focus-stats", JSON.stringify(focusStats));
    } catch (error) {
      console.error("Could not save focus stats:", error);
    }
  }, [focusStats]);

  useEffect(() => {
    if (!timerRunning) return;
    if (remainingSeconds <= 0) {
      setTimerRunning(false);
      setSessionFinished(true);
      if (timerMode === "focus") {
        const localDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
        setFocusStats((currentStats) => {
          const next = currentStats.date === localDate
            ? { date: localDate, sessions: currentStats.sessions + 1, minutes: currentStats.minutes + focusDuration }
            : { date: localDate, sessions: 1, minutes: focusDuration };
          return next;
        });
      }
      return;
    }
    const timeoutId = window.setTimeout(() => setRemainingSeconds((current) => Math.max(current - 1, 0)), 1000);
    return () => window.clearTimeout(timeoutId);
  }, [timerRunning, remainingSeconds, timerMode, focusDuration]);

  useEffect(() => {
    if (timerMode === "focus") setRemainingSeconds(focusDuration * 60);
    else setRemainingSeconds(5 * 60);
    setSessionFinished(false);
    setTimerRunning(false);
  }, [timerMode, focusDuration]);

  useEffect(() => {
    // Read the current date only after hydration so Next.js can prerender safely.
    const now = new Date();
    setReferenceDate(now);

    const formattedDate = new Intl.DateTimeFormat("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "Asia/Kolkata",
    }).format(now);

    const dayName = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      timeZone: "Asia/Kolkata",
    }).format(now);

    setToday(formattedDate);
    setTodayDayName(dayName);
    setSelectedDay(dayName);
  }, []);

  const todayKey = referenceDate ? indiaDateKey(referenceDate) : "";
  const weekDateKeys = referenceDate
    ? Array.from({ length: 7 }, (_, index) => {
        const date = new Date(referenceDate);
        date.setDate(date.getDate() - (6 - index));
        return indiaDateKey(date);
      })
    : [];
  const habitsCompletedToday = habits.filter((habit) => habit.completedDates.includes(todayKey)).length;
  const habitsWeeklyCompletions = habits.reduce((total, habit) => total + habit.completedDates.filter((date) => weekDateKeys.includes(date)).length, 0);
  const habitsWeeklyTarget = habits.length * 7;
  const habitsWeeklyConsistency = habitsWeeklyTarget ? Math.round((habitsWeeklyCompletions / habitsWeeklyTarget) * 100) : 0;

  function habitStreak(habit: Habit) {
    if (!referenceDate || !todayKey) return 0;
    const completed = new Set(habit.completedDates);
    let streak = 0;
    const cursor = new Date(referenceDate);
    if (!completed.has(todayKey)) cursor.setDate(cursor.getDate() - 1);
    for (let i = 0; i < 366; i += 1) {
      if (!completed.has(indiaDateKey(cursor))) break;
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  const bestCurrentHabitStreak = habits.reduce((best, habit) => Math.max(best, habitStreak(habit)), 0);

  function toggleHabitToday(id: string) {
    setHabits((current) => current.map((habit) => {
      if (habit.id !== id) return habit;
      const isDone = habit.completedDates.includes(todayKey);
      return { ...habit, completedDates: isDone ? habit.completedDates.filter((date) => date !== todayKey) : [...habit.completedDates, todayKey].sort() };
    }));
  }

  function saveHabit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = habitName.trim();
    if (!name) return;
    if (editingHabitId) {
      setHabits((current) => current.map((habit) => habit.id === editingHabitId ? { ...habit, name } : habit));
    } else {
      setHabits((current) => [...current, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name, createdAt: todayKey, completedDates: [] }]);
    }
    setHabitName("");
    setEditingHabitId(null);
    setShowHabitForm(false);
  }

  function startEditingHabit(habit: Habit) {
    setHabitName(habit.name);
    setEditingHabitId(habit.id);
    setShowHabitForm(true);
  }

  function cancelHabitForm() {
    setHabitName("");
    setEditingHabitId(null);
    setShowHabitForm(false);
  }

  function deleteHabit(id: string) {
    setHabits((current) => current.filter((habit) => habit.id !== id));
    if (editingHabitId === id) cancelHabitForm();
  }

  function toggleTask(id: number) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task,
      ),
    );
  }

  function deleteTask(id: number) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  function addTask() {
    const title = newTask.trim();
    if (!title) return;

    setTasks((current) => [
      ...current,
      {
        id: Date.now(),
        title,
        category: "Personal",
        time: "30 min",
        done: false,
      },
    ]);
    setNewTask("");
    setShowAddTask(false);
  }

  const timerMinutes = Math.floor(remainingSeconds / 60).toString().padStart(2, "0");
  const timerSeconds = (remainingSeconds % 60).toString().padStart(2, "0");
  const timerProgress = timerMode === "focus"
    ? ((focusDuration * 60 - remainingSeconds) / (focusDuration * 60)) * 100
    : ((5 * 60 - remainingSeconds) / (5 * 60)) * 100;

  function resetTimer() {
    setTimerRunning(false);
    setRemainingSeconds((timerMode === "focus" ? focusDuration : 5) * 60);
    setSessionFinished(false);
  }

  function chooseTimerMode(mode: "focus" | "break") {
    setTimerRunning(false);
    setTimerMode(mode);
  }

  function exportWorkspaceData() {
    const storageKeys = [
      "command-center-settings",
      "command-center-tasks",
      "command-center-weekly-classes",
      "command-center-semester",
      "command-center-habits",
      "command-center-focus-stats",
      "command-center-projects",
      "command-center-roadmaps",
    ];
    const workspaceData: Record<string, unknown> = {
      exportedAt: new Date().toISOString(),
      app: "My Command Center",
      data: {},
    };
    const data: Record<string, unknown> = {};
    for (const key of storageKeys) {
      const rawValue = window.localStorage.getItem(key);
      if (rawValue === null) continue;
      try {
        data[key] = JSON.parse(rawValue);
      } catch {
        data[key] = rawValue;
      }
    }
    workspaceData.data = data;
    const file = new Blob([JSON.stringify(workspaceData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `command-center-backup-${indiaDateKey()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setSettingsDataMessage("Workspace backup downloaded. Keep the JSON file somewhere safe.");
  }

  function resetPreferences() {
    if (!window.confirm("Reset theme, display name, and focus duration to their defaults? Your tasks, habits, classes, and history will not be deleted.")) return;
    setDark(true);
    setDisplayName("My profile");
    setFocusDuration(25);
    setReminderPreferences({
      tasks: { enabled: false, time: "09:00" },
      habits: { enabled: false, time: "20:00" },
      classes: { enabled: false, time: "08:00" },
      focus: { enabled: false, time: "14:00" },
    });
    setSettingsDataMessage("Preferences restored to defaults. Your workspace data was kept.");
  }

  async function enableNotifications() {
    setSettingsMessage("");
    if (typeof window === "undefined" || !("Notification" in window)) {
      setSettingsMessage("This browser does not support notifications.");
      return;
    }
    if (Notification.permission === "granted") {
      setNotificationPermission("granted");
      setSettingsMessage("Browser notification permission is already enabled.");
      return;
    }
    if (Notification.permission === "denied") {
      setNotificationPermission("denied");
      setSettingsMessage("Notifications are blocked by your browser. Allow them in site settings, then try again.");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      setSettingsMessage(
        permission === "granted"
          ? "Browser notification permission enabled. Scheduled reminders are not connected yet."
          : permission === "denied"
            ? "Permission was denied. You can change it in your browser site settings."
            : "Permission was not granted."
      );
    } catch {
      setSettingsMessage("Could not request notification permission in this browser.");
    }
  }

  const formHasInvalidTime = timeToMinutes(classForm.end) <= timeToMinutes(classForm.start);
  const formConflicts = classes.filter((item) =>
    item.day === classForm.day && item.id !== editingClassId &&
    timeToMinutes(classForm.start) < timeToMinutes(item.end) &&
    timeToMinutes(classForm.end) > timeToMinutes(item.start)
  );

  function addClass(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const subject = classForm.subject.trim();
    if (!subject || formHasInvalidTime) return;
    const entry: ClassEntry = {
      ...classForm,
      subject,
      id: editingClassId ?? `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    };
    setClasses((current) => editingClassId
      ? current.map((item) => item.id === editingClassId ? entry : item)
      : [...current, entry]
    );
    setSelectedDay(classForm.day);
    setClassForm({ ...defaultClassForm, day: classForm.day });
    setEditingClassId(null);
    setShowClassForm(false);
  }

  function startEditingClass(item: ClassEntry) {
    setSelectedDay(item.day);
    setClassForm({ day: item.day, subject: item.subject, start: item.start, end: item.end, location: item.location });
    setEditingClassId(item.id);
    setShowClassForm(true);
  }

  function cancelClassForm() {
    setClassForm({ ...defaultClassForm, day: selectedDay });
    setEditingClassId(null);
    setShowClassForm(false);
  }

  function deleteClass(id: string) {
    setClasses((current) => current.filter((item) => item.id !== id));
    if (editingClassId === id) cancelClassForm();
  }

  const classesForDay = classes
    .filter((item) => item.day === selectedDay)
    .sort((a, b) => a.start.localeCompare(b.start));
  const totalClassMinutes = classesForDay.reduce((total, item) => total + Math.max(0, timeToMinutes(item.end) - timeToMinutes(item.start)), 0);
  const gaps = classesForDay.slice(1).reduce((total, item, index) => {
    const previousEnd = timeToMinutes(classesForDay[index].end);
    const nextStart = timeToMinutes(item.start);
    return total + Math.max(0, nextStart - previousEnd);
  }, 0);
  const freeHours = Math.max(0, 16 - totalClassMinutes / 60);

  const filteredTasks = tasks.filter((task) =>
    `${task.title} ${task.category}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const analyticsDays = analyticsRange === "7d" ? 7 : analyticsRange === "30d" ? 30 : 0;
  const analyticsDateKeys = referenceDate
    ? Array.from({ length: analyticsDays || 30 }, (_, index) => {
        const date = new Date(referenceDate);
        date.setDate(date.getDate() - ((analyticsDays || 30) - 1 - index));
        return indiaDateKey(date);
      })
    : [];
  const analyticsHabitsCompletions = habits.reduce((total, habit) => total + habit.completedDates.filter((date) => analyticsRange === "all" ? date <= todayKey : analyticsDateKeys.includes(date)).length, 0);
  const analyticsHabitsTarget = analyticsRange === "all"
    ? referenceDate
      ? habits.reduce((total, habit) => total + Math.max(1, Math.floor((referenceDate.getTime() - new Date(`${habit.createdAt}T00:00:00+05:30`).getTime()) / 86400000) + 1), 0)
      : 0
    : habits.length * analyticsDays;
  const analyticsHabitRate = analyticsHabitsTarget ? Math.min(100, Math.round((analyticsHabitsCompletions / analyticsHabitsTarget) * 100)) : 0;
  const taskDoneCount = tasks.filter((task) => task.done).length;
  const taskOpenCount = tasks.length - taskDoneCount;
  const taskCompletionRate = tasks.length ? Math.round(taskDoneCount / tasks.length * 100) : 0;
  const habitDailyBars = referenceDate
    ? Array.from({ length: 7 }, (_, index) => {
        const date = new Date(referenceDate);
        date.setDate(date.getDate() - (6 - index));
        const key = indiaDateKey(date);
        const done = habits.reduce((total, habit) => total + (habit.completedDates.includes(key) ? 1 : 0), 0);
        return { key, day: new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "Asia/Kolkata" }).format(date), done, rate: habits.length ? Math.round(done / habits.length * 100) : 0, today: key === todayKey };
      })
    : [];
  const taskCategories = Array.from(tasks.reduce((map, task) => map.set(task.category || "Uncategorized", (map.get(task.category || "Uncategorized") || 0) + 1), new Map<string, number>()).entries()).sort((a, b) => b[1] - a[1]);

  return (
    <main className={`app-shell ${dark ? "theme-dark" : "theme-light"}`}>
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Command size={21} strokeWidth={2.4} />
          </div>
          <div className="brand-copy">
            <span className="brand-name">command<span>.</span></span>
            <span className="brand-caption">PERSONAL WORKSPACE</span>
          </div>
          <button
            className="icon-button mobile-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <button className="workspace-switch">
          <div className="workspace-avatar">V</div>
          <div className="workspace-copy">
            <strong>My workspace</strong>
            <span>Personal account</span>
          </div>
          <ChevronDown size={15} className="muted-icon" />
        </button>

        <div className="nav-label">WORKSPACE</div>
        <nav className="sidebar-nav">
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${activePage === label ? "nav-active" : ""}`}
              onClick={() => {
                setActivePage(label);
                setSidebarOpen(false);
              }}
            >
              <Icon size={17} strokeWidth={1.8} />
              <span>{label}</span>
              {label === "Tasks" && (
                <span className="nav-count">
                  {tasks.filter((task) => !task.done).length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="nav-label tools-label">PERSONAL TOOLS</div>
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activePage === "Focus timer" ? "nav-active" : ""}`}
            onClick={() => setActivePage("Focus timer")}
          >
            <Timer size={17} strokeWidth={1.8} />
            <span>Focus timer</span>
          </button>
          <button
            className={`nav-item ${activePage === "Analytics" ? "nav-active" : ""}`}
            onClick={() => setActivePage("Analytics")}
          >
            <Activity size={17} strokeWidth={1.8} />
            <span>Analytics</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-icon"><Sparkles size={17} /></div>
            <strong>Your space, your system.</strong>
            <p>Build better days, one focused step at a time.</p>
          </div>
          <button
            className={`nav-item ${activePage === "Settings" ? "nav-active" : ""}`}
            onClick={() => setActivePage("Settings")}
          >
            <Settings size={17} strokeWidth={1.8} />
            <span>Settings</span>
          </button>
          <div className="profile-row">
            <div className="profile-avatar">{displayName.trim().charAt(0).toUpperCase() || "V"}</div>
            <div className="profile-copy">
              <strong>{displayName.trim() || "My profile"}</strong>
              <span>Personal workspace</span>
            </div>
            <MoreHorizontal size={18} className="muted-icon" />
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <section className="main-panel">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
            <div className="breadcrumb">
              <span>Workspace</span>
              <span className="breadcrumb-slash">/</span>
              <strong>{activePage}</strong>
            </div>
          </div>

          <div className="topbar-actions">
            <label className="search-box">
              <Search size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tasks..."
                aria-label="Search tasks"
              />
              <kbd>/</kbd>
            </label>
            <button
              className="icon-button theme-toggle"
              onClick={() => setDark(!dark)}
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button
              className="icon-button notification-button"
              aria-label="Notifications"
              title="Notifications are not connected yet"
            >
              <Bell size={17} />
              <span className="notification-dot" />
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          {activePage === "Overview" ? (
            <>
              <section className="welcome-row">
                <div>
                  <div className="eyebrow">
                    <span className="status-dot" />
                    YOUR PERSONAL COMMAND CENTER
                  </div>
                  <h1>Make today <span>count.</span></h1>
                  <p className="welcome-subtitle">
                    A little progress every day adds up to big results.
                  </p>
                </div>
                <div className="date-pill">
                  <CalendarDays size={16} />
                  <span>{today}</span>
                </div>
              </section>

              <section className="focus-banner">
                <div className="focus-banner-content">
                  <div className="focus-icon"><Zap size={19} /></div>
                  <div>
                    <div className="focus-kicker">YOUR DAILY FOCUS</div>
                    <h2>Build consistency, not pressure.</h2>
                    <p>Choose the important work. Give it your full attention.</p>
                  </div>
                </div>
                <button
                  className="focus-action"
                  onClick={() => setActivePage("Focus timer")}
                >
                  Start focusing <ArrowRight size={16} />
                </button>
                <div className="banner-decoration banner-decoration-one" />
                <div className="banner-decoration banner-decoration-two" />
              </section>

              <section className="section-block">
                <div className="section-heading">
                  <div>
                    <h2>Today's overview</h2>
                    <p>Your progress at a glance</p>
                  </div>
                  <button className="subtle-button" onClick={() => setActivePage("Analytics")}>
                    View analytics <ArrowRight size={15} />
                  </button>
                </div>

                <div className="stats-grid">
                  <article className="stat-card">
                    <div className="stat-topline">
                      <span className="stat-label">Tasks completed</span>
                      <div className="stat-icon violet"><Check size={17} /></div>
                    </div>
                    <div className="stat-value">
                      {completed}<span className="stat-total"> / {tasks.length}</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill violet-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="stat-foot">
                      <span>{progress}% complete</span>
                      <span className="stat-foot-muted">Daily tasks</span>
                    </div>
                  </article>

                  <article className="stat-card">
                    <div className="stat-topline">
                      <span className="stat-label">Focus time</span>
                      <div className="stat-icon blue"><Clock3 size={17} /></div>
                    </div>
                    <div className="stat-value">{focusStats.minutes}<span className="stat-unit"> min</span></div>
                    <div className="stat-foot">
                      <span className="neutral-trend">{focusStats.sessions ? `${focusStats.sessions} completed session${focusStats.sessions === 1 ? "" : "s"}` : "No sessions yet"}</span>
                      <span className="stat-foot-muted">Today</span>
                    </div>
                  </article>

                  <article className="stat-card">
                    <div className="stat-topline">
                      <span className="stat-label">Habit streak</span>
                      <div className="stat-icon orange"><Flame size={17} /></div>
                    </div>
                    <div className="stat-value">{bestCurrentHabitStreak}<span className="stat-unit"> days</span></div>
                    <div className="stat-foot">
                      <span className="neutral-trend">{habitsCompletedToday} of {habits.length} done today</span>
                      <span className="stat-foot-muted">Best current streak</span>
                    </div>
                  </article>

                  <article className="stat-card">
                    <div className="stat-topline">
                      <span className="stat-label">Planned hours</span>
                      <div className="stat-icon green"><Target size={17} /></div>
                    </div>
                    <div className="stat-value">0<span className="stat-unit"> hrs</span></div>
                    <div className="stat-foot">
                      <span className="neutral-trend">Schedule not configured</span>
                      <span className="stat-foot-muted">Today</span>
                    </div>
                  </article>
                </div>
              </section>

              <div className="dashboard-grid">
                <section className="content-card tasks-card">
                  <div className="card-heading">
                    <div>
                      <div className="heading-with-icon">
                        <h2>Today's tasks</h2>
                        <span className="small-count">{tasks.filter((task) => !task.done).length}</span>
                      </div>
                      <p>Keep your priorities moving</p>
                    </div>
                    <button className="icon-button" aria-label="Task options">
                      <MoreHorizontal size={19} />
                    </button>
                  </div>

                  {showAddTask && (
                    <form
                      className="add-task-form"
                      onSubmit={(event) => {
                        event.preventDefault();
                        addTask();
                      }}
                    >
                      <input
                        autoFocus
                        value={newTask}
                        onChange={(event) => setNewTask(event.target.value)}
                        placeholder="What needs to get done?"
                        aria-label="New task name"
                      />
                      <button type="submit" className="mini-primary">Add</button>
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => setShowAddTask(false)}
                        aria-label="Cancel adding task"
                      >
                        <X size={16} />
                      </button>
                    </form>
                  )}

                  <div className="task-list">
                    {filteredTasks.map((task) => (
                      <div className={`task-row ${task.done ? "task-done" : ""}`} key={task.id}>
                        <button
                          className={`task-checkbox ${task.done ? "checked" : ""}`}
                          onClick={() => toggleTask(task.id)}
                          aria-label={task.done ? "Mark task incomplete" : "Mark task complete"}
                        >
                          {task.done && <Check size={13} strokeWidth={2.5} />}
                        </button>
                        <div className="task-copy">
                          <span className="task-title">{task.title}</span>
                          <span className="task-category">{task.category}</span>
                        </div>
                        <span className="task-time">{task.time}</span>
                        <button className="icon-button task-delete-button" onClick={() => deleteTask(task.id)} aria-label={`Delete ${task.title}`} title="Delete task">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {filteredTasks.length === 0 && (
                      <div className="empty-search">No matching tasks found.</div>
                    )}
                  </div>

                  <button className="add-task-button" onClick={() => setShowAddTask(!showAddTask)}>
                    <Plus size={16} /> Add a task
                  </button>
                </section>

                <section className="content-card schedule-card">
                  <div className="card-heading">
                    <div>
                      <h2>Daily schedule</h2>
                      <p>A preview of your day</p>
                    </div>
                    <button
                      className="subtle-button"
                      onClick={() => setActivePage("Calendar")}
                    >
                      Calendar <ArrowRight size={14} />
                    </button>
                  </div>

                  <div className="schedule-notice">
                    <CalendarDays size={15} />
                    <span>{classes.length ? `Recurring timetable · ${todayDayName}` : "Set up your recurring weekly timetable"}</span>
                  </div>

                  <div className="schedule-list">
                    {classes.filter((item) => item.day === todayDayName).sort((a, b) => a.start.localeCompare(b.start)).slice(0, 4).map((item) => (
                      <div className="schedule-row" key={item.id}>
                        <div className="schedule-time">
                          <span>{item.start}</span>
                          <span>{item.end}</span>
                        </div>
                        <div className="schedule-line blue" />
                        <div className="schedule-event">
                          <strong>{item.subject}</strong>
                          <span>{item.location || "College class"}</span>
                        </div>
                      </div>
                    ))}
                    {classes.filter((item) => item.day === todayDayName).length === 0 && (
                      <div className="calendar-empty">No classes saved for today yet.</div>
                    )}
                  </div>

                  <button className="schedule-footer" onClick={() => setActivePage("Calendar")}>
                    <Plus size={15} /> Configure your timetable
                  </button>
                </section>
              </div>

              <section className="bottom-grid">
                <article className="content-card roadmap-card">
                  <div className="mini-card-icon roadmap-icon"><BookOpen size={18} /></div>
                  <div className="mini-card-copy">
                    <h3>Learning roadmap</h3>
                    <p>Keep your skills and goals organized in one place.</p>
                    <button onClick={() => setActivePage("Roadmaps")}>
                      Open roadmaps <ArrowRight size={14} />
                    </button>
                  </div>
                  <ArrowUpRight className="mini-card-arrow" size={18} />
                </article>

                <article className="content-card projects-card">
                  <div className="mini-card-icon project-icon"><FolderKanban size={18} /></div>
                  <div className="mini-card-copy">
                    <h3>Projects in progress</h3>
                    <p>Track your builds, milestones, and next steps.</p>
                    <button onClick={() => setActivePage("Projects")}>
                      View projects <ArrowRight size={14} />
                    </button>
                  </div>
                  <ArrowDownRight className="mini-card-arrow" size={18} />
                </article>
              </section>

              <footer className="dashboard-footer">
                <span><span className="footer-dot" /> Your workspace is ready to build</span>
                <span>MY COMMAND CENTER <span className="footer-divider">/</span> V1.0</span>
              </footer>
            </>
          ) : activePage === "Tasks" ? (
            <section className="tasks-page">
              <section className="welcome-row">
                <div>
                  <div className="eyebrow">
                    <span className="status-dot" />
                    PERSONAL TASK MANAGER
                  </div>
                  <h1>All your <span>tasks.</span></h1>
                  <p className="welcome-subtitle">
                    Add tasks, track completion, and keep your priorities clear.
                  </p>
                </div>
                <div className="date-pill">
                  <Check size={16} />
                  <span>{completed} of {tasks.length} completed</span>
                </div>
              </section>

              <section className="content-card tasks-manager-card">
                <div className="card-heading">
                  <div>
                    <div className="heading-with-icon">
                      <h2>Your task list</h2>
                      <span className="small-count">{tasks.filter((task) => !task.done).length} left</span>
                    </div>
                    <p>{progress}% complete · Changes are saved in this browser</p>
                  </div>
                  <button className="mini-primary task-add-top" onClick={() => setShowAddTask((open) => !open)}>
                    <Plus size={15} /> Add task
                  </button>
                </div>

                {showAddTask && (
                  <form
                    className="add-task-form"
                    onSubmit={(event) => {
                      event.preventDefault();
                      addTask();
                    }}
                  >
                    <input
                      autoFocus
                      value={newTask}
                      onChange={(event) => setNewTask(event.target.value)}
                      placeholder="What needs to get done?"
                      aria-label="New task name"
                    />
                    <button type="submit" className="mini-primary">Add</button>
                    <button type="button" className="icon-button" onClick={() => setShowAddTask(false)} aria-label="Cancel adding task">
                      <X size={16} />
                    </button>
                  </form>
                )}

                <div className="progress-track tasks-page-progress">
                  <div className="progress-fill violet-fill" style={{ width: `${progress}%` }} />
                </div>

                <div className="task-list">
                  {filteredTasks.map((task) => (
                    <div className={`task-row ${task.done ? "task-done" : ""}`} key={task.id}>
                      <button
                        className={`task-checkbox ${task.done ? "checked" : ""}`}
                        onClick={() => toggleTask(task.id)}
                        aria-label={task.done ? "Mark task incomplete" : "Mark task complete"}
                      >
                        {task.done && <Check size={13} strokeWidth={2.5} />}
                      </button>
                      <div className="task-copy">
                        <span className="task-title">{task.title}</span>
                        <span className="task-category">{task.category} · {task.time}</span>
                      </div>
                      <button className="icon-button task-delete-button" onClick={() => deleteTask(task.id)} aria-label={`Delete ${task.title}`} title="Delete task">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                  {filteredTasks.length === 0 && (
                    <div className="empty-search">
                      {search ? "No matching tasks found." : "No tasks yet. Add your first task above."}
                    </div>
                  )}
                </div>
              </section>
            </section>
          ) : activePage === "Calendar" ? (
            <section className="calendar-page">
              <section className="welcome-row">
                <div>
                  <div className="eyebrow"><span className="status-dot" /> RECURRING WEEKLY TIMETABLE</div>
                  <h1>Your college <span>schedule.</span></h1>
                  <p className="welcome-subtitle">Set your classes once. Your timetable repeats every week throughout the semester.</p>
                </div>
                <div className="date-pill"><CalendarDays size={16} /><span>{classes.length} saved {classes.length === 1 ? "class" : "classes"}</span></div>
              </section>

              <section className="calendar-summary-grid">
                <article className="stat-card">
                  <div className="stat-topline"><span className="stat-label">Classes on selected day</span><div className="stat-icon violet"><CalendarDays size={17} /></div></div>
                  <div className="stat-value">{classesForDay.length}</div>
                  <div className="stat-foot"><span className="neutral-trend">{selectedDay}</span><span className="stat-foot-muted">Weekly</span></div>
                </article>
                <article className="stat-card">
                  <div className="stat-topline"><span className="stat-label">Class time</span><div className="stat-icon blue"><Clock3 size={17} /></div></div>
                  <div className="stat-value">{Math.floor(totalClassMinutes / 60)}<span className="stat-unit"> h </span>{totalClassMinutes % 60}<span className="stat-unit"> min</span></div>
                  <div className="stat-foot"><span className="neutral-trend">Scheduled classes</span><span className="stat-foot-muted">{selectedDay}</span></div>
                </article>
                <article className="stat-card">
                  <div className="stat-topline"><span className="stat-label">Between-class gaps</span><div className="stat-icon green"><Clock3 size={17} /></div></div>
                  <div className="stat-value">{Math.floor(gaps / 60)}<span className="stat-unit"> h </span>{gaps % 60}<span className="stat-unit"> min</span></div>
                  <div className="stat-foot"><span className="neutral-trend">Time between classes</span><span className="stat-foot-muted">{selectedDay}</span></div>
                </article>
                <article className="stat-card">
                  <div className="stat-topline"><span className="stat-label">Estimated free time</span><div className="stat-icon orange"><Target size={17} /></div></div>
                  <div className="stat-value">{freeHours.toFixed(1)}<span className="stat-unit"> hrs</span></div>
                  <div className="stat-foot"><span className="neutral-trend">Assumes a 16-hour waking day</span><span className="stat-foot-muted">Estimate</span></div>
                </article>
              </section>

              <section className="content-card calendar-timetable-card">
                <div className="card-heading calendar-card-heading">
                  <div><h2>Weekly timetable</h2><p>Select a day to view or manage its recurring classes.</p></div>
                  <button className="mini-primary task-add-top" onClick={() => { if (showClassForm && !editingClassId) { cancelClassForm(); } else { setClassForm({ ...defaultClassForm, day: selectedDay }); setEditingClassId(null); setShowClassForm(true); } }}><Plus size={15} /> Add class</button>
                </div>
                <div className="weekday-picker" role="group" aria-label="Select day of week">
                  {weekDays.map((day) => <button key={day} className={`weekday-button ${selectedDay === day ? "weekday-selected" : ""}`} onClick={() => setSelectedDay(day)}><span>{day.slice(0, 3)}</span><small>{classes.filter((item) => item.day === day).length}</small></button>)}
                </div>

                {showClassForm && (
                  <form className="class-form" onSubmit={addClass}>
                    <label>Day<select value={classForm.day} onChange={(event) => setClassForm({ ...classForm, day: event.target.value })}>{weekDays.map((day) => <option key={day} value={day}>{day}</option>)}</select></label>
                    <label className="class-subject-field">Subject / activity<input autoFocus required maxLength={80} value={classForm.subject} onChange={(event) => setClassForm({ ...classForm, subject: event.target.value })} placeholder="e.g. Data Structures" /></label>
                    <label>Start<input required type="time" value={classForm.start} onChange={(event) => setClassForm({ ...classForm, start: event.target.value })} /></label>
                    <label>End<input required type="time" min={classForm.start} value={classForm.end} onChange={(event) => setClassForm({ ...classForm, end: event.target.value })} /></label>
                    <label className="class-location-field">Room / location <input maxLength={80} value={classForm.location} onChange={(event) => setClassForm({ ...classForm, location: event.target.value })} placeholder="Optional" /></label>
                    <div className="class-form-actions"><button type="submit" className="mini-primary">{editingClassId ? "Update class" : "Save class"}</button><button type="button" className="subtle-button" onClick={cancelClassForm}>Cancel</button></div>
                    {formHasInvalidTime && <p className="class-form-error">End time must be later than start time.</p>}
                    {!formHasInvalidTime && formConflicts.length > 0 && <div className="class-conflict-warning"><strong>Time conflict detected</strong><span>This overlaps with {formConflicts.map((item) => `${item.subject} (${item.start}–${item.end})`).join(", ")}.</span><small>You can still save it if the overlap is intentional.</small></div>}
                  </form>
                )}

                <div className="timetable-list">
                  {classesForDay.map((item) => (
                    <article className="timetable-class-row" key={item.id}>
                      <div className="timetable-class-time"><strong>{item.start}</strong><span>{item.end}</span></div>
                      <div className="timetable-class-marker" />
                      <div className="timetable-class-copy"><strong>{item.subject}</strong><span>{item.location || "Location not set"}</span><small>{Math.floor((timeToMinutes(item.end) - timeToMinutes(item.start)) / 60) ? `${Math.floor((timeToMinutes(item.end) - timeToMinutes(item.start)) / 60)} h ` : ""}{(timeToMinutes(item.end) - timeToMinutes(item.start)) % 60 ? `${(timeToMinutes(item.end) - timeToMinutes(item.start)) % 60} min` : ""}</small></div>
                      <div className="timetable-class-actions"><button type="button" className="icon-button" onClick={() => startEditingClass(item)} title={`Edit ${item.subject}`} aria-label={`Edit ${item.subject}`}><Pencil size={14} /></button><button type="button" className="icon-button task-delete-button" onClick={() => deleteClass(item.id)} title={`Delete ${item.subject}`} aria-label={`Delete ${item.subject}`}><Trash2 size={15} /></button></div>
                    </article>
                  ))}
                  {classesForDay.length === 0 && <div className="calendar-empty"><CalendarDays size={24} /><strong>No classes on {selectedDay}</strong><span>Add your first class for this day. It will repeat every week.</span><button className="subtle-button" onClick={() => { setClassForm((current) => ({ ...current, day: selectedDay })); setShowClassForm(true); }}><Plus size={14} /> Add a class</button></div>}
                </div>
              </section>

              <section className="content-card semester-card">
                <div className="card-heading"><div><h2>Semester dates</h2><p>Optional dates to keep your timetable aligned with the semester.</p></div></div>
                <div className="semester-fields">
                  <label>Semester starts<input type="date" value={semesterStart} onChange={(event) => setSemesterStart(event.target.value)} /></label>
                  <label>Semester ends<input type="date" min={semesterStart || undefined} value={semesterEnd} onChange={(event) => setSemesterEnd(event.target.value)} /></label>
                  <p>Classes repeat weekly in this planner. These dates are saved locally for reference; automatic semester rollover is not enabled yet. Between-class gaps show the time from one class ending to the next starting, not the full free time in your day.</p>
                </div>
              </section>
              <p className="calendar-storage-note"><Check size={14} /> Your timetable is saved in this browser automatically.</p>
            </section>
          ) : activePage === "Habits" ? (
            <section className="habits-page">
              <section className="habits-hero">
                <div className="habits-hero-copy">
                  <div className="eyebrow"><span className="status-dot" /> YOUR DAILY SYSTEM</div>
                  <h1>Small steps. <span>Real progress.</span></h1>
                  <p className="welcome-subtitle">Build routines you can return to, even on busy days.</p>
                  <div className="habits-hero-meta"><CalendarCheck size={15} /><span>{today || "Your daily habits"}</span><span className="habits-meta-divider" /><span>{habits.length} {habits.length === 1 ? "habit" : "habits"} in your routine</span></div>
                </div>
                <div className="habits-progress-panel">
                  <div className="habits-progress-ring" style={{ background: `conic-gradient(var(--accent) ${habits.length ? (habitsCompletedToday / habits.length) * 100 : 0}%, var(--border) 0)` }}>
                    <div className="habits-progress-ring-inner"><strong>{habits.length ? Math.round((habitsCompletedToday / habits.length) * 100) : 0}<small>%</small></strong><span>complete</span></div>
                  </div>
                  <div className="habits-progress-copy"><span className="habits-progress-kicker">TODAY'S PROGRESS</span><strong>{habitsCompletedToday} of {habits.length}</strong><p>{habits.length === 0 ? "Add a habit to begin tracking." : habitsCompletedToday === habits.length ? "All done for today. Well done." : "One action at a time. Keep going."}</p></div>
                </div>
              </section>

              <div className="habit-summary-grid">
                <article className="stat-card habit-stat-card">
                  <div className="stat-topline"><span className="stat-label">Weekly consistency</span><div className="stat-icon violet"><CalendarDays size={17} /></div></div>
                  <div className="stat-value">{habitsWeeklyConsistency}<span className="stat-unit">%</span></div>
                  <div className="progress-track"><div className="progress-fill violet-fill" style={{ width: `${habitsWeeklyConsistency}%` }} /></div>
                  <div className="stat-foot"><span>{habitsWeeklyCompletions} check-ins</span><span className="stat-foot-muted">Last 7 days</span></div>
                </article>
                <article className="stat-card habit-stat-card">
                  <div className="stat-topline"><span className="stat-label">Best active streak</span><div className="stat-icon orange"><Flame size={17} /></div></div>
                  <div className="stat-value">{bestCurrentHabitStreak}<span className="stat-unit"> days</span></div>
                  <div className="stat-foot"><span className="neutral-trend">Consistency beats intensity</span></div>
                </article>
              </div>

              <section className="content-card habit-list-card">
                <div className="card-heading habit-heading">
                  <div><div className="habit-section-kicker">THE DAILY CHECKLIST</div><h2>Your routines</h2><p>Check off each one as you complete it.</p></div>
                  <button className="primary-button habit-add-button" onClick={() => { if (showHabitForm) cancelHabitForm(); else { setEditingHabitId(null); setHabitName(""); setShowHabitForm(true); } }}><Plus size={15} /> Add habit</button>
                </div>

                {showHabitForm && (
                  <form className="habit-form" onSubmit={saveHabit}>
                    <label htmlFor="habit-name">Habit name</label>
                    <div className="habit-form-controls">
                      <input id="habit-name" autoFocus maxLength={80} value={habitName} onChange={(event) => setHabitName(event.target.value)} placeholder="e.g. Read for 15 minutes" required />
                      <button className="primary-button" type="submit">{editingHabitId ? "Save changes" : "Add routine"}</button>
                      <button className="subtle-button" type="button" onClick={cancelHabitForm}>Cancel</button>
                    </div>
                  </form>
                )}

                {habits.length === 0 ? (
                  <div className="habit-empty-state">
                    <div className="habit-empty-art"><div className="habit-empty-art-circle"><Activity size={25} /></div><span className="habit-art-dot habit-art-dot-one" /><span className="habit-art-dot habit-art-dot-two" /><span className="habit-art-line" /></div>
                    <div className="habit-empty-copy"><h3>Start with one meaningful habit</h3><p>Your routine should fit your life, not the other way around. Add one small action and build from there.</p><button className="primary-button" onClick={() => setShowHabitForm(true)}><Plus size={14} /> Create your first habit</button></div>
                  </div>
                ) : (
                  <div className="habit-list">
                    {habits.map((habit, index) => {
                      const doneToday = habit.completedDates.includes(todayKey);
                      const streak = habitStreak(habit);
                      return (
                        <article className={`habit-row ${doneToday ? "habit-row-done" : ""}`} key={habit.id}>
                          <button className={`habit-check ${doneToday ? "habit-check-done" : ""}`} onClick={() => toggleHabitToday(habit.id)} aria-label={`${doneToday ? "Mark incomplete" : "Complete"}: ${habit.name}`} title={doneToday ? "Mark incomplete" : "Mark complete"}>{doneToday && <Check size={16} />}</button>
                          <div className="habit-row-index">{String(index + 1).padStart(2, "0")}</div>
                          <div className="habit-row-copy"><strong>{habit.name}</strong><span>{doneToday ? "Completed today" : "A small step, done consistently"}</span></div>
                          <div className="habit-streak"><Flame size={14} /><strong>{streak}</strong><span>day streak</span></div>
                          <div className="habit-row-actions"><button className="icon-button" onClick={() => startEditingHabit(habit)} aria-label={`Edit ${habit.name}`} title="Edit habit"><Pencil size={14} /></button><button className="icon-button task-delete-button" onClick={() => deleteHabit(habit.id)} aria-label={`Delete ${habit.name}`} title="Delete habit"><Trash2 size={14} /></button></div>
                        </article>
                      );
                    })}
                  </div>
                )}
                <div className="habit-storage-note"><Check size={14} /> Your progress is saved automatically in this browser.</div>
              </section>

              <section className="content-card habit-week-card">
                <div className="card-heading"><div><div className="habit-section-kicker">YOUR MOMENTUM</div><h2>Last 7 days</h2><p>See how consistently you showed up.</p></div><span className="habit-week-badge"><Activity size={14} /> Weekly view</span></div>
                {habits.length === 0 ? <div className="habit-week-empty">Your weekly history will appear here after you add a habit.</div> : (
                  <div className="habit-week-grid">
                    {weekDateKeys.map((dateKey) => {
                      const completedCount = habits.filter((habit) => habit.completedDates.includes(dateKey)).length;
                      const dayLabel = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" }).format(new Date(`${dateKey}T12:00:00Z`));
                      const isToday = dateKey === todayKey;
                      return <div className={`habit-week-day ${isToday ? "habit-week-day-today" : ""}`} key={dateKey}><span>{dayLabel}</span><strong>{completedCount}<small>/{habits.length}</small></strong><div className="habit-week-track"><div style={{ height: `${habits.length ? (completedCount / habits.length) * 100 : 0}%` }} /></div><small>{isToday ? "Today" : dateKey.slice(5).replace("-", "/")}</small></div>;
                    })}
                  </div>
                )}
              </section>
            </section>
          ) : activePage === "Focus timer" ? (
            <section className="focus-timer-page">
              <section className="welcome-row">
                <div>
                  <div className="eyebrow"><span className="status-dot" /> DEEP WORK, ONE SESSION AT A TIME</div>
                  <h1>Protect your <span>focus.</span></h1>
                  <p className="welcome-subtitle">Work in a single block. Take a real break. Repeat when ready.</p>
                </div>
                <div className="date-pill"><Timer size={16} /><span>Pomodoro timer</span></div>
              </section>

              <div className="focus-timer-layout">
                <section className="content-card timer-main-card">
                  <div className="timer-card-topline">
                    <div>
                      <span className="timer-section-kicker">CURRENT SESSION</span>
                      <h2>{timerMode === "focus" ? "Deep work" : "Recovery break"}</h2>
                      <p>{timerMode === "focus" ? "Give one important task your full attention." : "Step away from the screen and recharge."}</p>
                    </div>
                    <span className={`timer-live-badge ${timerRunning ? "is-running" : ""}`}><span />{timerRunning ? "RUNNING" : sessionFinished ? "COMPLETED" : "STANDING BY"}</span>
                  </div>
                  <div className="timer-mode-switch" role="group" aria-label="Timer mode">
                    <button className={timerMode === "focus" ? "timer-mode-active" : ""} onClick={() => chooseTimerMode("focus")}><Zap size={15} /> Focus</button>
                    <button className={timerMode === "break" ? "timer-mode-active" : ""} onClick={() => chooseTimerMode("break")}><Coffee size={15} /> Short break</button>
                  </div>
                  <div className="timer-main-body">
                    <div className="timer-clock-column">
                      <div className={`timer-ring ${timerMode === "break" ? "timer-ring-break" : ""}`} style={{ "--timer-progress": `${timerProgress}%` } as React.CSSProperties}>
                        <div className="timer-ring-inner">
                          <span className="timer-mode-label">{timerMode === "focus" ? "TIME TO FOCUS" : "TAKE A BREATHER"}</span>
                          <div className="timer-digits" aria-live="polite">{timerMinutes}:{timerSeconds}</div>
                          <span className="timer-status">{timerRunning ? "Session in progress" : sessionFinished ? "Session complete" : "Ready when you are"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="timer-action-panel">
                      <div className="timer-next-label">{timerMode === "focus" ? "YOUR FOCUS BLOCK" : "YOUR BREAK"}</div>
                      <h3>{timerMode === "focus" ? `${focusDuration} minutes, one priority` : "Five minutes to reset"}</h3>
                      <p>{timerMode === "focus" ? "Put distractions aside and stay with the task until the timer ends." : "Stretch, drink water, and rest your eyes before the next block."}</p>
                      <div className="timer-controls">
                        <button className="timer-start-button" onClick={() => { if (remainingSeconds === 0) return; setSessionFinished(false); setTimerRunning((running) => !running); }} disabled={remainingSeconds === 0}>
                          {timerRunning ? <Pause size={17} /> : <Play size={17} fill="currentColor" />}
                          {timerRunning ? "Pause session" : "Start focus"}
                        </button>
                        <button className="timer-reset-button" onClick={resetTimer} aria-label="Reset timer" title="Reset timer"><RotateCcw size={16} /></button>
                      </div>
                      {timerMode === "focus" && !timerRunning && remainingSeconds === focusDuration * 60 && (
                        <div className="timer-duration-picker"><span>Duration</span>{[25, 50, 90].map((minutes) => <button key={minutes} className={focusDuration === minutes ? "duration-selected" : ""} onClick={() => setFocusDuration(minutes)}>{minutes}m</button>)}</div>
                      )}
                      {sessionFinished && <div className="timer-complete-note"><Check size={16} /> {timerMode === "focus" ? "Focus session completed. Take a short break or start another session." : "Break complete. You can return to focus when ready."}</div>}
                    </div>
                  </div>
                  <div className="timer-card-footer"><span><Clock3 size={13} /> {timerMode === "focus" ? `${focusDuration}-minute focus session` : "5-minute short break"}</span><span><Target size={13} /> Progress is saved automatically</span></div>
                </section>

                <div className="focus-side-column">
                  <section className="content-card focus-intention-card">
                    <div className="card-heading"><div><h2>Session rules</h2><p>Make the next block count.</p></div><div className="stat-icon violet"><Target size={17} /></div></div>
                    <div className="focus-rule-list">
                      <div><span>01</span><p><strong>Choose one task</strong><small>Keep the scope small and specific.</small></p></div>
                      <div><span>02</span><p><strong>Remove distractions</strong><small>Silence notifications and close extra tabs.</small></p></div>
                      <div><span>03</span><p><strong>Take your break</strong><small>Stand up, stretch, and rest your eyes.</small></p></div>
                    </div>
                  </section>
                  <section className="content-card focus-today-card">
                    <div className="card-heading"><div><h2>Today's focus</h2><p>Completed sessions in this browser</p></div><div className="stat-icon blue"><Clock3 size={17} /></div></div>
                    <div className="focus-today-stats"><div><strong>{focusStats.sessions}</strong><span>Sessions</span></div><div><strong>{focusStats.minutes}</strong><span>Minutes focused</span></div></div>
                    <div className="focus-storage-note"><Check size={14} /> Stats are saved locally in this browser.</div>
                  </section>
                </div>
              </div>
            </section>
          ) : activePage === "Analytics" ? (
            <section className="analytics-page">
              <section className="analytics-hero">
                <div className="analytics-hero-copy">
                  <div className="eyebrow"><span className="status-dot" /> YOUR PROGRESS, IN CONTEXT</div>
                  <h1>Measure what <span>moves you.</span></h1>
                  <p className="welcome-subtitle">A grounded view of your tasks, routines, and focus — based on data you have actually tracked.</p>
                </div>
                <div className="analytics-range" role="group" aria-label="Habit analytics date range">
                  <button className={analyticsRange === "7d" ? "analytics-range-active" : ""} onClick={() => setAnalyticsRange("7d")}>7 days</button>
                  <button className={analyticsRange === "30d" ? "analytics-range-active" : ""} onClick={() => setAnalyticsRange("30d")}>30 days</button>
                  <button className={analyticsRange === "all" ? "analytics-range-active" : ""} onClick={() => setAnalyticsRange("all")}>All time</button>
                </div>
              </section>

              <section className="analytics-stat-grid">
                <article className="analytics-stat-card">
                  <div className="analytics-stat-top"><span>Tasks completed</span><div className="analytics-stat-icon violet"><CheckCircle2 size={17} /></div></div>
                  <div className="analytics-stat-number">{taskDoneCount}<small> / {tasks.length}</small></div>
                  <div className="analytics-progress"><span style={{ width: `${taskCompletionRate}%` }} /></div>
                  <div className="analytics-stat-foot"><strong>{taskCompletionRate}%</strong><span>Current task list</span></div>
                </article>
                <article className="analytics-stat-card">
                  <div className="analytics-stat-top"><span>Habits checked off</span><div className="analytics-stat-icon green"><Activity size={17} /></div></div>
                  <div className="analytics-stat-number">{analyticsHabitsCompletions}<small> completions</small></div>
                  <div className="analytics-progress green-progress"><span style={{ width: `${analyticsHabitRate}%` }} /></div>
                  <div className="analytics-stat-foot"><strong>{habits.length ? `${analyticsHabitRate}%` : "—"}</strong><span>{analyticsRange === "all" ? "Since habits were added" : `Against ${analyticsDays}-day target`}</span></div>
                </article>
                <article className="analytics-stat-card">
                  <div className="analytics-stat-top"><span>Focus time today</span><div className="analytics-stat-icon blue"><Clock3 size={17} /></div></div>
                  <div className="analytics-stat-number">{focusStats.minutes}<small> min</small></div>
                  <div className="analytics-stat-foot analytics-foot-spaced"><strong>{focusStats.sessions} {focusStats.sessions === 1 ? "session" : "sessions"}</strong><span>Today only</span></div>
                  <p className="analytics-stat-note">Historical focus sessions are not stored yet.</p>
                </article>
                <article className="analytics-stat-card">
                  <div className="analytics-stat-top"><span>Still in progress</span><div className="analytics-stat-icon orange"><ListTodo size={17} /></div></div>
                  <div className="analytics-stat-number">{taskOpenCount}<small> tasks</small></div>
                  <div className="analytics-stat-foot analytics-foot-spaced"><strong>{tasks.length ? Math.round(taskOpenCount / tasks.length * 100) : 0}%</strong><span>Open in current list</span></div>
                  <p className="analytics-stat-note">Overdue tracking is not configured yet.</p>
                </article>
              </section>

              <div className="analytics-main-grid">
                <section className="content-card analytics-chart-card">
                  <div className="card-heading"><div><div className="heading-with-icon"><h2>Habit consistency</h2><span className="analytics-live-tag">LAST 7 DAYS</span></div><p>Daily completion rate across your saved habits</p></div><div className="analytics-heading-icon"><BarChart3 size={18} /></div></div>
                  {habits.length ? (
                    <div className="analytics-week-chart" role="img" aria-label="Habit completion rates over the last seven days">
                      {habitDailyBars.map((item) => (
                        <div className={`analytics-bar-column ${item.today ? "analytics-bar-today" : ""}`} key={item.key}>
                          <span className="analytics-bar-value">{item.rate}%</span>
                          <div className="analytics-bar-track"><div className="analytics-bar-fill" style={{ height: `${item.rate}%` }} /></div>
                          <span className="analytics-bar-label">{item.day}</span>
                          {item.today && <span className="analytics-today-dot" />}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="analytics-empty-chart"><div className="analytics-empty-icon"><Activity size={20} /></div><strong>Your first trend starts here</strong><p>Add a habit and check it off each day. Your consistency chart will build from your own records.</p><button className="subtle-button" onClick={() => setActivePage("Habits")}>Open habits <ArrowRight size={14} /></button></div>
                  )}
                  <div className="analytics-chart-footer"><span><span className="analytics-legend-dot" /> Daily habit completion</span><span>{habits.length} tracked {habits.length === 1 ? "habit" : "habits"}</span></div>
                </section>

                <section className="content-card analytics-task-card">
                  <div className="card-heading"><div><h2>Task breakdown</h2><p>What is on your plate right now</p></div><div className="analytics-heading-icon"><ListTodo size={18} /></div></div>
                  <div className="analytics-task-summary">
                    <div className="analytics-donut" style={{ background: `conic-gradient(var(--green) ${taskCompletionRate}%, var(--surface-raised) 0)` }}><div><strong>{taskCompletionRate}%</strong><span>complete</span></div></div>
                    <div className="analytics-task-legend"><div><span className="analytics-legend-dot completed-dot" /><span>Completed</span><strong>{taskDoneCount}</strong></div><div><span className="analytics-legend-dot open-dot" /><span>In progress</span><strong>{taskOpenCount}</strong></div></div>
                  </div>
                  <div className="analytics-divider" />
                  <div className="analytics-category-heading"><strong>Task categories</strong><span>{taskCategories.length} {taskCategories.length === 1 ? "category" : "categories"}</span></div>
                  {taskCategories.length ? <div className="analytics-categories">{taskCategories.slice(0, 4).map(([category, count]) => <div className="analytics-category-row" key={category}><div><span>{category}</span><small>{count} {count === 1 ? "task" : "tasks"}</small></div><div className="analytics-category-track"><span style={{ width: `${tasks.length ? count / tasks.length * 100 : 0}%` }} /></div></div>)}</div> : <p className="analytics-small-empty">Tasks you add will appear here.</p>}
                </section>
              </div>

              <section className="content-card analytics-insights-card">
                <div className="card-heading"><div><div className="heading-with-icon"><h2>Your current signals</h2><span className="analytics-insight-tag"><TrendingUp size={12} /> LIVE SUMMARY</span></div><p>Small, actionable observations from your current workspace</p></div></div>
                <div className="analytics-insights-grid">
                  <div className="analytics-insight-item"><div className="analytics-insight-symbol violet"><Target size={17} /></div><div><strong>{tasks.length === 0 ? "Start with one priority" : taskOpenCount === 0 ? "Your task list is clear" : `${taskOpenCount} task${taskOpenCount === 1 ? "" : "s"} to move forward`}</strong><p>{tasks.length === 0 ? "Add a task to make your progress measurable." : taskOpenCount === 0 ? "Everything currently listed is marked complete." : "Pick one open task and give it a focused block."}</p></div></div>
                  <div className="analytics-insight-item"><div className="analytics-insight-symbol green"><Flame size={17} /></div><div><strong>{habits.length === 0 ? "Create a repeatable routine" : `${habitsCompletedToday} of ${habits.length} habits completed today`}</strong><p>{habits.length === 0 ? "Your habit history will appear after you add routines." : habitsCompletedToday === habits.length ? "All your tracked habits are complete for today." : "Consistency is calculated from your saved daily check-ins."}</p></div></div>
                  <div className="analytics-insight-item"><div className="analytics-insight-symbol blue"><Timer size={17} /></div><div><strong>{focusStats.sessions ? `${focusStats.minutes} minutes of focus today` : "No completed focus sessions today"}</strong><p>{focusStats.sessions ? "Keep using the timer to build your daily focus record." : "Finish a focus timer session to record time here."}</p></div></div>
                </div>
              </section>
              <p className="analytics-data-note"><Check size={14} /> Analytics uses data saved in this browser. Task completion history and past daily focus totals are not available yet, so they are not estimated.</p>
            </section>
           ) : activePage === "Roadmaps" ? (
            <section className="roadmaps-page">
              <section className="roadmaps-hero">
                <div className="roadmaps-hero-copy">
                  <div className="eyebrow"><span className="status-dot" /> LEARNING SYSTEM</div>
                  <h1>Make progress <span>visible.</span></h1>
                  <p className="welcome-subtitle">Turn long-term goals into clear milestones. Your roadmap, your pace.</p>
                  <div className="roadmaps-hero-meta"><span><BookOpen size={14} /> {roadmaps.length} roadmaps</span><span><CheckCircle2 size={14} /> {roadmaps.reduce((sum, item) => sum + item.steps.filter((step) => step.done).length, 0)} milestones completed</span></div>
                </div>
                <div className="roadmaps-hero-art"><div className="roadmap-orbit orbit-one"/><div className="roadmap-orbit orbit-two"/><div className="roadmap-hero-symbol"><Target size={34}/></div><span className="roadmap-float float-one"><Check size={13}/></span><span className="roadmap-float float-two"><Zap size={14}/></span></div>
                <button className="primary-button roadmaps-new-button" onClick={() => { setRoadmapForm(emptyRoadmapForm); setEditingRoadmapId(null); setShowRoadmapForm((value) => !value); }}><Plus size={16}/> New roadmap</button>
              </section>

              <section className="roadmaps-stats">
                <article><span className="roadmap-stat-icon violet"><BookOpen size={16}/></span><div><small>Learning paths</small><strong>{roadmaps.length}</strong></div></article>
                <article><span className="roadmap-stat-icon green"><CheckCircle2 size={16}/></span><div><small>Milestones done</small><strong>{roadmaps.reduce((sum, item) => sum + item.steps.filter((step) => step.done).length, 0)}<em> / {roadmaps.reduce((sum, item) => sum + item.steps.length, 0)}</em></strong></div></article>
                <article><span className="roadmap-stat-icon blue"><Activity size={16}/></span><div><small>Overall progress</small><strong>{roadmaps.reduce((sum, item) => sum + item.steps.length, 0) ? Math.round(roadmaps.reduce((sum, item) => sum + item.steps.filter((step) => step.done).length, 0) / roadmaps.reduce((sum, item) => sum + item.steps.length, 0) * 100) : 0}<em>%</em></strong></div></article>
              </section>

              {showRoadmapForm && <form className="roadmap-form-card" onSubmit={saveRoadmap}>
                <div className="roadmap-form-heading"><div><span className="eyebrow">ROADMAP DETAILS</span><h2>{editingRoadmapId ? "Edit learning path" : "Create a learning path"}</h2><p>Define the destination, then list the milestones in the order you want to tackle them.</p></div><button type="button" className="icon-button" aria-label="Close roadmap form" onClick={() => { setShowRoadmapForm(false); setEditingRoadmapId(null); setRoadmapForm(emptyRoadmapForm); }}><X size={17}/></button></div>
                <div className="roadmap-form-grid"><label>Roadmap name<input required maxLength={90} value={roadmapForm.title} onChange={(event) => setRoadmapForm({ ...roadmapForm, title: event.target.value })} placeholder="e.g. React + TypeScript"/></label><label>Category<select value={roadmapForm.category} onChange={(event) => setRoadmapForm({ ...roadmapForm, category: event.target.value })}><option>Software Engineering</option><option>Data Structures & Algorithms</option><option>College</option><option>Career</option><option>Personal Growth</option><option>Other</option></select></label><label>Target date <span className="optional-label">(optional)</span><input type="date" value={roadmapForm.targetDate} onChange={(event) => setRoadmapForm({ ...roadmapForm, targetDate: event.target.value })}/></label><label className="roadmap-description-field">Description <span className="optional-label">(optional)</span><input maxLength={220} value={roadmapForm.description} onChange={(event) => setRoadmapForm({ ...roadmapForm, description: event.target.value })} placeholder="What will this roadmap help you achieve?"/></label><label className="roadmap-steps-field">Milestones <span className="optional-label">(one per line)</span><textarea required rows={5} value={roadmapForm.stepsText} onChange={(event) => setRoadmapForm({ ...roadmapForm, stepsText: event.target.value })} placeholder={"Learn the fundamentals\nBuild a small project\nReview and refine"}/><small>Completed milestones stay checked when you edit a roadmap, as long as their titles remain the same.</small></label></div>
                <div className="roadmap-form-actions"><button type="button" className="subtle-button" onClick={() => { setShowRoadmapForm(false); setEditingRoadmapId(null); setRoadmapForm(emptyRoadmapForm); }}>Cancel</button><button className="primary-button" type="submit"><Check size={15}/>{editingRoadmapId ? "Save changes" : "Create roadmap"}</button></div>
              </form>}

              <div className="roadmaps-list-heading"><div><h2>Your learning paths</h2><p>Keep each next step small enough to start today.</p></div><label className="roadmaps-search"><Search size={15}/><input value={roadmapSearch} onChange={(event) => setRoadmapSearch(event.target.value)} placeholder="Find a roadmap..." aria-label="Search roadmaps"/></label></div>
              <section className="roadmaps-list">
                {roadmaps.filter((item) => `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(roadmapSearch.toLowerCase())).map((roadmap) => {
                  const doneCount = roadmap.steps.filter((step) => step.done).length; const percent = roadmap.steps.length ? Math.round(doneCount / roadmap.steps.length * 100) : 0; const expanded = expandedRoadmapId === roadmap.id;
                  return <article className={`roadmap-item ${expanded ? "roadmap-item-expanded" : ""}`} key={roadmap.id}>
                    <div className="roadmap-item-main"><button className="roadmap-expand-button" onClick={() => setExpandedRoadmapId(expanded ? null : roadmap.id)} aria-label={`${expanded ? "Collapse" : "Expand"} ${roadmap.title}`}><ChevronDown size={17}/></button><div className="roadmap-item-mark"><BookOpen size={19}/></div><div className="roadmap-item-copy"><div className="roadmap-item-kicker">{roadmap.category}</div><h3>{roadmap.title}</h3><p>{roadmap.description || "A personal learning path built around your goals."}</p><div className="roadmap-item-meta"><span><CheckCircle2 size={13}/>{doneCount} of {roadmap.steps.length} milestones</span>{roadmap.targetDate && <span><CalendarDays size={13}/>Target {new Date(`${roadmap.targetDate}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}</div></div><div className="roadmap-progress-side"><strong>{percent}%</strong><div className="roadmap-progress-track"><span style={{ width: `${percent}%` }}/></div><small>{percent === 100 && roadmap.steps.length ? "Completed" : percent ? "In progress" : "Not started"}</small></div><div className="roadmap-item-actions"><button className="icon-button" onClick={() => editRoadmap(roadmap)} aria-label={`Edit ${roadmap.title}`}><Pencil size={15}/></button><button className="icon-button roadmap-delete-button" onClick={() => deleteRoadmap(roadmap.id)} aria-label={`Delete ${roadmap.title}`}><Trash2 size={15}/></button></div></div>
                    {expanded && <div className="roadmap-milestones"><div className="roadmap-milestones-heading"><span>MILESTONES</span><small>{roadmap.steps.length - doneCount} remaining</small></div>{roadmap.steps.map((step, index) => <label className={`roadmap-step ${step.done ? "roadmap-step-done" : ""}`} key={step.id}><input type="checkbox" checked={step.done} onChange={() => toggleRoadmapStep(roadmap.id, step.id)}/><span className="roadmap-step-number">{step.done ? <Check size={13}/> : String(index + 1).padStart(2, "0")}</span><span>{step.title}</span><small>{step.done ? "Done" : "Next step"}</small></label>)}{roadmap.steps.length === 0 && <p className="roadmap-no-steps">No milestones yet. Edit this roadmap to add your first steps.</p>}</div>}
                  </article>;
                })}
                {roadmaps.filter((item) => `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(roadmapSearch.toLowerCase())).length === 0 && <div className="roadmaps-empty"><div className="roadmaps-empty-icon"><Target size={24}/></div><h3>{roadmaps.length ? "No matching roadmaps" : "Start with a direction"}</h3><p>{roadmaps.length ? "Try another search term." : "Create a learning path, break it into milestones, and track progress as you complete each step."}</p>{!roadmaps.length && <button className="primary-button" onClick={() => setShowRoadmapForm(true)}><Plus size={15}/> Create your first roadmap</button>}</div>}
              </section>
            </section>
          ) : activePage === "Projects" ? (
            <section className="projects-page">
              <section className="projects-hero">
                <div>
                  <div className="eyebrow"><span className="status-dot" /> PROJECT WORKSPACE</div>
                  <h1>Build with <span>intent.</span></h1>
                  <p className="welcome-subtitle">Keep your builds, assignments, and personal projects moving forward.</p>
                </div>
                <button className="primary-button projects-add-button" onClick={() => { setProjectForm(emptyProjectForm); setEditingProjectId(null); setShowProjectForm((value) => !value); }}><Plus size={16} /> New project</button>
              </section>

              <section className="projects-overview-grid">
                <article className="projects-overview-card"><span className="projects-overview-icon violet"><FolderKanban size={17} /></span><span className="projects-overview-label">Total projects</span><strong>{projects.length}</strong><small>Saved in this browser</small></article>
                <article className="projects-overview-card"><span className="projects-overview-icon blue"><Activity size={17} /></span><span className="projects-overview-label">In progress</span><strong>{projects.filter((item) => item.status === "In progress").length}</strong><small>Currently being worked on</small></article>
                <article className="projects-overview-card"><span className="projects-overview-icon orange"><Clock3 size={17} /></span><span className="projects-overview-label">Planning / on hold</span><strong>{projects.filter((item) => item.status === "Planning" || item.status === "On hold").length}</strong><small>Waiting for the next step</small></article>
                <article className="projects-overview-card"><span className="projects-overview-icon green"><CheckCircle2 size={17} /></span><span className="projects-overview-label">Completed</span><strong>{projects.filter((item) => item.status === "Completed").length}</strong><small>Marked as finished</small></article>
              </section>

              {showProjectForm && <section className="content-card projects-form-card">
                <div className="card-heading"><div><h2>{editingProjectId ? "Edit project" : "Create a project"}</h2><p>Start with the essentials. You can update these details later.</p></div><button className="icon-button" aria-label="Close project form" onClick={() => { setShowProjectForm(false); setEditingProjectId(null); setProjectForm(emptyProjectForm); }}><X size={17} /></button></div>
                <form className="projects-form" onSubmit={saveProject}>
                  <label className="projects-field projects-field-wide">Project name<input required maxLength={100} value={projectForm.title} onChange={(event) => setProjectForm((current) => ({ ...current, title: event.target.value }))} placeholder="e.g. Personal portfolio" /></label>
                  <label className="projects-field projects-field-wide">Description<textarea maxLength={500} value={projectForm.description} onChange={(event) => setProjectForm((current) => ({ ...current, description: event.target.value }))} placeholder="What are you building and why?" rows={3} /></label>
                  <label className="projects-field">Category<select value={projectForm.category} onChange={(event) => setProjectForm((current) => ({ ...current, category: event.target.value }))}><option>Development</option><option>College</option><option>Career</option><option>Personal</option><option>Research</option><option>Other</option></select></label>
                  <label className="projects-field">Status<select value={projectForm.status} onChange={(event) => setProjectForm((current) => ({ ...current, status: event.target.value as ProjectStatus }))}><option>Planning</option><option>In progress</option><option>On hold</option><option>Completed</option></select></label>
                  <label className="projects-field">Priority<select value={projectForm.priority} onChange={(event) => setProjectForm((current) => ({ ...current, priority: event.target.value as ProjectPriority }))}><option>Low</option><option>Medium</option><option>High</option></select></label>
                  <label className="projects-field">Deadline<input type="date" value={projectForm.deadline} onChange={(event) => setProjectForm((current) => ({ ...current, deadline: event.target.value }))} /></label>
                  <label className="projects-field">GitHub / repository URL<input type="url" value={projectForm.repoUrl} onChange={(event) => setProjectForm((current) => ({ ...current, repoUrl: event.target.value }))} placeholder="https://github.com/..." /></label>
                  <label className="projects-field">Live project URL<input type="url" value={projectForm.liveUrl} onChange={(event) => setProjectForm((current) => ({ ...current, liveUrl: event.target.value }))} placeholder="https://..." /></label>
                  <div className="projects-form-actions"><button type="button" className="secondary-button" onClick={() => { setShowProjectForm(false); setEditingProjectId(null); setProjectForm(emptyProjectForm); }}>Cancel</button><button type="submit" className="primary-button"><Check size={15} /> {editingProjectId ? "Save changes" : "Create project"}</button></div>
                </form>
              </section>}

              <section className="projects-list-section">
                <div className="projects-list-heading"><div><h2>Your projects</h2><p>Track status and keep important links close.</p></div><span className="projects-count-pill">{projects.length} total</span></div>
                <div className="projects-toolbar"><div className="projects-filter-tabs" role="group" aria-label="Filter projects">{(["All", "Planning", "In progress", "On hold", "Completed"] as const).map((filter) => <button key={filter} className={projectFilter === filter ? "active" : ""} onClick={() => setProjectFilter(filter)}>{filter}</button>)}</div><label className="projects-search"><Search size={15} /><input value={projectSearch} onChange={(event) => setProjectSearch(event.target.value)} placeholder="Search projects" aria-label="Search projects" /></label></div>
                {(() => {
                  const visibleProjects = projects.filter((project) => (projectFilter === "All" || project.status === projectFilter) && `${project.title} ${project.description} ${project.category}`.toLowerCase().includes(projectSearch.toLowerCase()));
                  return visibleProjects.length ? <div className="projects-grid">{visibleProjects.map((project) => {
                    const overdue = project.deadline && project.deadline < todayKey && project.status !== "Completed";
                    return <article className="project-item-card" key={project.id}>
                      <div className="project-item-top"><span className={`project-category-mark ${project.category.toLowerCase().replace(/[^a-z]+/g, "-")}`}><FolderKanban size={17} /></span><button className="icon-button project-more-button" aria-label={`Edit ${project.title}`} onClick={() => editProject(project)}><Pencil size={15} /></button></div>
                      <div className="project-item-tags"><span className={`project-status status-${project.status.toLowerCase().replace(/\s+/g, "-")}`}>{project.status}</span><span className={`project-priority priority-${project.priority.toLowerCase()}`}>{project.priority} priority</span></div>
                      <h3>{project.title}</h3><p className="project-item-description">{project.description || "No description added yet."}</p>
                      <div className="project-item-meta"><span><BookOpen size={13} /> {project.category}</span><span className={overdue ? "project-deadline overdue" : "project-deadline"}><CalendarDays size={13} /> {project.deadline ? `${overdue ? "Overdue · " : "Due "}${new Date(`${project.deadline}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : "No deadline"}</span></div>
                      <div className="project-status-control"><label htmlFor={`project-status-${project.id}`}>Update status</label><select id={`project-status-${project.id}`} value={project.status} onChange={(event) => setProjects((current) => current.map((item) => item.id === project.id ? { ...item, status: event.target.value as ProjectStatus } : item))}><option>Planning</option><option>In progress</option><option>On hold</option><option>Completed</option></select></div>
                      {(project.repoUrl || project.liveUrl) && <div className="project-links">{project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noreferrer"><Command size={13} /> Repository <ArrowUpRight size={12} /></a>}{project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer"><ArrowUpRight size={13} /> Live preview <ArrowUpRight size={12} /></a>}</div>}
                      <div className="project-item-footer"><span><span className="project-footer-dot" /> Updated in this workspace</span><button onClick={() => deleteProject(project.id)} aria-label={`Delete ${project.title}`}><Trash2 size={14} /> Delete</button></div>
                    </article>;
                  })}</div> : <div className="projects-empty-state"><div className="projects-empty-icon"><FolderKanban size={23} /></div><h3>{projects.length ? "No matching projects" : "Your next idea starts here."}</h3><p>{projects.length ? "Try another search or status filter." : "Add a development project, college assignment, or personal build to start tracking it here."}</p>{!projects.length && <button className="primary-button" onClick={() => setShowProjectForm(true)}><Plus size={15} /> Create your first project</button>}</div>;
                })()}
              </section>
            </section>
          ) : activePage === "Settings" ? (
            <section className="settings-page">
              <section className="settings-hero">
                <div>
                  <div className="eyebrow"><span className="status-dot" /> WORKSPACE PREFERENCES</div>
                  <h1>Make it <span>yours.</span></h1>
                  <p className="welcome-subtitle">Tune your workspace to support the way you work.</p>
                </div>
                <div className="settings-hero-mark"><Settings size={23} /></div>
              </section>

              <div className="settings-layout">
                <div className="settings-main-column">
                  <section className="content-card settings-card">
                    <div className="settings-card-heading">
                      <div className="settings-heading-icon appearance-icon"><Sun size={18} /></div>
                      <div><h2>Appearance</h2><p>Choose the theme you want to work in.</p></div>
                    </div>
                    <div className="settings-theme-options">
                      <button type="button" className={`settings-theme-option ${dark ? "selected" : ""}`} onClick={() => setDark(true)} aria-pressed={dark}>
                        <span className="theme-preview theme-preview-dark"><span /><span /><span /></span>
                        <span className="settings-option-copy"><strong>Dark</strong><small>Low-light workspace</small></span>
                        <span className="settings-radio">{dark && <Check size={12} />}</span>
                      </button>
                      <button type="button" className={`settings-theme-option ${!dark ? "selected" : ""}`} onClick={() => setDark(false)} aria-pressed={!dark}>
                        <span className="theme-preview theme-preview-light"><span /><span /><span /></span>
                        <span className="settings-option-copy"><strong>Light</strong><small>Bright and clear</small></span>
                        <span className="settings-radio">{!dark && <Check size={12} />}</span>
                      </button>
                    </div>
                  </section>

                  <section className="content-card settings-card">
                    <div className="settings-card-heading">
                      <div className="settings-heading-icon timer-settings-icon"><Timer size={18} /></div>
                      <div><h2>Focus timer</h2><p>Set the default length for a focus session.</p></div>
                    </div>
                    <div className="settings-duration-options" role="group" aria-label="Default focus duration">
                      {[25, 50, 90].map((duration) => (
                        <button type="button" key={duration} className={`settings-duration-option ${focusDuration === duration ? "selected" : ""}`} aria-pressed={focusDuration === duration} disabled={timerRunning} onClick={() => { setFocusDuration(duration); setSettingsMessage(timerRunning ? "Pause the timer before changing its duration." : "Default focus duration updated."); }}>
                          <strong>{duration}</strong><span>minutes</span>{focusDuration === duration && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                    {timerRunning && <p className="settings-inline-note">Pause your running timer before changing its duration.</p>}
                    <p className="settings-help-text">This updates the Focus Timer default and resets the current timer when its mode or duration changes.</p>
                  </section>

                  <section className="content-card settings-card">
                    <div className="settings-card-heading">
                      <div className="settings-heading-icon profile-settings-icon"><Command size={18} /></div>
                      <div><h2>Profile</h2><p>Choose the name shown in your sidebar.</p></div>
                    </div>
                    <label className="settings-field-label" htmlFor="settings-display-name">Display name</label>
                    <input id="settings-display-name" className="settings-text-input" value={displayName} maxLength={40} onChange={(event) => setDisplayName(event.target.value)} placeholder="Enter a display name" />
                    <div className="settings-field-footer"><span>Up to 40 characters</span><span>{displayName.length}/40</span></div>
                  </section>

                  <section className="content-card settings-card">
                    <div className="settings-card-heading">
                      <div className="settings-heading-icon notification-settings-icon"><Bell size={18} /></div>
                      <div><h2>Browser notifications</h2><p>Manage this browser's permission for notifications.</p></div>
                    </div>
                    <div className="settings-notification-row">
                      <div className="settings-notification-copy">
                        <strong>{notificationPermission === "granted" ? "Permission enabled" : notificationPermission === "denied" ? "Permission blocked" : notificationPermission === "unsupported" ? "Not supported" : "Permission not enabled"}</strong>
                        <span>{notificationPermission === "granted" ? "This site can request to show browser notifications." : notificationPermission === "denied" ? "Change the permission in your browser's site settings." : "Your browser will ask for permission when you enable this."}</span>
                      </div>
                      <button type="button" className="primary-button settings-notification-button" onClick={enableNotifications} disabled={notificationPermission === "granted" || notificationPermission === "unsupported"}>
                        <Bell size={15} /> {notificationPermission === "granted" ? "Enabled" : notificationPermission === "denied" ? "Check settings" : "Enable"}
                      </button>
                    </div>
                    <p className="settings-help-text">This only requests browser permission. Timed reminders and notifications while the app is closed are not connected yet.</p>
                    {settingsMessage && <p className="settings-message" role="status">{settingsMessage}</p>}
                  </section>

                  <section className="content-card settings-card">
                    <div className="settings-card-heading">
                      <div className="settings-heading-icon notification-settings-icon"><Bell size={18} /></div>
                      <div><h2>Reminder schedule</h2><p>Choose which daily reminders you want this browser to send.</p></div>
                    </div>
                    <div className="settings-reminder-list">
                      {([
                        ["tasks", "Task planning", "A prompt to review your open tasks"],
                        ["habits", "Habit check-in", "A prompt to complete your daily habits"],
                        ["classes", "Class preparation", "A prompt to check your class schedule"],
                        ["focus", "Focus session", "A prompt to start a focused work block"],
                      ] as const).map(([key, title, description]) => (
                        <div className="settings-reminder-item" key={key}>
                          <label className="settings-reminder-toggle">
                            <input type="checkbox" checked={reminderPreferences[key].enabled} onChange={(event) => setReminderPreferences((current) => ({ ...current, [key]: { ...current[key], enabled: event.target.checked } }))} />
                            <span className="settings-toggle-track" aria-hidden="true"><span /></span>
                            <span className="settings-reminder-label"><strong>{title}</strong><small>{description}</small></span>
                          </label>
                          <label className="settings-reminder-time-label">Time
                            <input type="time" value={reminderPreferences[key].time} disabled={!reminderPreferences[key].enabled} onChange={(event) => setReminderPreferences((current) => ({ ...current, [key]: { ...current[key], time: event.target.value } }))} aria-label={`${title} reminder time`} />
                          </label>
                        </div>
                      ))}
                    </div>
                    <p className="settings-help-text">Reminders are checked while this page is open and browser notification permission is granted. They do not run after you close the browser. Times use your device's local timezone.</p>
                  </section>

                  <section className="content-card settings-card">
                    <div className="settings-card-heading">
                      <div className="settings-heading-icon data-settings-icon"><Download size={18} /></div>
                      <div><h2>Workspace data</h2><p>Back up your saved information or restore default preferences.</p></div>
                    </div>
                    <div className="settings-data-row">
                      <div className="settings-data-copy"><strong>Export a backup</strong><span>Download tasks, habits, classes, focus stats, and preferences as a JSON file.</span></div>
                      <button type="button" className="secondary-button settings-data-button" onClick={exportWorkspaceData}><Download size={15} /> Export data</button>
                    </div>
                    <div className="settings-data-divider" />
                    <div className="settings-data-row">
                      <div className="settings-data-copy"><strong>Reset preferences</strong><span>Restore the default theme, profile name, and focus duration. Your saved workspace data stays untouched.</span></div>
                      <button type="button" className="settings-reset-button" onClick={resetPreferences}><RotateCcw size={15} /> Reset</button>
                    </div>
                    {settingsDataMessage && <p className="settings-message" role="status">{settingsDataMessage}</p>}
                  </section>
                </div>

                <aside className="settings-side-column">
                  <section className="settings-summary-card">
                    <div className="settings-summary-top"><div className="settings-summary-icon"><Sparkles size={18} /></div><span>YOUR SETUP</span></div>
                    <h2>A workspace that fits you.</h2>
                    <p>Your preferences are saved in this browser and applied to your Command Center.</p>
                    <div className="settings-summary-divider" />
                    <div className="settings-summary-item"><span>Theme</span><strong>{dark ? "Dark mode" : "Light mode"}</strong></div>
                    <div className="settings-summary-item"><span>Focus session</span><strong>{focusDuration} minutes</strong></div>
                    <div className="settings-summary-item"><span>Display name</span><strong>{displayName.trim() || "My profile"}</strong></div>
                    <div className="settings-summary-item"><span>Notifications</span><strong>{notificationPermission === "granted" ? "Permission enabled" : notificationPermission === "denied" ? "Blocked by browser" : notificationPermission === "unsupported" ? "Not supported" : "Not enabled"}</strong></div>
                    <div className="settings-summary-item"><span>Active reminders</span><strong>{Object.values(reminderPreferences).filter((item) => item.enabled).length} of 4</strong></div>
                  </section>
                  <section className="settings-info-card"><div className="settings-info-icon"><CheckCircle2 size={17} /></div><div><strong>Local by design</strong><p>These preferences are stored in this browser. They are not synced to an account or database yet.</p></div></section>
                </aside>
              </div>
            </section>
          ) : (
            <section className="placeholder-page">
              <div className="placeholder-icon"><Command size={24} /></div>
              <div className="eyebrow">YOUR WORKSPACE</div>
              <h1>{activePage}</h1>
              <p>
                This section is part of your Command Center. We'll build it
                step by step after the dashboard foundation is in place.
              </p>
              <button className="primary-button" onClick={() => setActivePage("Overview")}>
                <ArrowRight size={16} /> Return to overview
              </button>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
