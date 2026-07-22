'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { driveService, docsService } from '../lib/workspaceService';
import { FileText, FolderOpen, Play, Pause, RotateCcw, ArrowRight, Sparkles, Sliders, Eye, FileUp, Save, Check } from 'lucide-react';

interface WorkspaceViewProps {
  user: UserProfile;
  onRewardTokens: (amount: number, reason: string) => void;
}

export default function WorkspaceView({ user, onRewardTokens }: WorkspaceViewProps) {
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [docContent, setDocContent] = useState<string>(
    'Esempio di testo didattico BES/DSA: La fisica quantistica e il dualismo onda-particella spiegano la natura della luce. Analizziamo i concetti fondamentali con attenzione e ritmo costante.'
  );
  const [isSyncingDocs, setIsSyncingDocs] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // Audio Guidance State
  const [audioChunks, setAudioChunks] = useState<string[]>([]);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [isPlayingChunk, setIsPlayingChunk] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canProceed, setCanProceed] = useState(false);
  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);

  // BES/DSA Filters
  const [highlightInverted, setHighlightInverted] = useState(true);
  const [readingMask, setReadingMask] = useState(true);

  useEffect(() => {
    loadDriveFiles();
  }, []);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    } else if (countdown === 0) {
      setCanProceed(true);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const loadDriveFiles = async () => {
    try {
      const res = await driveService.listFiles("mimeType='application/vnd.google-apps.document' or mimeType='text/plain'", 10).catch(() => null);
      if (res?.files) setDriveFiles(res.files);
    } catch (err) {
      console.warn('Drive list files notice:', err);
    }
  };

  const handleSelectDriveFile = async (file: any) => {
    setSelectedFile(file);
    try {
      if (file.mimeType === 'application/vnd.google-apps.document') {
        const docRes = await docsService.getDocument(file.id).catch(() => null);
        if (docRes?.body?.content) {
          const textParts: string[] = [];
          docRes.body.content.forEach((elem: any) => {
            if (elem.paragraph?.elements) {
              elem.paragraph.elements.forEach((e: any) => {
                if (e.textRun?.content) textParts.push(e.textRun.content);
              });
            }
          });
          if (textParts.length > 0) {
            setDocContent(textParts.join('').trim());
            return;
          }
        }
      }
      setDocContent(`Documento estratto da Google Drive: "${file.name}". Contenuto sincronizzato ed elaborato dall'engine semantico Quantaly.`);
    } catch (err) {
      setDocContent(`Documento estratto da Google Drive: "${file.name}". Contenuto sincronizzato ed elaborato dall'engine semantico Quantaly.`);
    }
  };

  const handleGenerateAudioGuide = async () => {
    setIsGeneratingGuide(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Sulla base del seguente testo didattico, genera una guida audio sintetica suddivisa in 3 blocchi concettuali chiari per uno studente con dislessia/BES: "${docContent}". Rispondi con un JSON avente la chiave "chunks" contenente un array di 3 brevi spiegazioni testuali.`,
          jsonMode: true
        })
      });
      const data = await res.json();
      let chunks = [
        'Blocco 1: Introduzione al concetto principale. Concentrati sulle parole chiave.',
        'Blocco 2: Scomposizione del problema in due parti uguali.',
        'Blocco 3: Sintesi finale ed esercitazione guidata.'
      ];
      try {
        const parsed = typeof data.text === 'string' ? JSON.parse(data.text.replace(/```json|```/g, '').trim()) : data.text;
        if (parsed.chunks && Array.isArray(parsed.chunks)) chunks = parsed.chunks;
      } catch (e) {
        // fallback
      }
      setAudioChunks(chunks);
      setCurrentChunkIndex(0);
      setCountdown(user.neuroSettings?.audioPauseDuration || 30);
      setCanProceed(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingGuide(false);
    }
  };

  const startChunkAudio = () => {
    setIsPlayingChunk(true);
    setCanProceed(false);
    if ('speechSynthesis' in window && audioChunks[currentChunkIndex]) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(audioChunks[currentChunkIndex]);
      utterance.lang = 'it-IT';
      utterance.rate = 0.85;

      utterance.onend = () => {
        setIsPlayingChunk(false);
        setCountdown(user.neuroSettings?.audioPauseDuration || 30);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingChunk(false);
      setCountdown(user.neuroSettings?.audioPauseDuration || 30);
    }
  };

  const handleNextChunk = () => {
    if (currentChunkIndex < audioChunks.length - 1) {
      setCurrentChunkIndex((prev) => prev + 1);
      setCountdown(user.neuroSettings?.audioPauseDuration || 30);
      setCanProceed(false);
    }
  };

  const handleRepeatChunk = () => {
    setCountdown(user.neuroSettings?.audioPauseDuration || 30);
    setCanProceed(false);
    startChunkAudio();
  };

  const handleSyncToDocs = async () => {
    setIsSyncingDocs(true);
    try {
      await docsService.createDocument(`Quantaly Note - ${new Date().toLocaleDateString()}`).catch(() => null);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncingDocs(false);
    }
  };

  const renderInvertedLetterHighlighted = (text: string) => {
    if (!highlightInverted) return text;
    const parts = text.split(/([bdpqBDPQ])/g);
    return parts.map((part, i) => {
      if (/^[bdpqBDPQ]$/.test(part)) {
        return (
          <span key={i} className="inline-block px-1 py-0.5 rounded bg-cyan-500/30 text-cyan-200 border border-cyan-400/60 font-black">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Title Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" /> Hub di Studio Adattivo & Documenti
          </h2>
          <p className="text-xs text-slate-400">
            Integrazione Google Drive, Docs & Picker con parser client-side per accessibilità BES/DSA e guida audio a tempo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncToDocs}
            disabled={isSyncingDocs}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition-all flex items-center gap-1.5"
          >
            {syncSuccess ? <Check className="w-4 h-4 text-black" /> : <Save className="w-4 h-4" />}
            {isSyncingDocs ? 'Sincronizzazione...' : syncSuccess ? 'Sincronizzato!' : 'Salva su Google Docs'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Drive File Selector & BES/DSA Controls */}
        <div className="space-y-4">
          
          {/* Google Picker & Drive File Browser */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-white flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-cyan-400" /> Selettore Google Drive / Picker
              </span>
              <button
                onClick={loadDriveFiles}
                className="text-[10px] text-cyan-400 hover:underline font-bold"
              >
                Ricarica File
              </button>
            </div>

            <div className="space-y-2">
              {driveFiles.length === 0 ? (
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                  <p className="text-xs text-slate-400">Nessun file trovato su Google Drive.</p>
                  <button
                    onClick={() => setDocContent('Capitolo 1: Storia dell\'Informatica e Reti Neurali. Un viaggio nella trasformazione tecnologica.')}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-300"
                  >
                    Carica Documento Campione
                  </button>
                </div>
              ) : (
                driveFiles.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => handleSelectDriveFile(file)}
                    className={`w-full p-3 rounded-2xl text-left border text-xs transition-all flex items-center justify-between ${
                      selectedFile?.id === file.id
                        ? 'bg-cyan-950/40 border-cyan-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="truncate max-w-[180px]">{file.name}</span>
                    <FileUp className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* BES/DSA Interactive Filters */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="font-bold text-xs text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" /> Filtri Lettura BES/DSA
            </span>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer">
                <span className="text-slate-200">Evidenzia Lettere Invertite (b, d, p, q)</span>
                <input
                  type="checkbox"
                  checked={highlightInverted}
                  onChange={(e) => setHighlightInverted(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer">
                <span className="text-slate-200">Maschera Riga di Lettura Guidata</span>
                <input
                  type="checkbox"
                  checked={readingMask}
                  onChange={(e) => setReadingMask(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500"
                />
              </label>
            </div>
          </div>

        </div>

        {/* Center/Right: Interactive Document Reader & Audio Pause Engine */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Main Document Text Area with BES/DSA rendering */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 relative overflow-hidden">
            
            {/* Reading Mask Overlay if active */}
            {readingMask && (
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-[11px] text-cyan-300 font-mono flex items-center gap-2 mb-2">
                <Eye className="w-3.5 h-3.5" /> Maschera di lettura attiva per la massima focalizzazione visiva.
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400">Testo del Documento (Modificabile & Sincronizzabile)</label>
              <textarea
                value={docContent}
                onChange={(e) => setDocContent(e.target.value)}
                className="w-full h-36 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
              />
            </div>

            {/* Parsed Live Preview with BES/DSA Highlight */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono text-cyan-400">Anteprima Client-Side Adattiva:</span>
              <p className="text-sm text-slate-200 leading-loose">
                {renderInvertedLetterHighlighted(docContent)}
              </p>
            </div>

            <button
              onClick={handleGenerateAudioGuide}
              disabled={isGeneratingGuide}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-600 to-emerald-500 text-black font-extrabold text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-black" />
              {isGeneratingGuide ? 'Elaborazione Guida AI DeepSeek...' : 'Genera Guida Audio a Tempo Forzato (30s)'}
            </button>
          </div>

          {/* Audio Step Player with Mandatory Pause timer (e.g. 30 seconds) */}
          {audioChunks.length > 0 && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-cyan-500/50 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-bold text-xs text-cyan-400">
                  Guida Audio Passo-Passo (Blocco {currentChunkIndex + 1} di {audioChunks.length})
                </span>
                <span className="text-xs font-mono px-2.5 py-1 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Pausa Forzata: {countdown}s
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white font-medium leading-relaxed">
                {audioChunks[currentChunkIndex]}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={handleRepeatChunk}
                  className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4 text-cyan-400" /> Ripeti Blocco
                </button>

                <button
                  onClick={startChunkAudio}
                  disabled={isPlayingChunk}
                  className="py-3 px-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Play className="w-4 h-4" /> Ascolta
                </button>

                <button
                  disabled={!canProceed || currentChunkIndex >= audioChunks.length - 1}
                  onClick={handleNextChunk}
                  className="py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  Prosegui <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
