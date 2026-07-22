'use client';

import React, { useState } from 'react';
import { UserProfile } from '../types';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Sliders, Sparkles, Save, Check, Volume2, Type, Eye, RefreshCw } from 'lucide-react';

interface AccessibilitySettingsViewProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onRewardTokens: (amount: number, reason: string) => void;
}

export default function AccessibilitySettingsView({ user, onUpdateUser, onRewardTokens }: AccessibilitySettingsViewProps) {
  const [dyslexicFont, setDyslexicFont] = useState(user.neuroSettings?.dyslexicFont ?? true);
  const [contrastMode, setContrastMode] = useState(user.neuroSettings?.contrastMode || 'glow-dark');
  const [letterSpacing, setLetterSpacing] = useState(user.neuroSettings?.letterSpacing || 2);
  const [lineHeight, setLineHeight] = useState(user.neuroSettings?.lineHeight || 1.8);
  const [audioPauseDuration, setAudioPauseDuration] = useState(user.neuroSettings?.audioPauseDuration || 30);
  const [letterInversionHighlight, setLetterInversionHighlight] = useState(user.neuroSettings?.letterInversionHighlight ?? true);
  const [aiCustomFont, setAiCustomFont] = useState(user.neuroSettings?.aiFontName || 'OpenDyslexic Dynamic');
  
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [generatingAiFont, setGeneratingAiFont] = useState(false);

  const handleSaveSettings = async () => {
    setSaving(true);
    const updatedNeuroSettings = {
      dyslexicFont,
      contrastMode: contrastMode as any,
      letterSpacing,
      lineHeight,
      cognitiveFatigueDetection: true,
      audioSynthesis: true,
      audioPauseDuration,
      letterInversionHighlight,
      aiFontName: aiCustomFont
    };

    const updatedUser: UserProfile = {
      ...user,
      neuroSettings: updatedNeuroSettings
    };

    onUpdateUser(updatedUser);

    try {
      if (user.uid) {
        await setDoc(doc(db, 'users', user.uid), {
          neuroSettings: updatedNeuroSettings
        }, { merge: true });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving accessibility settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateAiFontProfile = async () => {
    setGeneratingAiFont(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Agisci come il motore di intelligenza artificiale di Quantaly per la neuro-divergenza. Genera un nome di profilo tipografico custom ed unico ottimizzato per la dislessia e la concentrazione visiva. Rispondi esclusivamente con un nome di massimo 3 parole.'
        })
      });
      const data = await res.json();
      const fontName = data.text?.trim() || 'Dyslexia Clarity Pro';
      setAiCustomFont(fontName);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingAiFont(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" /> Centro Controllo Accessibilità & Profilazione Cognitiva
          </h2>
          <p className="text-xs text-slate-400">
            Calibrazione millimetrica del DOM rendering client-side per disturbi specifici dell'apprendimento (DSA/BES) e salvataggio Firestore.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2"
        >
          {saveSuccess ? <Check className="w-4 h-4 text-black" /> : <Save className="w-4 h-4" />}
          {saving ? 'Salvataggio...' : saveSuccess ? 'Applicato al DOM!' : 'Salva & Applica a Tutto il DOM'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Calibration Parameters Controls */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
          <span className="font-bold text-xs text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Type className="w-4 h-4 text-cyan-400" /> Geometria Font & Regole Tipografiche
          </span>

          {/* AI Custom Font Generator */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Profilo Tipografico Custom AI</span>
              <button
                onClick={handleGenerateAiFontProfile}
                disabled={generatingAiFont}
                className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[11px] font-bold flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                {generatingAiFont ? 'Generazione...' : 'Genera con AI'}
              </button>
            </div>
            <p className="text-xs font-mono text-cyan-400">{aiCustomFont}</p>
          </div>

          {/* Dyslexic Font Toggle */}
          <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-white">Font Adattivo per Dislessia (OpenDyslexic)</span>
              <p className="text-[10px] text-slate-400">Pesi inferiori maggiorati per prevenire rotazione e inversione delle lettere.</p>
            </div>
            <input
              type="checkbox"
              checked={dyslexicFont}
              onChange={(e) => setDyslexicFont(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500"
            />
          </label>

          {/* Inverted Letter Color Coding Toggle */}
          <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-white">Color-Coding Lettere Invertite (b/d, p/q)</span>
              <p className="text-[10px] text-slate-400">Evidenziazione cromatica automatica sulle lettere speculari.</p>
            </div>
            <input
              type="checkbox"
              checked={letterInversionHighlight}
              onChange={(e) => setLetterInversionHighlight(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500"
            />
          </label>

          {/* Letter Spacing Slider */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Spaziatura Lettere (Letter Spacing)</span>
              <span className="font-mono text-cyan-400">{letterSpacing} px</span>
            </div>
            <input
              type="range"
              min="0"
              max="6"
              step="0.5"
              value={letterSpacing}
              onChange={(e) => setLetterSpacing(parseFloat(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>

          {/* Line Height Slider */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Interlinea (Line Height)</span>
              <span className="font-mono text-cyan-400">{lineHeight} x</span>
            </div>
            <input
              type="range"
              min="1.2"
              max="2.5"
              step="0.1"
              value={lineHeight}
              onChange={(e) => setLineHeight(parseFloat(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>

          {/* Audio Pause Duration Slider (e.g. 30s) */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Tempo Pausa Forzata Audio Guida</span>
              <span className="font-mono text-cyan-400">{audioPauseDuration} Secondi</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={audioPauseDuration}
              onChange={(e) => setAudioPauseDuration(parseInt(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>

        </div>

        {/* Right Column: Live Touch-Friendly Testing Playground */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <span className="font-bold text-xs text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Eye className="w-4 h-4 text-cyan-400" /> Ambiente di Prova Live Touch-Friendly
          </span>

          <div
            className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 transition-all"
            style={{
              letterSpacing: `${letterSpacing}px`,
              lineHeight: lineHeight
            }}
          >
            <span className="text-[10px] font-mono text-cyan-400 block">Testo Campione in Tempo Reale:</span>

            <p className="text-sm text-slate-100 font-sans">
              La piattaforma Quantaly trasforma la didattica digitale per garantire l'accessibilità totale. I dati vengono elaborati client-side secondo il protocollo Zero-Knowledge.
            </p>

            {letterInversionHighlight && (
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800 text-xs text-cyan-200">
                <p className="font-bold text-[10px] uppercase tracking-wider mb-1">Dimostrazione Color-Coding:</p>
                <p>
                  <span className="px-1 py-0.5 rounded bg-cyan-500/30 font-black">b</span>ambini,{' '}
                  <span className="px-1 py-0.5 rounded bg-cyan-500/30 font-black">d</span>idattica,{' '}
                  <span className="px-1 py-0.5 rounded bg-cyan-500/30 font-black">p</span>iattaforma,{' '}
                  <span className="px-1 py-0.5 rounded bg-cyan-500/30 font-black">q</span>uantistica.
                </p>
              </div>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-1">
            <p className="font-bold text-white">Stato del Profilo Cognitivo:</p>
            <p>I parametri impostati verranno applicati istantaneamente su tutte le schermate e sincronizzati sul database Firestore dell'utente.</p>
          </div>
        </div>

      </div>

    </div>
  );
}
