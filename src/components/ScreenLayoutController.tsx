'use client';

import React, { useState } from 'react';
import {
  Monitor,
  Smartphone,
  Tablet,
  Tv,
  Maximize2,
  ZoomIn,
  Sliders,
  CheckCircle,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
  LayoutGrid
} from 'lucide-react';
import { useScreenSize, LayoutDensity } from '../hooks/useScreenSize';

interface ScreenLayoutControllerProps {
  screenSize: ReturnType<typeof useScreenSize>;
}

export default function ScreenLayoutController({ screenSize }: ScreenLayoutControllerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [autoSpacingActive, setAutoSpacingActive] = useState(true);

  const getDeviceIcon = () => {
    switch (screenSize.deviceType) {
      case 'mobile':
        return <Smartphone className="w-4 h-4 text-cyan-400" />;
      case 'tablet':
        return <Tablet className="w-4 h-4 text-purple-400" />;
      case 'desktop':
        return <Monitor className="w-4 h-4 text-emerald-400" />;
      case 'ultrawide':
        return <Tv className="w-4 h-4 text-amber-400" />;
      default:
        return <Monitor className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getDeviceLabel = () => {
    switch (screenSize.deviceType) {
      case 'mobile':
        return 'Smartphone / Compatto';
      case 'tablet':
        return 'Tablet / Touch';
      case 'desktop':
        return 'Desktop HD';
      case 'ultrawide':
        return 'Monitor UltraWide 2K/4K';
      default:
        return 'Schermo Rilevato';
    }
  };

  return (
    <div className="relative z-40" suppressHydrationWarning>
      {/* Trigger Pill Button in Top Utility or Header Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/60 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all hover:scale-105 shadow-md shadow-black/40 group"
        title="Controllore Adattivo Schermo e Spaziatura Layout"
      >
        {getDeviceIcon()}
        <span className="font-mono text-[11px] text-cyan-300 font-bold hidden sm:inline">
          {screenSize.width}×{screenSize.height}px
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800 uppercase font-mono">
          {screenSize.breakpoint}
        </span>
        <Sliders className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
      </button>

      {/* Floating Control Panel Modal / Popover */}
      {isOpen && (
        <div className="absolute right-0 top-11 w-80 sm:w-96 glass-card rounded-2xl border border-cyan-500/40 p-5 shadow-2xl bg-[#080c18]/95 backdrop-blur-2xl space-y-4 animate-in fade-in slide-in-from-top-2 text-xs">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
                <LayoutGrid className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Controllore Schermo & Spaziatura</h4>
                <p className="text-[10px] text-slate-400">Adattamento dinamico Anti-Affollamento</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current Display Status Banner */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 font-bold">
                {getDeviceIcon()} {getDeviceLabel()}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-emerald-900">
                {screenSize.orientation === 'landscape' ? 'Orizzontale' : 'Verticale'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px] text-slate-400 border-t border-slate-800/60">
              <div>
                <span>Risoluzione:</span> <strong className="text-cyan-300">{screenSize.width}×{screenSize.height}px</strong>
              </div>
              <div>
                <span>Dispositivo:</span> <strong className="text-purple-300 capitalize">{screenSize.deviceType}</strong>
              </div>
            </div>
          </div>

          {/* Density Selector (Preserves margins, prevents squishing/ciucciato) */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-semibold flex items-center justify-between">
              <span>Densità Spaziatura Layout</span>
              <span className="text-[10px] text-cyan-400 font-mono">Zero elementi compressi</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'compact', label: 'Compatto', desc: 'Minima' },
                  { id: 'comfort', label: 'Standard', desc: 'Equilibrato' },
                  { id: 'spacious', label: 'Spazioso', desc: 'Max Respiro' },
                ] as const
              ).map((d) => (
                <button
                  key={d.id}
                  onClick={() => screenSize.setUserDensity(d.id)}
                  className={`p-2 rounded-xl text-center border transition-all ${
                    screenSize.density === d.id
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 font-bold shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <p className="text-xs">{d.label}</p>
                  <p className="text-[9px] text-slate-500 font-mono mt-0.5">{d.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Scale / Zoom Multiplier */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-semibold flex items-center gap-1">
                <ZoomIn className="w-3.5 h-3.5 text-purple-400" />
                Scala Visuale Elementi
              </span>
              <span className="font-mono text-purple-300 font-bold">{screenSize.scale}%</span>
            </div>

            <div className="flex items-center gap-1.5">
              {[90, 95, 100, 105, 115, 125].map((s) => (
                <button
                  key={s}
                  onClick={() => screenSize.setUserScale(s)}
                  className={`flex-1 py-1 rounded-lg font-mono text-[10px] font-bold border transition-all ${
                    screenSize.scale === s
                      ? 'bg-purple-950 border-purple-500 text-purple-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {s}%
                </button>
              ))}
            </div>
          </div>

          {/* Auto Spacing & Fluid Margin Guard */}
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-bold text-emerald-300 text-xs flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                Protezione Bordi & Overflow
              </p>
              <p className="text-[10px] text-slate-400">
                Impedisce il contatto diretto fra i bordi e gli elementi della pagina.
              </p>
            </div>
            <span className="px-2 py-1 rounded-md bg-emerald-900/60 text-emerald-200 font-mono text-[10px] font-bold">
              ATTIVO
            </span>
          </div>

          {/* Done Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="w-full py-2 rounded-xl bg-cyan-500 text-black font-extrabold text-xs hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20"
          >
            Applica e Salva Impostazioni
          </button>
        </div>
      )}
    </div>
  );
}
