"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Download, FileText, RotateCcw, Search } from "lucide-react";
import "./ai-ml-notes.css";

type Week = { title: string; topics: string[] };
type Phase = { title: string; duration: string; weeks: Week[] };
type Project = { title: string; tasks: string[] };
type Semester = { title: string; subtitle: string; outcome: string; phases: Phase[]; projects: Project[] };

const semesters: Semester[] = [
  {
    title: "Semester 4", subtitle: "Foundation · Python, mathematics & data science",
    outcome: "Become comfortable writing Python, understand the mathematical foundations of ML, and independently clean, analyze and visualize datasets.",
    phases: [
      { title: "Python programming", duration: "3 weeks", weeks: [
        { title: "Python setup & fundamentals", topics: ["Install Python and configure VS Code / Jupyter","Understand variables, data types and type conversion","Use arithmetic, comparison and logical operators","Write conditional statements: if, elif and else","Practise for loops and while loops","Write functions with parameters and return values","Use strings, indexing, slicing and common string methods"] },
        { title: "Python data structures", topics: ["Create and modify lists","Use tuples and unpacking","Use sets and set operations","Create and update dictionaries","Iterate through lists and dictionaries","Write list comprehensions","Write dictionary and set comprehensions"] },
        { title: "Object-oriented and practical Python", topics: ["Understand classes and objects","Implement constructors and instance methods","Use inheritance and polymorphism","Handle exceptions with try / except","Read and write files","Use modules and packages","Create virtual environments and install packages with pip","Use Git and GitHub for version control"] }
      ]},
      { title: "Mathematics for AI/ML", duration: "4 weeks", weeks: [
        { title: "Linear algebra — vectors & matrices", topics: ["Understand scalars, vectors and matrices","Perform vector and matrix operations","Multiply matrices","Calculate dot products","Understand transpose and inverse","Practise matrix operations using Python"] },
        { title: "Linear algebra — deeper concepts", topics: ["Understand eigenvalues and eigenvectors at an introductory level","Build geometric intuition for vectors and matrices","Connect matrix operations to data representation"] },
        { title: "Statistics", topics: ["Calculate mean, median and mode","Understand variance and standard deviation","Read percentiles and distributions","Understand correlation and covariance","Understand sampling and sampling bias"] },
        { title: "Probability & calculus", topics: ["Understand basic and conditional probability","Apply Bayes' theorem","Understand common probability distributions","Understand the normal distribution","Review functions and limits","Understand derivatives and partial derivatives","Apply the chain rule and gradients","Build intuition for gradient descent"] }
      ]},
      { title: "Data Science", duration: "4 weeks", weeks: [
        { title: "NumPy", topics: ["Create NumPy arrays","Understand array dimensions and shapes","Use indexing and slicing","Understand broadcasting","Use vectorization","Perform matrix operations"] },
        { title: "Pandas fundamentals", topics: ["Understand Series and DataFrames","Read CSV and Excel files","Filter and sort data","Group data and aggregate results","Select and transform columns"] },
        { title: "Data cleaning", topics: ["Detect and handle missing values","Find and remove duplicates","Clean inconsistent values and data types","Merge datasets","Prepare a reusable data-cleaning workflow"] },
        { title: "Visualization & exploratory analysis", topics: ["Create plots with Matplotlib","Use Seaborn for statistical visualization","Build histograms, scatter plots and bar charts","Create heatmaps and correlation plots","Perform exploratory data analysis (EDA)","Detect outliers and inspect feature relationships","Apply basic data preprocessing"] }
      ]},
      { title: "Semester 4 projects", duration: "Ongoing", weeks: [
        { title: "Student Performance Analysis", topics: ["Select and understand a student performance dataset","Clean missing, duplicate and inconsistent values","Perform exploratory data analysis","Visualize important feature relationships","Document findings and publish the project on GitHub"] },
        { title: "Indian House Price Data Analysis", topics: ["Find a suitable Indian house-price dataset","Inspect and clean the dataset","Analyze price distributions and location patterns","Create useful visualizations","Document insights and publish the project on GitHub"] },
        { title: "Personal Expense Data Analysis", topics: ["Prepare an expense dataset","Load and clean data using Pandas","Analyze spending categories and monthly trends","Visualize spending patterns","Write a README and publish the project on GitHub"] }
      ]}
    ],
    projects: [
      { title: "Student Performance Analysis", tasks: ["Dataset selected and understood","Data cleaning completed","EDA and visualizations completed","Insights documented","GitHub repository published"] },
      { title: "Indian House Price Data Analysis", tasks: ["Dataset selected and understood","Data cleaning completed","EDA and visualizations completed","Insights documented","GitHub repository published"] },
      { title: "Personal Expense Data Analysis", tasks: ["Expense data prepared","Pandas analysis completed","Charts and insights completed","README written","GitHub repository published"] }
    ]
  },
  {
    title: "Semester 5", subtitle: "Core technical semester · Machine learning & deep learning",
    outcome: "Train and evaluate classical machine-learning models, prepare data correctly, and build neural networks using PyTorch.",
    phases: [
      { title: "Machine Learning fundamentals", duration: "5 weeks", weeks: [
        { title: "ML foundations", topics: ["Explain what Machine Learning is","Distinguish AI, ML and Deep Learning","Understand supervised, unsupervised and reinforcement learning","Understand features and labels","Split data into training, validation and test sets"] },
        { title: "Regression algorithms", topics: ["Implement Linear Regression","Understand Multiple Linear Regression","Understand Polynomial Regression","Train a regression model using scikit-learn","Interpret predictions and residuals"] },
        { title: "Classification — foundations", topics: ["Understand Logistic Regression","Implement K-Nearest Neighbors","Understand Naive Bayes","Choose classification metrics for a use case"] },
        { title: "Classification — tree and margin models", topics: ["Understand Decision Trees","Implement Random Forest","Understand Support Vector Machines","Compare classification algorithms"] },
        { title: "Unsupervised learning", topics: ["Implement K-Means clustering","Understand Hierarchical Clustering","Understand DBSCAN at an introductory level","Understand Principal Component Analysis (PCA)","Interpret clusters and reduced dimensions"] }
      ]},
      { title: "Advanced ML concepts", duration: "3 weeks", weeks: [
        { title: "Preprocessing & feature engineering", topics: ["Perform feature engineering","Apply feature selection","Build preprocessing pipelines","Encode categorical variables","Apply normalization and standardization"] },
        { title: "Model reliability", topics: ["Identify overfitting and underfitting","Explain the bias-variance tradeoff","Apply L1 and L2 regularization","Use cross-validation","Recognize data leakage","Handle imbalanced datasets"] },
        { title: "Evaluation & hyperparameter tuning", topics: ["Calculate accuracy, precision and recall","Interpret F1-score and confusion matrix","Understand ROC curve and AUC","Evaluate regression with MAE, MSE and RMSE","Tune hyperparameters","Use Grid Search and Random Search"] }
      ]},
      { title: "Deep Learning", duration: "5 weeks", weeks: [
        { title: "Neural network foundations", topics: ["Understand the biological-neuron inspiration","Explain artificial neurons and perceptrons","Understand neural network layers","Compare activation functions"] },
        { title: "How neural networks learn", topics: ["Explain forward propagation","Understand backpropagation","Choose loss functions","Understand gradient descent","Understand optimizers and learning rate","Explain epochs and batch size"] },
        { title: "PyTorch foundations", topics: ["Create and manipulate tensors","Use tensor operations","Understand autograd","Build a neural network","Write a training loop","Calculate loss and update model parameters"] },
        { title: "PyTorch model workflow", topics: ["Save and load model weights","Understand GPU basics","Train and evaluate a model in PyTorch","Inspect training and validation behaviour","Debug a basic training workflow"] },
        { title: "Deep learning architectures", topics: ["Understand Artificial Neural Networks","Understand Convolutional Neural Networks (CNNs)","Understand Recurrent Neural Networks (RNNs) at an introductory level","Understand LSTM at an introductory level"] }
      ]},
      { title: "Semester 5 projects", duration: "Ongoing", weeks: [
        { title: "House Price Prediction using Regression", topics: ["Prepare dataset and define the target","Build a regression baseline","Evaluate with MAE, MSE and RMSE","Improve preprocessing and features","Document and publish the project"] },
        { title: "Customer Churn Prediction", topics: ["Explore and clean a churn dataset","Build a classification baseline","Evaluate precision, recall and F1-score","Handle class imbalance if present","Document and publish the project"] },
        { title: "Handwritten Digit Recognition", topics: ["Prepare a handwritten-digit dataset","Build a neural network in PyTorch","Train and evaluate the model","Inspect predictions and errors","Document and publish the project"] }
      ]}
    ],
    projects: [
      { title: "House Price Prediction", tasks: ["Dataset and target selected","Baseline regression model trained","Evaluation metrics reported","Model improvement attempted","GitHub README and results published"] },
      { title: "Customer Churn Prediction", tasks: ["Dataset explored and cleaned","Classification model trained","Precision, recall and F1 reported","Class imbalance handled if needed","GitHub README and results published"] },
      { title: "Handwritten Digit Recognition", tasks: ["Dataset prepared","PyTorch network implemented","Training and evaluation completed","Prediction examples documented","GitHub repository published"] }
    ]
  },
  {
    title: "Semester 6", subtitle: "Specialization · NLP, Generative AI & LLM engineering",
    outcome: "Build language-processing applications, integrate LLMs, implement retrieval-augmented generation, and create tool-using agent workflows.",
    phases: [
      { title: "Natural Language Processing", duration: "3 weeks", weeks: [
        { title: "NLP foundations", topics: ["Explain what Natural Language Processing is","Preprocess raw text","Understand tokenization","Understand stop words","Apply stemming and lemmatization"] },
        { title: "Text representation", topics: ["Understand Bag of Words","Implement TF-IDF","Understand N-grams","Understand word embeddings","Study Word2Vec and GloVe"] },
        { title: "NLP applications", topics: ["Build a text-classification pipeline","Understand sentiment analysis","Train and evaluate a basic text classifier"] }
      ]},
      { title: "Transformers & LLM fundamentals", duration: "3 weeks", weeks: [
        { title: "Attention and transformers", topics: ["Understand the attention mechanism","Explain self-attention","Understand multi-head attention","Understand positional encoding"] },
        { title: "Transformer architecture", topics: ["Understand encoder and decoder blocks","Explain the Transformer architecture","Understand BERT at a high level","Understand GPT architecture at a high level","Understand tokenizers"] },
        { title: "Large Language Model concepts", topics: ["Explain what LLMs are","Understand pre-training and fine-tuning","Understand inference","Understand context windows","Understand temperature and sampling","Understand model parameters","Recognize hallucinations","Compare open-source and proprietary models"] }
      ]},
      { title: "Generative AI application development", duration: "4 weeks", weeks: [
        { title: "LLM APIs & prompting", topics: ["Integrate an LLM API","Practise prompt engineering","Write system and user prompts","Request structured output and JSON responses"] },
        { title: "Application integration", topics: ["Use function calling / tool calling","Stream model responses","Handle API errors and retries","Track token usage and manage cost"] },
        { title: "Embeddings & vector search", topics: ["Explain embeddings","Calculate semantic similarity and cosine similarity","Understand embedding models and vector representations","Explore FAISS and ChromaDB"] },
        { title: "Retrieval-Augmented Generation", topics: ["Explain RAG architecture","Load and parse documents","Chunk text appropriately","Generate embeddings and retrieve relevant chunks","Understand reranking and context construction","Generate grounded answers with source citations","Evaluate retrieval and answer quality","Understand pgvector and metadata filtering"] }
      ]},
      { title: "AI Agents and workflows", duration: "3 weeks", weeks: [
        { title: "Agent foundations", topics: ["Explain what AI agents are","Understand LLM tool calling","Understand agent architecture","Distinguish workflows from agents","Understand agent state"] },
        { title: "Building agent workflows", topics: ["Understand short-term and long-term memory","Integrate tools","Build multi-step workflows","Add human approval","Handle failures and errors"] },
        { title: "Agent frameworks", topics: ["Understand LangChain fundamentals","Understand LangGraph fundamentals","Understand multi-agent systems at an introductory level","Build a small tool-using workflow"] }
      ]},
      { title: "Semester 6 projects", duration: "Ongoing", weeks: [
        { title: "AI Resume Analyzer", topics: ["Define resume input and analysis criteria","Extract and process resume text","Integrate an LLM with structured output","Add useful feedback and error handling","Test and publish the application"] },
        { title: "PDF-Based Personal Knowledge Assistant using RAG", topics: ["Upload and parse PDFs","Chunk documents and create embeddings","Implement vector retrieval","Generate answers with source citations","Evaluate retrieval and answer quality; deploy"] },
        { title: "AI Research Assistant using Agent Workflows", topics: ["Define agent workflow and tools","Implement tool calling","Add state and human approval","Handle errors and test outputs","Document and deploy the application"] }
      ]}
    ],
    projects: [
      { title: "AI Resume Analyzer", tasks: ["Resume text extraction works","LLM structured analysis works","Feedback output implemented","Error cases tested","Application deployed and documented"] },
      { title: "PDF Knowledge Assistant (RAG)", tasks: ["PDF upload and parsing","Chunking and embeddings","Vector retrieval","Answers include source citations","RAG evaluation and deployment"] },
      { title: "AI Research Assistant", tasks: ["Agent workflow designed","Tools integrated","State and human approval added","Error handling and tests completed","Application deployed and documented"] }
    ]
  },
  {
    title: "Semester 7", subtitle: "Employment preparation · MLOps & production AI",
    outcome: "Ship and maintain production AI applications, understand deployment and monitoring, and present a substantial capstone project.",
    phases: [
      { title: "AI backend development", duration: "3 weeks", weeks: [
        { title: "Python backend foundations", topics: ["Review advanced Python concepts","Build APIs using FastAPI","Understand REST API development","Validate requests and responses with Pydantic"] },
        { title: "Backend application features", topics: ["Implement authentication","Understand JWT","Use asynchronous programming","Generate API documentation","Integrate a database"] },
        { title: "Database foundations", topics: ["Use PostgreSQL and SQL queries","Understand database design and indexing","Understand transactions","Explore pgvector and Redis basics","Connect AI services to a backend"] }
      ]},
      { title: "MLOps and deployment", duration: "4 weeks", weeks: [
        { title: "Software engineering for deployment", topics: ["Use Git and GitHub workflows","Understand Linux fundamentals","Use Docker","Use Docker Compose","Manage environment variables","Implement logging and testing"] },
        { title: "CI/CD and model lifecycle", topics: ["Understand CI/CD","Create GitHub Actions workflows","Understand model versioning","Track experiments with MLflow"] },
        { title: "Model operations", topics: ["Deploy a model","Monitor model behaviour","Understand data drift","Understand model drift","Understand model retraining pipelines"] },
        { title: "Cloud & LLMOps", topics: ["Understand AWS fundamentals: EC2, S3 and IAM","Deploy a basic cloud application","Explore managed AI services","Evaluate LLM outputs","Version prompts and trace requests","Monitor latency, token usage and cost","Evaluate retrieval; understand guardrails and safety"] }
      ]},
      { title: "Advanced AI engineering", duration: "3 weeks", weeks: [
        { title: "Fine-tuning and optimization", topics: ["Understand fine-tuning and transfer learning","Understand LoRA","Understand parameter-efficient fine-tuning","Understand quantization","Explore inference optimization and model selection"] },
        { title: "Advanced RAG", topics: ["Understand hybrid search","Understand reranking","Apply query rewriting","Use metadata filtering","Evaluate retrieval quality","Explore advanced chunking"] },
        { title: "AI system design", topics: ["Design AI applications","Understand scalable inference","Use caching and rate limiting","Optimize model and infrastructure cost","Design for reliability","Address security and privacy"] }
      ]},
      { title: "Final-year capstone", duration: "3–4 weeks initially; refine throughout", weeks: [
        { title: "Plan the Enterprise AI Knowledge Management Platform", topics: ["Define users, requirements and architecture","Design authentication and the data model","Plan document ingestion and PDF processing"] },
        { title: "Build the core knowledge system", topics: ["Implement document uploads and processing","Integrate a vector database","Implement RAG question answering","Add source citations"] },
        { title: "Build product features", topics: ["Integrate AI agent workflows","Add conversation history","Build an admin dashboard","Add usage tracking","Implement evaluation and monitoring"] },
        { title: "Production readiness", topics: ["Add tests, security and error handling","Deploy to the cloud","Document architecture and setup","Prepare a demo and portfolio presentation"] }
      ]}
    ],
    projects: [
      { title: "Enterprise AI Knowledge Management Platform", tasks: ["Requirements and architecture documented","Authentication implemented","Document uploads and PDF processing","Vector database integrated","RAG answers include source citations","Agent workflows integrated","Conversation history and admin dashboard","Usage tracking, evaluation and monitoring","Cloud deployment completed","README, demo and architecture documentation"] }
    ]
  }
];

type Saved = { topics: Record<string, boolean>; projects: Record<string, boolean>; reviews: Record<string, string> };
const storageKey = "aiml-notes-tracker-v1";
const topicKey = (s: number, p: number, w: number, t: number) => `${s}.${p}.${w}.${t}`;
const projectKey = (s: number, p: number, t: number) => `${s}.${p}.${t}`;

export default function AiMlNotesPage() {
  const [semester, setSemester] = useState(0);
  const [phase, setPhase] = useState(0);
  const [week, setWeek] = useState(0);
  const [mode, setMode] = useState<"topics" | "projects" | "review">("topics");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<Saved>({ topics: {}, projects: {}, reviews: {} });
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState("Loading progress...");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) { const parsed = JSON.parse(raw); setSaved({ topics: parsed.topics ?? {}, projects: parsed.projects ?? {}, reviews: parsed.reviews ?? {} }); }
    } catch { setStatus("Could not load saved progress"); }
    finally { setLoaded(true); }
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(storageKey, JSON.stringify(saved)); setStatus("Autosaved in this browser"); }
    catch { setStatus("Storage is full — export a backup"); }
  }, [saved, loaded]);

  const currentSemester = semesters[semester];
  const currentPhase = currentSemester.phases[phase];
  const currentWeek = currentPhase.weeks[week];
  const allTopicCount = useMemo(() => semesters.reduce((sum, s) => sum + s.phases.reduce((a, p) => a + p.weeks.reduce((b, w) => b + w.topics.length, 0), 0), 0), []);
  const completedTopics = Object.values(saved.topics).filter(Boolean).length;
  const startedProjects = Object.values(saved.projects).filter(Boolean).length;
  const totalProjectTasks = semesters.reduce((sum, s) => sum + s.projects.reduce((a, p) => a + p.tasks.length, 0), 0);
  const totalDoneProjectTasks = Object.values(saved.projects).filter(Boolean).length;
  const reviewedPhases = Object.values(saved.reviews).filter((v) => v.trim()).length;
  const filteredPhases = currentSemester.phases.map((p, i) => ({ p, i })).filter(({ p, i }) => `${currentSemester.title} phase ${i + 1} ${p.title} ${p.weeks.map(w => w.title + " " + w.topics.join(" ")).join(" ")}`.toLowerCase().includes(query.toLowerCase()));

  function exportBackup() {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ ...saved, exportedAt: new Date().toISOString(), schema: 1 }, null, 2)], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = "ai-ml-roadmap-backup.json"; a.click(); URL.revokeObjectURL(url); setStatus("Backup exported");
  }
  function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { try { const parsed = JSON.parse(String(reader.result)); if (!parsed.topics || !parsed.projects) throw new Error(); if (confirm("Replace the progress currently stored in this browser?")) { setSaved({ topics: parsed.topics, projects: parsed.projects, reviews: parsed.reviews ?? {} }); setStatus("Backup imported"); } } catch { setStatus("Invalid backup file"); } event.target.value = ""; };
    reader.readAsText(file);
  }
  function toggleTopic(key: string, value: boolean) { setSaved(old => ({ ...old, topics: { ...old.topics, [key]: value } })); }
  function phaseCount(phaseIndex: number) {
    const ph = currentSemester.phases[phaseIndex]; let total = 0, done = 0;
    ph.weeks.forEach((w, wi) => w.topics.forEach((_, ti) => { total++; if (saved.topics[topicKey(semester, phaseIndex, wi, ti)]) done++; }));
    return { total, done };
  }
  function clearCurrent() {
    if (!confirm("Clear the checklist for this week?")) return;
    setSaved(old => { const topics = { ...old.topics }; currentWeek.topics.forEach((_, ti) => delete topics[topicKey(semester, phase, week, ti)]); return { ...old, topics }; });
  }
  const weekDone = currentWeek.topics.filter((_, ti) => saved.topics[topicKey(semester, phase, week, ti)]).length;
  const weekPct = Math.round(weekDone / currentWeek.topics.length * 100);
  const overallPct = Math.round(completedTopics / allTopicCount * 100);

  return <main className="aiml-app">
    <aside className="aiml-sidebar">
      <a className="aiml-brand" href="/"><span className="aiml-brand-icon"><BookOpen size={19}/></span><span><strong>AI/ML <em>Notebook</em></strong><small>4-SEMESTER ROADMAP</small></span></a>
      <div className="aiml-side-label">YOUR WORKSPACE</div>
      <button className={mode === "topics" ? "aiml-nav active" : "aiml-nav"} onClick={() => setMode("topics")}><FileText size={16}/> Topic checklist</button>
      <button className={mode === "projects" ? "aiml-nav active" : "aiml-nav"} onClick={() => setMode("projects")}><CheckCircle2 size={16}/> Project milestones</button>
      <button className={mode === "review" ? "aiml-nav active" : "aiml-nav"} onClick={() => setMode("review")}><RotateCcw size={16}/> Phase review</button>
      <div className="aiml-side-label aiml-weeks-label">SEMESTER PHASES</div>
      <label className="aiml-search"><Search size={14}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Find a topic..."/></label>
      <nav className="aiml-phase-list">{filteredPhases.map(({ p, i }) => { const c = phaseCount(i); return <button key={i} className={phase === i ? "aiml-phase active" : "aiml-phase"} onClick={() => { setPhase(i); setWeek(0); setMode("topics"); }}><span className="aiml-phase-num">{String(i + 1).padStart(2, "0")}</span><span className="aiml-phase-title">Phase {i + 1}<small>{p.title}</small></span><span className="aiml-phase-progress">{c.done}/{c.total}</span></button>; })}{!filteredPhases.length && <p className="aiml-no-results">No matching topics.</p>}</nav>
      <div className="aiml-sidebar-bottom"><span className="aiml-storage-dot"/> Autosaves in this browser<small>Export backups regularly. Progress does not sync between devices.</small></div>
    </aside>
    <section className="aiml-main">
      <header className="aiml-topbar"><div className="aiml-breadcrumb"><a href="/">Command Center</a><span>/</span><strong>AI/ML Notebook</strong></div><div className="aiml-top-actions"><span className="aiml-save-status">{loaded ? status : "Loading progress..."}</span><button className="aiml-button secondary" onClick={exportBackup}><Download size={14}/> Export backup</button><label className="aiml-button secondary aiml-import">Import backup<input type="file" accept=".json,application/json" onChange={importBackup}/></label></div></header>
      <div className="aiml-content">
        <div className="aiml-heading-row"><div><div className="aiml-eyebrow"><span/> PYTHON · MACHINE LEARNING · GENERATIVE AI</div><h1>Your AI/ML <span>Notebook</span></h1><p>Four semesters of learning, topic checklists, projects and phase reviews — in one place.</p></div><div className="aiml-date">SEMESTERS 4–7</div></div>
        <div className="aiml-semester-tabs">{semesters.map((s, i) => <button key={i} className={semester === i ? "active" : ""} onClick={() => { setSemester(i); setPhase(0); setWeek(0); setQuery(""); }}>{s.title}<small>{s.subtitle.split("·")[0].trim()}</small></button>)}</div>
        <div className="aiml-stats">
          <div className="aiml-stat"><span>ROADMAP TOPICS COMPLETED</span><strong>{completedTopics}<small> / {allTopicCount}</small></strong><div className="aiml-progress"><i style={{ width: `${overallPct}%` }}/></div></div>
          <div className="aiml-stat"><span>PROJECT MILESTONES</span><strong>{totalDoneProjectTasks}<small> / {totalProjectTasks}</small></strong><div className="aiml-progress"><i style={{ width: `${totalDoneProjectTasks / totalProjectTasks * 100}%` }}/></div></div>
          <div className="aiml-stat"><span>PHASE REVIEWS WRITTEN</span><strong>{reviewedPhases}<small> / 16</small></strong><div className="aiml-progress"><i style={{ width: `${reviewedPhases / 16 * 100}%` }}/></div></div>
        </div>
        <section className="aiml-semester-banner"><div className="aiml-semester-badge">SEM<br/>{semester + 4}</div><div className="aiml-semester-copy"><h2>{currentSemester.title} — {currentSemester.subtitle.split("·")[0].trim()}</h2><p>{currentSemester.outcome}</p><span>{currentSemester.phases.length} phases · {currentSemester.phases.reduce((n, p) => n + p.weeks.length, 0)} weekly checklists</span></div><div className="aiml-sem-switch"><button aria-label="Previous semester" disabled={semester === 0} onClick={() => { setSemester(semester - 1); setPhase(0); setWeek(0); }}><ChevronLeft size={17}/></button><button aria-label="Next semester" disabled={semester === 3} onClick={() => { setSemester(semester + 1); setPhase(0); setWeek(0); }}><ChevronRight size={17}/></button></div></section>
        <div className="aiml-phase-heading"><div><span className="aiml-section-kicker">CURRENT PHASE · {String(phase + 1).padStart(2, "0")}</span><h2>{currentPhase.title}</h2><p>{currentPhase.duration} · {currentPhase.weeks.length} weekly checklists</p></div><span className="aiml-phase-total">{phaseCount(phase).done} / {phaseCount(phase).total} topics</span></div>
        <div className="aiml-editor-toolbar"><div className="aiml-tabs"><button className={mode === "topics" ? "active" : ""} onClick={() => setMode("topics")}>Weekly checklist</button><button className={mode === "projects" ? "active" : ""} onClick={() => setMode("projects")}>Projects</button><button className={mode === "review" ? "active" : ""} onClick={() => setMode("review")}>Phase review</button></div>{mode === "topics" && <button className="aiml-clear" onClick={clearCurrent}>Clear current week</button>}</div>
        {mode === "topics" ? <section className="aiml-panel">
          <div className="aiml-week-header"><div><span className="aiml-section-kicker">WEEKLY TOPIC CHECKLIST</span><h2>Week {week + 1} · {currentWeek.title}</h2><p>Mark each topic complete after you understand it and practise it.</p></div><div className="aiml-week-switch"><button aria-label="Previous week" disabled={week === 0} onClick={() => setWeek(week - 1)}><ChevronLeft size={16}/></button><span>Week {week + 1} of {currentPhase.weeks.length}</span><button aria-label="Next week" disabled={week === currentPhase.weeks.length - 1} onClick={() => setWeek(week + 1)}><ChevronRight size={16}/></button></div></div>
          <div className="aiml-week-track">{currentPhase.weeks.map((w, i) => { const d = w.topics.filter((_, ti) => saved.topics[topicKey(semester, phase, i, ti)]).length; return <button key={i} className={week === i ? "active" : ""} onClick={() => setWeek(i)}><span>{d === w.topics.length ? <CheckCircle2 size={15}/> : String(i + 1).padStart(2, "0")}</span><small>Week {i + 1}</small><em>{d}/{w.topics.length}</em></button>; })}</div>
          <div className="aiml-week-progress-label"><span>WEEK COMPLETION</span><strong>{weekDone} / {currentWeek.topics.length} topics · {weekPct}%</strong></div><div className="aiml-progress aiml-week-progress"><i style={{ width: `${weekPct}%` }}/></div>
          <div className="aiml-checklist">{currentWeek.topics.map((topic, i) => { const key = topicKey(semester, phase, week, i); const checked = !!saved.topics[key]; return <label key={key} className={checked ? "aiml-check-row done" : "aiml-check-row"}><input type="checkbox" checked={checked} onChange={e => toggleTopic(key, e.target.checked)}/><span className="aiml-check-text">{topic}</span><span className="aiml-check-tag">{checked ? "Completed" : "To learn"}</span></label>; })}</div>
          <div className="aiml-check-note"><strong>Completion rule</strong><span>Mark a topic complete only when you can explain the concept and demonstrate it through practice. Leave unfinished topics unchecked and carry them forward.</span></div>
          <div className="aiml-panel-footer"><span>{weekDone === currentWeek.topics.length ? "Week checklist completed." : `${currentWeek.topics.length - weekDone} topics remaining in this week.`}</span><button className="aiml-button primary" onClick={() => { if (week < currentPhase.weeks.length - 1) setWeek(week + 1); else if (phase < currentSemester.phases.length - 1) { setPhase(phase + 1); setWeek(0); } else if (semester < 3) { setSemester(semester + 1); setPhase(0); setWeek(0); } }}>{week === currentPhase.weeks.length - 1 ? "Next phase" : "Next week"} <ChevronRight size={15}/></button></div>
        </section> : mode === "projects" ? <section className="aiml-panel">
          <div className="aiml-week-header"><div><span className="aiml-section-kicker">BUILD PROOF OF SKILL</span><h2>{currentSemester.title} projects</h2><p>Track each deliverable from dataset or design through to GitHub publication.</p></div></div>
          <div className="aiml-project-grid">{currentSemester.projects.map((project, pi) => <div className="aiml-project" key={project.title}><h3>{project.title}</h3><div className="aiml-project-count">{project.tasks.filter((_, ti) => saved.projects[projectKey(semester, pi, ti)]).length} / {project.tasks.length} milestones complete</div>{project.tasks.map((task, ti) => { const key = projectKey(semester, pi, ti); return <label key={key} className={saved.projects[key] ? "aiml-project-task done" : "aiml-project-task"}><input type="checkbox" checked={!!saved.projects[key]} onChange={e => setSaved(old => ({ ...old, projects: { ...old.projects, [key]: e.target.checked } }))}/><span>{task}</span></label>; })}</div>)}</div>
        </section> : <section className="aiml-panel">
          <div className="aiml-week-header"><div><span className="aiml-section-kicker">PHASE CONSOLIDATION</span><h2>{currentPhase.title} — review</h2><p>Summarize what you can now explain and identify what needs another pass.</p></div><div className="aiml-review-mark"><RotateCcw size={16}/> Phase {phase + 1} of {currentSemester.phases.length}</div></div>
          <div className="aiml-review-callout"><strong>Before moving on</strong><span>Revisit incomplete topics, explain the key ideas without notes, and complete the practical work for this phase.</span></div>
          <label className="aiml-review-field"><span>Phase summary and weak areas</span><textarea rows={8} value={saved.reviews[`${semester}.${phase}`] ?? ""} onChange={e => setSaved(old => ({ ...old, reviews: { ...old.reviews, [`${semester}.${phase}`]: e.target.value } }))} placeholder="What can I explain confidently? What needs revision? What did I implement?"/></label>
          <div className="aiml-panel-footer"><span>{saved.reviews[`${semester}.${phase}`]?.trim() ? "Review saved automatically." : "Write a short review to record phase completion."}</span><button className="aiml-button primary" onClick={() => setMode("topics")}>Return to checklist <ChevronRight size={15}/></button></div>
        </section>}
        <footer className="aiml-footer"><span>FOUR-SEMESTER AI/ML ROADMAP</span><span>{completedTopics} topics completed · {startedProjects} project milestones completed</span></footer>
      </div>
    </section>
  </main>;
}
