'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { calendarService } from '../lib/workspaceService';
import { Calendar as CalendarIcon, Clock, Plus, Zap, BatteryCharging, RefreshCw } from 'lucide-react';

interface CalendarViewProps {
  user: UserProfile;
  onRewardTokens: (amount: number, reason: string) => void;
}

export default function CalendarView({ user, onRewardTokens }: CalendarViewProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('');

  useEffect(() => {
    loadCalendarEvents();
  }, []);

  const loadCalendarEvents = async () => {
    setLoading(true);
    try {
      const res = await calendarService.listEvents().catch(() => null);
      if (res?.items) {
        setEvents(res.items);
      }
    } catch (err) {
      console.warn('Calendar load notice:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const startTime = newEventTime ? new Date(newEventTime).toISOString() : new Date(Date.now() + 3600000).toISOString();
    const endTime = new Date(new Date(startTime).getTime() + 3600000).toISOString();

    try {
      await calendarService.createEvent({
        summary: newEventTitle,
        start: { dateTime: startTime },
        end: { dateTime: endTime }
      }).catch(() => null);

      setEvents((prev) => [
        { id: 'ev-' + Date.now(), summary: newEventTitle, start: { dateTime: startTime } },
        ...prev
      ]);
      setNewEventTitle('');
      setNewEventTime('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleInsertRecoverySlots = () => {
    const recoverySlot = {
      id: 'recovery-' + Date.now(),
      summary: '⚡ Slot di Recupero Energetico & Respirazione Quantaly',
      start: { dateTime: new Date(Date.now() + 7200000).toISOString() },
      isRecovery: true
    };
    setEvents((prev) => [recoverySlot, ...prev]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-cyan-400" /> Pianificatore e Calendario Didattico
          </h2>
          <p className="text-xs text-slate-400">
            Integrazione bidirezionale Google Calendar con ottimizzazione dei ritmi biologici e slot di recupero.
          </p>
        </div>

        <button
          onClick={handleInsertRecoverySlots}
          className="px-4 py-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition-all flex items-center gap-2"
        >
          <BatteryCharging className="w-4 h-4 text-amber-400" /> Inserisci Slot Recupero Energetico (AI)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Event Creator & Sync Panel */}
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <span className="font-bold text-xs text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" /> Aggiungi Evento Google Calendar
            </span>

            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 font-medium">Titolo Evento / Lezione</label>
                <input
                  type="text"
                  required
                  placeholder="Es. Verifica di Informatica"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium">Data e Ora</label>
                <input
                  type="datetime-local"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition-all shadow-md shadow-cyan-500/20"
              >
                Crea e Sincronizza
              </button>
            </form>
          </div>
        </div>

        {/* Right: Vertical Mobile-First Agenda */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-xs text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" /> Agenda Didattica Sincronizzata
              </span>
              <button
                onClick={loadCalendarEvents}
                disabled={loading}
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-bold"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Aggiorna
              </button>
            </div>

            <div className="space-y-3">
              {events.length === 0 ? (
                <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto">
                    <CalendarIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Agenda Vuota - Nessun Evento</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Non ci sono lezioni o verifiche in programma su Google Calendar.
                  </p>
                  <button
                    onClick={() => {
                      setNewEventTitle('Prima Lezione Quantaly');
                    }}
                    className="px-4 py-2 rounded-2xl bg-cyan-500 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/20"
                  >
                    Pianifica la tua giornata
                  </button>
                </div>
              ) : (
                events.map((ev) => (
                  <div
                    key={ev.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      ev.isRecovery
                        ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
                        : 'bg-slate-950 border-slate-800/80 text-white hover:border-cyan-500/40'
                    }`}
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs flex items-center gap-2">
                        {ev.isRecovery && <Zap className="w-3.5 h-3.5 text-amber-400" />}
                        {ev.summary}
                      </h4>
                      <p className="text-[10px] font-mono text-slate-400">
                        {ev.start?.dateTime ? new Date(ev.start.dateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Tutto il giorno'}
                      </p>
                    </div>

                    <span className={`text-[10px] font-mono px-2 py-1 rounded-xl border ${ev.isRecovery ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-cyan-950 text-cyan-400 border-cyan-800'}`}>
                      {ev.isRecovery ? 'Pausa Bio' : 'Google Sync'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
