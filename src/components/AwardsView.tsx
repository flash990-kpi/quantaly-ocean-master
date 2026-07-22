'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { calendarService } from '../lib/workspaceService';
import { Trophy, ShieldAlert, Clock, Users, Sparkles, Award, Lock, Radio } from 'lucide-react';

interface AwardsViewProps {
  user: UserProfile;
  onRewardTokens: (amount: number, reason: string) => void;
}

export default function AwardsView({ user, onRewardTokens }: AwardsViewProps) {
  const [eventState, setEventState] = useState<'lobby' | 'countdown' | 'in_progress' | 'the_wall' | 'completed'>('lobby');
  
  const [readyUsersCount, setReadyUsersCount] = useState(3);
  const [stabilizationCountdown, setStabilizationCountdown] = useState(180); // 3 minutes
  const [matchTimer, setMatchTimer] = useState(3600); // 1 hour
  const [cheatViolationsCount, setCheatViolationsCount] = useState(0);
  const [cheatWarning, setCheatWarning] = useState<string | null>(null);

  // Real STEM Question from Server
  const [stemQuestion, setStemQuestion] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // The Wall Animation State
  const [wallSpheres, setWallSpheres] = useState<Array<{ id: number; slot: number; multiplier: number }>>([]);
  const [isWallDropping, setIsWallDropping] = useState(false);
  const [bonusTokensEarned, setBonusTokensEarned] = useState(0);

  // Anti-Cheat Event Listeners (Tab visibility, blur, copy block)
  useEffect(() => {
    if (eventState !== 'in_progress' && eventState !== 'the_wall') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setCheatViolationsCount((prev) => prev + 1);
        setCheatWarning('🚨 ANTI-CHEAT WARN: Rilevato cambio schermata / passaggio in background!');
      }
    };

    const handleBlur = () => {
      setCheatViolationsCount((prev) => prev + 1);
      setCheatWarning('🚨 ANTI-CHEAT WARN: Perdita di focus rilevata sulla PWA!');
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      setCheatViolationsCount((prev) => prev + 1);
      setCheatWarning('⛔ ANTI-CHEAT BLOCK: Selezione e copia del testo disattivate.');
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('copy', handleCopy);
    window.addEventListener('contextmenu', (e) => e.preventDefault());

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('copy', handleCopy);
    };
  }, [eventState]);

  // Stabilization Countdown Timer (3 minutes)
  useEffect(() => {
    let timer: any;
    if (eventState === 'countdown' && stabilizationCountdown > 0) {
      timer = setInterval(() => setStabilizationCountdown((prev) => prev - 1), 1000);
    } else if (stabilizationCountdown === 0 && eventState === 'countdown') {
      setEventState('in_progress');
      fetchStemQuestion();
    }
    return () => clearInterval(timer);
  }, [eventState, stabilizationCountdown]);

  // Match Timer (1 hour match)
  useEffect(() => {
    let timer: any;
    if (eventState === 'in_progress' && matchTimer > 0) {
      timer = setInterval(() => {
        setMatchTimer((prev) => {
          if (prev === 1800) {
            setEventState('the_wall');
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [eventState, matchTimer]);

  const fetchStemQuestion = async () => {
    try {
      const res = await fetch('/api/awards/wall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_stem_question' })
      });
      const data = await res.json();
      if (data.question) {
        setStemQuestion(data.question);
      }
    } catch (err) {
      console.warn('STEM question fetch notice:', err);
    }
  };

  const handlePressReady = () => {
    setReadyUsersCount(4);
    setEventState('countdown');

    try {
      calendarService.createEvent({
        summary: 'Quantaly Awards Mega Evento eSport',
        start: { dateTime: new Date().toISOString() },
        end: { dateTime: new Date(Date.now() + 3600000).toISOString() }
      }).catch(() => null);
    } catch (e) {
      // fallback
    }
  };

  const handleDropTheWallSpheres = async () => {
    setIsWallDropping(true);

    try {
      const res = await fetch('/api/awards/wall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'drop_the_wall',
          userUid: user.uid,
          squadId: 'squad-neural-01'
        })
      });

      const data = await res.json();

      if (data.spheres) {
        setWallSpheres(data.spheres);
        setBonusTokensEarned(data.totalBonus || 0);
        onRewardTokens(data.totalBonus || 0, 'The Wall Deterministic Server Drop');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsWallDropping(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 select-none">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-cyan-950 border border-purple-500/40 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>QUANTALY AWARDS • ESPORT COGNITIVO GLOBALE</span>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-xl bg-amber-950 text-amber-300 border border-amber-800">
            Montepremi: 40.000 $QNT
          </span>
        </div>
        <h2 className="text-2xl font-black text-white">Neural Squads Arena</h2>
        <p className="text-xs text-slate-300 max-w-2xl">
          Competizione mensile tra squadre sincronizzata in tempo reale. Include modalità Sandbox Anti-Cheat e calcolo deterministico "The Wall" lato server.
        </p>
      </div>

      {/* Anti-Cheat Warning Popup */}
      {cheatWarning && (
        <div className="p-4 rounded-2xl bg-red-950/80 border border-red-500 text-red-200 text-xs font-bold flex items-center justify-between animate-bounce">
          <span className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" /> {cheatWarning} (Infrazioni: {cheatViolationsCount})
          </span>
          <button onClick={() => setCheatWarning(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* STATE 1: LOBBY */}
      {eventState === 'lobby' && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-6 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center mx-auto text-purple-400">
            <Users className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">Stanza di Attesa Squadra</h3>
            <p className="text-xs text-slate-400">Tutti i membri devono premere "Sono Pronto" per avviare il countdown di 3 minuti.</p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-mono text-cyan-400 bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Membri pronti: {readyUsersCount} / 4</span>
          </div>

          <button
            onClick={handlePressReady}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-600 to-emerald-500 text-black font-extrabold text-xs shadow-xl shadow-cyan-500/20 hover:scale-105 transition-all"
          >
            Sono Pronto! (Avvia Sincronizzazione)
          </button>
        </div>
      )}

      {/* STATE 2: COUNTDOWN (3 Minutes Stabilization) */}
      {eventState === 'countdown' && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-cyan-500/40 text-center space-y-6 max-w-2xl mx-auto">
          <Clock className="w-16 h-16 text-cyan-400 mx-auto animate-spin" />
          <h3 className="text-xl font-bold text-white">Stabilizzazione Reti e Squadre</h3>
          <p className="text-2xl font-mono font-black text-cyan-300">{stabilizationCountdown}s</p>
          <p className="text-xs text-slate-400">Preparati! Tra poco la PWA entrerà in modalità Sandbox Anti-Cheat.</p>
        </div>
      )}

      {/* STATE 3: IN PROGRESS */}
      {eventState === 'in_progress' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Modalità Sandbox Anti-Cheat Attiva</span>
            </div>
            <span className="font-mono text-xs text-cyan-400">Tempo Rimanente: {Math.floor(matchTimer / 60)}m {matchTimer % 60}s</span>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-white">Quesito STEM eSport Quantaly</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {stemQuestion?.question || 'Caricamento quesito dal server...'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(stemQuestion?.options || ['50%', '100%', '25%', '75%']).map((opt: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedOption(i)}
                  className={`p-3.5 rounded-xl text-xs font-bold transition-all border ${
                    selectedOption === i
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-200'
                      : 'bg-slate-900 border-slate-800 text-white hover:border-cyan-500'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STATE 4: THE WALL ANIMATION (Server-side Calculation) */}
      {eventState === 'the_wall' && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-amber-500/60 text-center space-y-6 max-w-2xl mx-auto">
          <Sparkles className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
          <h3 className="text-2xl font-black text-white">L'Evento "The Wall"!</h3>
          <p className="text-xs text-slate-300">
            A metà gara le sfere virtuali cadono attraverso la griglia stocastica per assegnare moltiplicatori bonus calcolati lato server!
          </p>

          <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 relative min-h-[200px] flex items-center justify-center">
            {isWallDropping ? (
              <p className="text-xs font-mono text-amber-400 animate-pulse">Caduta Sfere Deterministica in Corso sul Backend...</p>
            ) : wallSpheres.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-bold text-emerald-400">Bonus Moltiplicatori Calcolati dal Server!</p>
                <p className="text-2xl font-black text-amber-400">+{bonusTokensEarned} $QNT</p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Premi il pulsante sotto per lanciare le sfere sul Wall!</p>
            )}
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={handleDropTheWallSpheres}
              disabled={isWallDropping || wallSpheres.length > 0}
              className="px-5 py-2.5 rounded-2xl bg-amber-500 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              Lancia Sfere su The Wall
            </button>

            {wallSpheres.length > 0 && (
              <button
                onClick={() => setEventState('in_progress')}
                className="px-5 py-2.5 rounded-2xl bg-cyan-500 text-black font-extrabold text-xs"
              >
                Riprendi Quiz
              </button>
            )}
          </div>
        </div>
      )}

      {/* STATE 5: COMPLETED */}
      {eventState === 'completed' && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-emerald-500/50 text-center space-y-4 max-w-2xl mx-auto">
          <Award className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
          <h3 className="text-2xl font-black text-white">Vittoria Quantaly Awards!</h3>
          <p className="text-xs text-slate-300">
            La tua squadra ha superato la prova con successo rispettando le regole di sicurezza Anti-Cheat.
          </p>
          <p className="text-xl font-bold text-amber-400">Premio Assegnato: +{40000 + bonusTokensEarned} $QNT</p>
          <button
            onClick={() => setEventState('lobby')}
            className="px-6 py-2.5 rounded-2xl bg-cyan-500 text-black font-extrabold text-xs"
          >
            Torna alla Lobby
          </button>
        </div>
      )}

    </div>
  );
}
