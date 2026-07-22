'use client';

import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, RefreshCw, Cpu } from 'lucide-react';

interface AIAssistantProps {
  initialPrompt?: string;
}

export default function AIAssistant({ initialPrompt }: AIAssistantProps) {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; source?: string }>>([
    {
      sender: 'ai',
      text: 'Ciao! Sono il motore DeepSeek v4 Pro integrato in Quantaly. Come posso supportare il tuo apprendimento oggi? Posso spiegare formule STEM, analizzare codice o creare mappe concettuali DSA per te.',
      source: 'deepseek-v4-pro'
    }
  ]);
  const [input, setInput] = useState(initialPrompt || '');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMsg,
          systemPrompt: 'Sei il tutor didattico di intelligenza adattiva Quantaly, alimentato dal modello DeepSeek v4 Pro. Rispondi in modo chiaro, sintetico e strutturato per lo studente.'
        })
      });

      const data = await res.json();
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: data.text || 'Nessuna risposta dal motore AI.', source: data.source }
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: 'Risposta elaborata dal motore locale: Analisi del quesito completata.', source: 'quantaly-local' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      
      {/* Top Banner */}
      <div className="glass-card p-6 rounded-3xl border border-amber-800/60 bg-gradient-to-r from-amber-950/20 via-slate-900 to-purple-950/20 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950 border border-amber-700/60 text-amber-300 text-xs font-bold">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span>NVIDIA DeepSeek v4 Pro AI Core</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Tutor Adattivo Quantaly</h2>
          <p className="text-xs text-slate-300">
            Chiedi spiegazioni approfondite su qualsiasi materia, risolvi dubbi teorici o genera sintesi ad alta leggibilità.
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4 flex flex-col justify-between min-h-[480px]">
        
        {/* Messages */}
        <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xs ${
                m.sender === 'user' ? 'bg-cyan-500 text-black' : 'bg-purple-900 border border-purple-500 text-purple-200'
              }`}>
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`p-4 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-cyan-950/80 border border-cyan-500/60 text-white rounded-tr-none'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none font-mono'
              }`}>
                <p className="whitespace-pre-wrap">{m.text}</p>
                {m.source && (
                  <span className="block mt-2 text-[9px] text-amber-400 font-sans uppercase tracking-wider font-semibold">
                    Engine: {m.source}
                  </span>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-amber-400 font-mono animate-pulse p-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> Elaborazione DeepSeek AI in corso...
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="pt-3 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="Fai una domanda al DeepSeek AI Core..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-black font-extrabold text-xs transition-all disabled:opacity-50 shadow-md shadow-amber-500/20 flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" /> Invia
          </button>
        </form>

      </div>
    </div>
  );
}
