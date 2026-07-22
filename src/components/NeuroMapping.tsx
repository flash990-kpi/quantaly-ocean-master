'use client';

import React, { useState } from 'react';
import { Brain, Sliders, Eye, Volume2, Sparkles, Check, RefreshCw, Zap } from 'lucide-react';

export default function NeuroMapping() {
  const [dyslexicFont, setDyslexicFont] = useState(true);
  const [contrastMode, setContrastMode] = useState<'glow-dark' | 'sepia' | 'high-contrast' | 'monochrome'>('glow-dark');
  const [letterSpacing, setLetterSpacing] = useState(2); // px
  const [lineHeight, setLineHeight] = useState(1.8);
  const [cognitiveFatigueEnabled, setCognitiveFatigueEnabled] = useState(true);
  const [fatigueDetected, setFatigueDetected] = useState(false);
  const [simplifiedText, setSimplifiedText] = useState(false);
  const [audioSynthesizing, setAudioSynthesizing] = useState(false);

  const sampleText = `L'infrastruttura di Quantaly rimodula dinamicamente la struttura sintattica e cromatica in locale sul dispositivo dell'utente in base alle specifiche varianti di neuro-divergenza dello studente (es. tipologie di dislessia o deficit attentivo). Attraverso l'analisi client-side delle metriche di interazione native del browser, la piattaforma rileva barriere di lettura in tempo reale, semplificando il layout.`;

  const handleSimulateFatigue = () => {
    setFatigueDetected(true);
    setSimplifiedText(true);
    setTimeout(() => {
      setFatigueDetected(false);
    }, 4000);
  };

  const handleSpeakSample = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToRead = simplifiedText 
        ? "Quantaly adatta il testo per la tua mente. Riduce lo sforzo visivo e legge le informazioni complesse a voce." 
        : sampleText;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'it-IT';
      utterance.onstart = () => setAudioSynthesizing(true);
      utterance.onend = () => setAudioSynthesizing(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      
      {/* Engine Title Header */}
      <div className="glass-card p-6 rounded-3xl border border-emerald-800/60 bg-gradient-to-r from-emerald-950/20 via-slate-900 to-cyan-950/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-xs font-semibold">
            <Brain className="w-4 h-4 text-emerald-400" />
            <span>Inclusione Universale BES & DSA (Legge 170/2010 Compliance)</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Semantic Neuro-Mapping Engine</h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Non semplici modifiche grafiche superficiali: il motore riorganizza la struttura sintattica, la spaziatura e i contrasti sul dispositivo client mantenendo la privacy medica al 100% (Zero-Knowledge).
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-800/80 text-center">
          <span className="text-2xl font-black text-emerald-400 font-mono">100%</span>
          <p className="text-[10px] text-emerald-200 uppercase tracking-wider font-semibold">Accessibilità Sensoriale</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Controls Panel */}
        <div className="lg:col-span-5 glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" /> Parametri DOM Adattivi
            </h3>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              Client-Side Only
            </span>
          </div>

          {/* Dyslexic Font Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800">
            <div>
              <p className="text-xs font-bold text-white">Font Alta Leggibilità (OpenDyslexic)</p>
              <p className="text-[10px] text-slate-400">Pesi differenziati per prevenire rotazione di lettere p/b/d/q</p>
            </div>
            <button
              onClick={() => setDyslexicFont(!dyslexicFont)}
              className={`w-12 h-6 rounded-full p-1 transition-colors relative ${
                dyslexicFont ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  dyslexicFont ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Contrast Mode Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200">Filtro Cromatico Neuro-Sensoriale</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'glow-dark', name: 'Glow Dark (Default)', bg: 'bg-[#050710] text-cyan-400 border-cyan-800' },
                { id: 'sepia', name: 'Sepia Riposo', bg: 'bg-[#1a140e] text-[#f3e5ab] border-[#8a6d3b]' },
                { id: 'high-contrast', name: 'Alto Contrasto', bg: 'bg-black text-[#00ffcc] border-[#00ffcc]' },
                { id: 'monochrome', name: 'Monocromatico', bg: 'bg-slate-900 text-slate-100 border-slate-700' }
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setContrastMode(mode.id as any)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${mode.bg} ${
                    contrastMode === mode.id ? 'ring-2 ring-cyan-400' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {mode.name}
                </button>
              ))}
            </div>
          </div>

          {/* Spacing Sliders */}
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                <span>Spaziatura Tra Lettere</span>
                <span className="font-mono text-cyan-400">{letterSpacing}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="6"
                value={letterSpacing}
                onChange={(e) => setLetterSpacing(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                <span>Interlinea (Line Height)</span>
                <span className="font-mono text-cyan-400">{lineHeight}x</span>
              </div>
              <input
                type="range"
                min="1.2"
                max="2.4"
                step="0.1"
                value={lineHeight}
                onChange={(e) => setLineHeight(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>

          {/* Cognitive Fatigue Engine */}
          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white">Rilevamento Affaticamento Cognitivo</span>
              </div>
              <button
                onClick={() => setCognitiveFatigueEnabled(!cognitiveFatigueEnabled)}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                  cognitiveFatigueEnabled ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${cognitiveFatigueEnabled ? 'translate-x-5' : ''}`} />
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Analizza lo scroll e le micro-fissazioni del cursore per rilevare affaticamento o blocchi di lettura, semplificando automaticamente il testo.
            </p>

            <button
              onClick={handleSimulateFatigue}
              className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Simula Blocco di Lettura
            </button>
          </div>

        </div>

        {/* Right Live DOM Preview Box */}
        <div className="lg:col-span-7 glass-card p-6 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400" /> Anteprima Rendering Adattivo in Tempo Reale
            </span>

            {fatigueDetected && (
              <span className="animate-bounce px-3 py-1 rounded-full bg-amber-500 text-black font-extrabold text-[10px] flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Affaticamento Rilevato! Layout Semplificato
              </span>
            )}
          </div>

          {/* Interactive Rendering Canvas */}
          <div
            className={`p-6 rounded-2xl border transition-all duration-300 min-h-[240px] flex flex-col justify-center ${
              contrastMode === 'sepia' ? 'bg-[#1a140e] text-[#f3e5ab] border-[#8a6d3b]' :
              contrastMode === 'high-contrast' ? 'bg-black text-[#00ffcc] border-[#00ffcc]' :
              contrastMode === 'monochrome' ? 'bg-slate-900 text-slate-100 border-slate-700' :
              'bg-[#080d1a] text-cyan-200 border-cyan-800/80 glow-border-cyan'
            }`}
            style={{
              fontFamily: dyslexicFont ? "'OpenDyslexic', 'Comic Sans MS', sans-serif" : 'inherit',
              letterSpacing: `${letterSpacing}px`,
              lineHeight: lineHeight
            }}
          >
            <h4 className="text-base font-bold mb-3 text-white">
              {simplifiedText ? "⚡ Sintesi Semplificata per Lettura Veloce" : "📘 Payload Didattico Originale"}
            </h4>

            <p className="text-sm">
              {simplifiedText 
                ? "Quantaly riconosce quando la tua mente è stanca. Riorganizza il testo in concetti chiave, aumenta lo spazio tra le righe e ti offre la lettura con sintesi vocale."
                : sampleText
              }
            </p>
          </div>

          {/* Audio Accessibility Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={handleSpeakSample}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                audioSynthesizing
                  ? 'bg-emerald-500 text-black animate-pulse'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/20'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{audioSynthesizing ? 'Riproduzione Audio in corso...' : 'Ascolta Sintesi Vocale Adattiva'}</span>
            </button>

            <span className="text-[11px] text-slate-400 font-mono">
              Trascrizione Testuale e Descrizione Audio Attive
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
