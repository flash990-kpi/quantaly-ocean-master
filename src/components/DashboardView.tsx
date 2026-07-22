'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { classroomService, calendarService, tasksService } from '../lib/workspaceService';
import { BookOpen, Calendar, CheckSquare, Sparkles, Brain, Clock, Play, Pause, RefreshCw, AlertTriangle, ChevronRight, Plus } from 'lucide-react';

interface DashboardViewProps {
  user: UserProfile;
  onRewardTokens: (amount: number, reason: string) => void;
}

export default function DashboardView({ user, onRewardTokens }: DashboardViewProps) {
  const [courses, setCourses] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [cognitiveOverload, setCognitiveOverload] = useState(false);
  const [decomposedTask, setDecomposedTask] = useState<{ original: string; steps: string[] } | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  // New Item Inline Forms for Real Empty State Creation
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const coursesRes = await classroomService.listCourses(5).catch(() => null);
      if (coursesRes?.courses) setCourses(coursesRes.courses);

      const calendarRes = await calendarService.listEvents().catch(() => null);
      if (calendarRes?.items) setEvents(calendarRes.items);

      const tasksRes = await tasksService.listTasks().catch(() => null);
      if (tasksRes?.items) {
        setTasks(tasksRes.items);
        if (tasksRes.items.length > 3) {
          setCognitiveOverload(true);
        }
      }
    } catch (err: any) {
      console.warn('Dashboard fetch notice:', err?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDecomposeTask = async (taskTitle: string, category: string = 'Generale') => {
    setAiGenerating(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Scomponi l'attività scolastica "${taskTitle}" in 4 micro-step chiari di massimo 15 parole per uno studente con BES/DSA per ridurre il carico cognitivo. Rispondi TASSATIVAMENTE in formato JSON con la chiave "steps" contenente un array di 4 stringhe.`,
          jsonMode: true,
          category
        })
      });
      const data = await res.json();
      let stepsArray: string[] = [];

      try {
        const parsed = typeof data.text === 'string' ? JSON.parse(data.text.replace(/```json|```/g, '').trim()) : data.text;
        if (parsed.steps && Array.isArray(parsed.steps)) stepsArray = parsed.steps;
      } catch (e) {
        // fallback array
      }

      if (!stepsArray.length) {
        stepsArray = [
          'Passo 1: Leggi il titolo e sintetizza il concetto in una frase',
          'Passo 2: Fai una pausa di 30 secondi con respirazione guidata',
          'Passo 3: Rispondi ai primi 2 quesiti chiave',
          'Passo 4: Sincronizza i risultati su Google Tasks'
        ];
      }

      setDecomposedTask({ original: taskTitle, steps: stepsArray });
      setActiveStepIndex(0);
    } catch (err) {
      console.error(err);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleCreateNewTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await tasksService.createTask(newTaskTitle.trim()).catch(() => null);
      const createdItem = {
        id: res?.id || 'task-' + Date.now(),
        title: newTaskTitle.trim(),
        status: 'needsAction'
      };
      setTasks((prev) => [createdItem, ...prev]);
      setNewTaskTitle('');
      setShowAddTaskForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateNewEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const startTime = newEventDate ? new Date(newEventDate).toISOString() : new Date(Date.now() + 3600000).toISOString();
    const endTime = new Date(new Date(startTime).getTime() + 3600000).toISOString();

    try {
      await calendarService.createEvent({
        summary: newEventTitle.trim(),
        start: { dateTime: startTime },
        end: { dateTime: endTime }
      }).catch(() => null);

      const createdEvent = {
        id: 'ev-' + Date.now(),
        summary: newEventTitle.trim(),
        start: { dateTime: startTime }
      };

      setEvents((prev) => [createdEvent, ...prev]);
      setNewEventTitle('');
      setNewEventDate('');
      setShowAddEventForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleAudioStep = () => {
    setIsPlayingAudio(!isPlayingAudio);
    if (!isPlayingAudio && 'speechSynthesis' in window && decomposedTask) {
      const utterance = new SpeechSynthesisUtterance(decomposedTask.steps[activeStepIndex]);
      utterance.lang = 'it-IT';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } else {
      window.speechSynthesis?.cancel();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Welcome & Cognitive Status Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs">
              <Brain className="w-4 h-4 animate-pulse" />
              <span>QUANTALY ADAPTIVE ENGINE ACTIVE</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Bentornato/a, {user.displayName} 👋
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Pannello centrale operativo integrato con Google Classroom, Calendar e Tasks. I carichi di studio sono monitorati in tempo reale con bilanciamento cognitivo.
            </p>
          </div>

          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="px-4 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Sincronizza Workspace
          </button>
        </div>
      </div>

      {/* Overload Alert Notification */}
      {cognitiveOverload && (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/50 flex items-start gap-3 text-amber-200 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-bold">Rilevato accumulo di scadenze scolastiche!</p>
            <p className="text-amber-300/80">
              Il sistema di IA ha rilevato più di 3 compiti attivi. Utilizza il tasto "Scomponi in Micro-Step" per convertire il carico visivo in audio guida a tempo.
            </p>
          </div>
        </div>
      )}

      {/* AI Task Micro-Step Decomposition Player */}
      {decomposedTask && (
        <div className="p-5 rounded-3xl bg-slate-900 border border-cyan-500/40 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="font-bold text-xs text-cyan-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Micro-Step Guida per: {decomposedTask.original}
            </span>
            <button
              onClick={() => setDecomposedTask(null)}
              className="text-slate-400 hover:text-white text-xs font-bold"
            >
              ✕ Chiudi
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">
                Step {activeStepIndex + 1} di {decomposedTask.steps.length}
              </span>
              <button
                onClick={toggleAudioStep}
                className="px-3 py-1.5 rounded-xl bg-cyan-500 text-black font-bold text-xs flex items-center gap-1.5"
              >
                {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isPlayingAudio ? 'Pausa Audio' : 'Ascolta Guida'}
              </button>
            </div>

            <p className="text-sm font-semibold text-white leading-relaxed">
              {decomposedTask.steps[activeStepIndex]}
            </p>

            <div className="flex items-center justify-between pt-2">
              <button
                disabled={activeStepIndex === 0}
                onClick={() => setActiveStepIndex((prev) => prev - 1)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 disabled:opacity-40 text-xs font-bold text-slate-300"
              >
                Indietro
              </button>

              <button
                disabled={activeStepIndex === decomposedTask.steps.length - 1}
                onClick={() => setActiveStepIndex((prev) => prev + 1)}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-xs font-bold flex items-center gap-1"
              >
                Prossimo Step <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main 3-Column Mobile-First Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Widget 1: Google Classroom */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" /> Google Classroom
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              {courses.length} Corsi
            </span>
          </div>

          <div className="space-y-3">
            {courses.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                <p className="text-xs text-slate-400">Nessun corso attivo nel registro Classroom.</p>
                <button
                  onClick={loadDashboardData}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-bold"
                >
                  Sincronizza Google Classroom
                </button>
              </div>
            ) : (
              courses.map((c) => (
                <div key={c.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1.5 hover:border-emerald-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-white truncate">{c.name}</h4>
                    <span className="text-[10px] text-emerald-400 font-mono">Attivo</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{c.section || 'Sezione Didattica Generale'}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Widget 2: Google Calendar + Real Creation */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" /> Google Calendar
            </h3>
            <button
              onClick={() => setShowAddEventForm(!showAddEventForm)}
              className="p-1 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30"
              title="Aggiungi Lezione"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {showAddEventForm && (
            <form onSubmit={handleCreateNewEvent} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <input
                type="text"
                required
                placeholder="Titolo Lezione / Verifica"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
              />
              <input
                type="datetime-local"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
              />
              <button type="submit" className="w-full py-1.5 rounded-xl bg-cyan-500 text-black font-bold">
                Salva su Google Calendar
              </button>
            </form>
          )}

          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                <p className="text-xs text-slate-400">Nessun evento in agenda.</p>
                <button
                  onClick={() => setShowAddEventForm(true)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500 text-black font-extrabold text-xs"
                >
                  Aggiungi la tua prima Lezione
                </button>
              </div>
            ) : (
              events.map((ev) => (
                <div key={ev.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1 hover:border-cyan-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-white truncate">{ev.summary}</h4>
                    <Clock className="w-3 h-3 text-cyan-400" />
                  </div>
                  <p className="text-[10px] text-cyan-300 font-mono">
                    {ev.start?.dateTime ? new Date(ev.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Tutto il giorno'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Widget 3: Google Tasks + Real Creation */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-purple-400" /> Google Tasks
            </h3>
            <button
              onClick={() => setShowAddTaskForm(!showAddTaskForm)}
              className="p-1 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
              title="Aggiungi Task"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {showAddTaskForm && (
            <form onSubmit={handleCreateNewTask} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <input
                type="text"
                required
                placeholder="Titolo compito o argomento studio..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
              />
              <button type="submit" className="w-full py-1.5 rounded-xl bg-purple-500 text-black font-bold">
                Salva su Google Tasks
              </button>
            </form>
          )}

          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                <p className="text-xs text-slate-400">Nessuna task in corso.</p>
                <button
                  onClick={() => setShowAddTaskForm(true)}
                  className="px-3 py-1.5 rounded-xl bg-purple-500 text-black font-extrabold text-xs"
                >
                  Crea la tua prima Task
                </button>
              </div>
            ) : (
              tasks.map((t) => (
                <div key={t.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2 hover:border-purple-500/40 transition-all">
                  <h4 className="font-bold text-xs text-white">{t.title}</h4>
                  <button
                    onClick={() => handleDecomposeTask(t.title)}
                    disabled={aiGenerating}
                    className="w-full py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Scomponi in Micro-Step
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
