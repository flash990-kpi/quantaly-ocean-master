'use client';

import React, { useState } from 'react';
import { FeedPill } from '../types';
import { ShieldCheck, Heart, Share2, Sparkles, CheckCircle2, XCircle, Volume2, Bookmark, Award } from 'lucide-react';

interface MicroFeedProps {
  pills: FeedPill[];
  onEarnTokens: (amount: number, reason: string) => void;
  onAskAI: (prompt: string) => void;
}

export default function MicroFeed({ pills, onEarnTokens, onAskAI }: MicroFeedProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeQuizPillId, setActiveQuizPillId] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [completedQuizzes, setCompletedQuizzes] = useState<Record<string, boolean>>({});
  const [likedPills, setLikedPills] = useState<Record<string, boolean>>({});
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);

  const filteredPills = selectedCategory === 'ALL' 
    ? pills 
    : pills.filter(p => p.category === selectedCategory);

  const handleSelectAnswer = (index: number) => {
    if (quizSubmitted) return;
    setSelectedOption(index);
  };

  const handleVerifyAnswer = (pill: FeedPill) => {
    if (selectedOption === null) return;
    setQuizSubmitted(true);
    
    if (selectedOption === pill.quiz.correctAnswer) {
      if (!completedQuizzes[pill.id]) {
        onEarnTokens(pill.quiz.tokenReward, `Quiz completato: ${pill.title}`);
        setCompletedQuizzes(prev => ({ ...prev, [pill.id]: true }));
      }
    }
  };

  const toggleLike = (id: string) => {
    setLikedPills(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePlayAudio = (pillId: string, text: string) => {
    if (isPlayingAudio === pillId) {
      window.speechSynthesis?.cancel();
      setIsPlayingAudio(null);
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'it-IT';
      utterance.onend = () => setIsPlayingAudio(null);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(pillId);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      
      {/* Category Pills Header */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['ALL', 'AI', 'STEM', 'Physics', 'Humanities', 'Economics'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
              selectedCategory === cat
                ? 'bg-cyan-500 text-[#050710] border-cyan-400 glow-cyan'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            {cat === 'ALL' ? 'Tutte le Pillole' : cat}
          </button>
        ))}
      </div>

      {/* HITL Guarantee Banner */}
      <div className="glass-card p-3 rounded-2xl border border-emerald-800/40 bg-emerald-950/10 flex items-center justify-between text-xs text-emerald-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>
            <strong>Protocollo Human-in-the-Loop (HITL) Attivo:</strong> Ogni pillola è pre-verificata al 100% dalla Commissione Didattica prima della pubblicazione.
          </span>
        </div>
        <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700">
          Zero-Fake-News
        </span>
      </div>

      {/* Feed Reels Stack */}
      <div className="space-y-8">
        {filteredPills.map((pill) => (
          <article
            key={pill.id}
            className="glass-card rounded-3xl border border-slate-800/90 overflow-hidden shadow-2xl glass-card-hover transition-all relative"
          >
            {/* Top Bar with Author and HITL Badge */}
            <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 p-[1px]">
                  <div className="w-full h-full bg-[#080c18] rounded-[11px] flex items-center justify-center font-bold text-xs text-cyan-300">
                    {pill.author.charAt(0)}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    {pill.author}
                    <span className="text-[10px] font-normal text-slate-400">• {pill.school}</span>
                  </h4>
                  <p className="text-[10px] text-cyan-400 font-medium">{pill.subject}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-[10px] text-emerald-300 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">HITL Verificato</span>
              </div>
            </div>

            {/* Content Media / Header */}
            {pill.imageUrl && (
              <div className="relative h-56 sm:h-72 w-full bg-slate-950 overflow-hidden">
                <img
                  src={pill.imageUrl}
                  alt={pill.title}
                  className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080c1a] via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <span className="px-3 py-1 rounded-full bg-[#050710]/80 backdrop-blur-md text-[11px] font-semibold text-cyan-300 border border-cyan-500/30">
                    #{pill.category}
                  </span>

                  <button
                    onClick={() => handlePlayAudio(pill.id, `${pill.title}. ${pill.summary}`)}
                    className={`p-2 rounded-full backdrop-blur-md transition-all border ${
                      isPlayingAudio === pill.id
                        ? 'bg-emerald-500 text-black border-emerald-300 animate-pulse'
                        : 'bg-slate-900/80 text-slate-200 border-slate-700 hover:text-white'
                    }`}
                    title="Ascolta sintesi vocale (Accessibilità Sensoriale)"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Pill Text & Summary */}
            <div className="p-5 space-y-4">
              <h3 className="text-lg font-bold text-white leading-snug">{pill.title}</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{pill.summary}</p>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleLike(pill.id)}
                    className={`flex items-center gap-1.5 transition-colors ${
                      likedPills[pill.id] ? 'text-pink-500 font-bold' : 'hover:text-slate-200'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${likedPills[pill.id] ? 'fill-pink-500 text-pink-500' : ''}`} />
                    <span>{pill.likes + (likedPills[pill.id] ? 1 : 0)}</span>
                  </button>

                  <button
                    onClick={() => onAskAI(`Spiegami in dettaglio la pillola: "${pill.title}". ${pill.summary}`)}
                    className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 font-semibold"
                  >
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>DeepSeek AI Explainer</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setActiveQuizPillId(pill.id);
                    setSelectedOption(null);
                    setQuizSubmitted(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-[#050710] font-bold text-xs shadow-md shadow-cyan-500/20"
                >
                  <Award className="w-4 h-4" />
                  <span>Micro-Quiz (+{pill.quiz.tokenReward} $QNT)</span>
                </button>
              </div>

              {/* Embedded Micro-Quiz Modal / Drawer */}
              {activeQuizPillId === pill.id && (
                <div className="mt-4 p-4 rounded-2xl bg-slate-900/90 border border-cyan-800/60 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-bold text-xs text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-400" /> Micro-Test di Verifica
                    </span>
                    <span className="text-[11px] text-amber-300 font-mono">
                      Premio: +{pill.quiz.tokenReward} $QNT
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-white">{pill.quiz.question}</p>

                  <div className="space-y-2">
                    {pill.quiz.options.map((opt, idx) => {
                      const isCorrect = idx === pill.quiz.correctAnswer;
                      const isSelected = selectedOption === idx;

                      let btnStyle = 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800';
                      if (quizSubmitted) {
                        if (isCorrect) btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold';
                        else if (isSelected && !isCorrect) btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                      } else if (isSelected) {
                        btnStyle = 'bg-cyan-950/80 border-cyan-500 text-cyan-200 font-bold';
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectAnswer(idx)}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {quizSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          {quizSubmitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400" />}
                        </button>
                      );
                    })}
                  </div>

                  {!quizSubmitted ? (
                    <button
                      onClick={() => handleVerifyAnswer(pill)}
                      disabled={selectedOption === null}
                      className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs disabled:opacity-50 transition-all"
                    >
                      Conferma Risposta
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <p className="text-xs font-bold text-white">Spiegazione Didattica:</p>
                      <p className="text-xs text-slate-300">{pill.quiz.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
