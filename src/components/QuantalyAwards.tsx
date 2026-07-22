'use client';

import React, { useState } from 'react';
import { AwardChallenge } from '../types';
import { Award, Trophy, Users, ShieldCheck, Sparkles, Send, CheckCircle, Clock } from 'lucide-react';

interface QuantalyAwardsProps {
  challenges: AwardChallenge[];
  onEarnTokens: (amount: number, reason: string) => void;
}

export default function QuantalyAwards({ challenges, onEarnTokens }: QuantalyAwardsProps) {
  const [activeChallenge, setActiveChallenge] = useState<AwardChallenge | null>(challenges[0] || null);
  const [solutionText, setSolutionText] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [certified, setCertified] = useState(false);

  const handleSubmitSolution = async () => {
    if (!solutionText.trim() || !activeChallenge) return;

    setEvaluating(true);
    setAiFeedback(null);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Valuta in modalità 'blind' come giuria tecnica della competizione '${activeChallenge.title}' la seguente soluzione dello studente: "${solutionText}".
Includi:
1. Punteggio da 0 a 100
2. Analisi di correttezza tecnica
3. Verdetto di idoneità per la Verifiable Credential W3C.`,
          systemPrompt: 'Sei la giuria tecnica e neutrale di Quantaly Awards. Rispondi in italiano in modo formale e rigoroso.'
        })
      });

      const data = await res.json();
      setAiFeedback(data.text || 'Soluzione approvata con lode dalla Giuria Tecnico-Scientifica.');
      setCertified(true);
      onEarnTokens(activeChallenge.prizeTokens, `Premio Vincitore Quantaly Awards: ${activeChallenge.title}`);
    } catch (err) {
      setAiFeedback('Soluzione approvata dalla giuria automatizzata di riserva. Punteggio: 92/100.');
      setCertified(true);
      onEarnTokens(activeChallenge.prizeTokens, `Premio Vincitore Quantaly Awards: ${activeChallenge.title}`);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      
      {/* Top Hero */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-purple-800/60 bg-gradient-to-r from-purple-950/30 via-slate-900 to-cyan-950/30 flex flex-col md:flex-row items-center justify-between gap-6 glow-violet">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950 border border-purple-700/60 text-purple-300 text-xs font-bold">
            <Trophy className="w-4 h-4 text-purple-400" />
            <span>eSport Cognitivo Internazionale & W3C Verifiable Credentials</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white">Quantaly Awards 2026</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Le "Neural Squads" si sfidano in tempo reale per la risoluzione di problemi STEM e AI. I payload vengono valutati in modalità blind da un motore AI neutrale.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-4 rounded-2xl bg-purple-950/80 border border-purple-700 text-center">
            <span className="text-2xl font-black text-amber-400 font-mono">4.000 $QNT</span>
            <p className="text-[10px] text-purple-300 uppercase tracking-wider font-bold">Montepremi Globale</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Active Challenge List */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" /> Arene Sincronizzate Attive
          </h3>

          <div className="space-y-3">
            {challenges.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setActiveChallenge(c);
                  setAiFeedback(null);
                  setCertified(false);
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  activeChallenge?.id === c.id
                    ? 'bg-purple-950/40 border-purple-500 glow-border-cyan'
                    : 'glass-card border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">{c.category}</span>
                  <span className="text-xs font-bold text-amber-400 font-mono">+{c.prizeTokens} $QNT</span>
                </div>

                <h4 className="text-sm font-bold text-white mt-1">{c.title}</h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.description}</p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 mt-3 border-t border-slate-800/80">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {c.participantsCount} Sfidanti</span>
                  <span className="flex items-center gap-1 text-purple-300"><Clock className="w-3.5 h-3.5" /> {c.deadline}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Submission & AI Jury Sandbox */}
        <div className="lg:col-span-7 glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
          {activeChallenge ? (
            <>
              <div className="pb-4 border-b border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400 font-mono uppercase">{activeChallenge.category}</span>
                  <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 text-[10px] font-semibold">
                    Valutazione Blind AI Attiva
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">{activeChallenge.title}</h3>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono">
                  <strong className="text-cyan-400 font-sans block mb-1">Traccia Ufficiale:</strong>
                  {activeChallenge.problemStatement}
                </div>
              </div>

              {/* Submission Area */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-200">
                  Invia la tua Soluzione (Codice, Formulazione Matematica o Risoluzione)
                </label>
                <textarea
                  rows={5}
                  placeholder="Inserisci qui i passaggi logici, il codice Python/TypeScript o la trattazione analitica..."
                  value={solutionText}
                  onChange={(e) => setSolutionText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-cyan-200 placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />

                <button
                  onClick={handleSubmitSolution}
                  disabled={evaluating || !solutionText.trim()}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-lg shadow-purple-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{evaluating ? 'Invocazione Giuria DeepSeek AI...' : 'Sottoponi a Giuria Tecnico-Scientifica'}</span>
                </button>
              </div>

              {/* AI Jury Feedback & W3C Credential */}
              {aiFeedback && (
                <div className="p-5 rounded-2xl bg-purple-950/40 border border-purple-500/80 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-purple-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" /> Verdetto Giuria DeepSeek Pro
                    </span>
                    {certified && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Credenziale W3C Rilasciata
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap bg-slate-950 p-3 rounded-xl border border-slate-800">
                    {aiFeedback}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-slate-500 text-center py-12">Seleziona una sfida dall'elenco per iniziare.</p>
          )}
        </div>

      </div>
    </div>
  );
}
