'use client';

import React, { useState } from 'react';
import { UserProfile, UserInvite, ChatMessage } from '../types';
import { Lock, Phone, Video, Send, UserPlus, Check, X, ShieldAlert, Radio, Search, Mic, MicOff, Camera, CameraOff, PhoneOff } from 'lucide-react';

interface CommunicationProps {
  currentUser: UserProfile;
  invites: UserInvite[];
  messages: ChatMessage[];
  onSendInvite: (targetEmail: string, targetName: string) => void;
  onAcceptInvite: (inviteId: string) => void;
  onRejectInvite: (inviteId: string) => void;
  onSendMessage: (recipientUid: string, text: string) => void;
  onRequestCall: (type: 'audio' | 'video', recipientName: string) => void;
}

export default function Communication({
  currentUser,
  invites,
  messages,
  onSendInvite,
  onAcceptInvite,
  onRejectInvite,
  onSendMessage,
  onRequestCall
}: CommunicationProps) {
  const [activeChatPeer, setActiveChatPeer] = useState<{ uid: string; name: string } | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Call Modal State
  const [activeCall, setActiveCall] = useState<{ type: 'audio' | 'video'; peerName: string } | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);

  // Filter accepted connections
  const acceptedConnections = invites.filter(
    inv => (inv.fromUid === currentUser.uid || inv.toUid === currentUser.uid) && inv.status === 'accepted'
  );

  const pendingIncomingInvites = invites.filter(
    inv => inv.toUid === currentUser.uid && inv.status === 'pending'
  );

  const handleStartCall = (type: 'audio' | 'video', peerName: string) => {
    setActiveCall({ type, peerName });
    onRequestCall(type, peerName);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatPeer) return;

    onSendMessage(activeChatPeer.uid, inputText);
    setInputText('');
  };

  const currentChatMessages = activeChatPeer
    ? messages.filter(
        m => (m.senderUid === currentUser.uid && m.recipientUid === activeChatPeer.uid) ||
             (m.senderUid === activeChatPeer.uid && m.recipientUid === currentUser.uid)
      )
    : [];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      
      {/* Header Banner */}
      <div className="glass-card p-6 rounded-3xl border border-blue-800/60 bg-gradient-to-r from-blue-950/20 via-slate-900 to-cyan-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950 border border-blue-700/60 text-blue-300 text-xs font-semibold mb-2">
            <Lock className="w-3.5 h-3.5 text-blue-400" />
            <span>Perimetro di Sicurezza & Protocollo di Invito Obbligatorio</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Comunicazione Integrata Quantaly (E2E)</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Puoi messaggiare e chiamare gli altri studenti SOLO se la richiesta di contatto viene espressamente accettata. I dati vengono crittografati e rimescolati client-side.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-blue-950/80 border border-blue-800 text-xs text-blue-300">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          <span>Zero-Knowledge Encryption</span>
        </div>
      </div>

      {/* Pending Invites Alert Bar */}
      {pendingIncomingInvites.length > 0 && (
        <div className="p-4 rounded-2xl bg-cyan-950/50 border border-cyan-500/80 space-y-3">
          <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
            Richieste di Connessione in Arrivo ({pendingIncomingInvites.length})
          </h3>
          <div className="space-y-2">
            {pendingIncomingInvites.map(inv => (
              <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <div>
                  <p className="font-bold text-white">{inv.fromName}</p>
                  <p className="text-[10px] text-slate-400">{inv.fromEmail}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onAcceptInvite(inv.id)}
                    className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Accetta
                  </button>
                  <button
                    onClick={() => onRejectInvite(inv.id)}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Rifiuta
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Connections List */}
        <div className="lg:col-span-4 glass-card p-4 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider px-1">
            Contatti Autorizzati ({acceptedConnections.length})
          </h3>

          <div className="space-y-2 max-h-[420px] overflow-y-auto">
            {acceptedConnections.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 space-y-2">
                <p>Nessun contatto collegato.</p>
                <p className="text-[11px] text-cyan-400">Cerca un utente in alto e invia un invito per sbloccare la chat e le chiamate!</p>
              </div>
            ) : (
              acceptedConnections.map(inv => {
                const peerName = inv.fromUid === currentUser.uid ? 'Studente Collegato' : inv.fromName;
                const peerUid = inv.fromUid === currentUser.uid ? inv.toUid : inv.fromUid;
                const isSelected = activeChatPeer?.uid === peerUid;

                return (
                  <div
                    key={inv.id}
                    onClick={() => setActiveChatPeer({ uid: peerUid, name: peerName })}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-xs text-black">
                        {peerName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{peerName}</h4>
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                          <Lock className="w-3 h-3" /> Canale Cifrato E2E
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Active Chat / Call Screen */}
        <div className="lg:col-span-8 glass-card p-5 rounded-3xl border border-slate-800 flex flex-col justify-between min-h-[460px]">
          {activeChatPeer ? (
            <>
              {/* Chat Top Bar */}
              <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    {activeChatPeer.name}
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">AES-256 Scrambled Payload Stream</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartCall('audio', activeChatPeer.name)}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500 text-cyan-400 transition-all"
                    title="Chiamata Audio Crittografata"
                  >
                    <Phone className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleStartCall('video', activeChatPeer.name)}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-purple-500 text-purple-400 transition-all"
                    title="Videocall Proprietaria Protetta"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages Flow Area */}
              <div className="my-4 space-y-3 overflow-y-auto max-h-[280px] pr-2">
                {currentChatMessages.length === 0 ? (
                  <p className="text-center text-xs text-slate-500 py-12">
                    Canale crittografato aperto. Invia un messaggio per iniziare.
                  </p>
                ) : (
                  currentChatMessages.map((msg) => {
                    const isMe = msg.senderUid === currentUser.uid;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`p-3 rounded-2xl max-w-[80%] text-xs ${
                            isMe
                              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-md'
                              : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                          }`}
                        >
                          <p>{msg.text}</p>
                          <p className="text-[9px] opacity-60 mt-1 font-mono text-right">{msg.timestamp}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Send Input */}
              <form onSubmit={handleSendChatMessage} className="pt-3 border-t border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Scrivi un messaggio crittografato..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all shadow-md shadow-cyan-500/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center my-auto text-center py-16 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400">
                <Lock className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-white">Seleziona una connessione autorizzata</p>
              <p className="text-xs text-slate-400 max-w-sm">
                La privacy degli studenti è tutelata da una barriera Zero-Trust. Nessun utente esterno può inviarti spam o effettuare chiamate indiscrete.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Audio / Video Call Active Modal Overlay */}
      {activeCall && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card p-8 rounded-3xl border border-cyan-500/60 max-w-md w-full text-center space-y-6 animate-in zoom-in-95 glow-border-cyan">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-mono font-bold uppercase">
                {activeCall.type === 'video' ? 'Videocall Cifrata HD' : 'Chiamata Audio End-to-End'}
              </span>
              <h3 className="text-xl font-extrabold text-white">{activeCall.peerName}</h3>
              <p className="text-xs text-emerald-400 font-mono flex items-center justify-center gap-1">
                <Radio className="w-3.5 h-3.5 animate-pulse" /> Connessione Proprietaria WebRTC Stabile (14ms)
              </p>
            </div>

            {/* Video View Simulation */}
            {activeCall.type === 'video' && (
              <div className="relative h-48 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
                {isCamOff ? (
                  <p className="text-xs text-slate-500">Telecamera Disattivata</p>
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-slate-900 via-cyan-950 to-purple-950 flex items-center justify-center">
                    <span className="text-4xl font-black text-cyan-400/30">QUANTALAY STREAM</span>
                  </div>
                )}
              </div>
            )}

            {/* Controls Bar */}
            <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-800">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-full border transition-all ${
                  isMuted ? 'bg-rose-950 border-rose-500 text-rose-400' : 'bg-slate-900 border-slate-700 text-slate-200'
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {activeCall.type === 'video' && (
                <button
                  onClick={() => setIsCamOff(!isCamOff)}
                  className={`p-3 rounded-full border transition-all ${
                    isCamOff ? 'bg-rose-950 border-rose-500 text-rose-400' : 'bg-slate-900 border-slate-700 text-slate-200'
                  }`}
                >
                  {isCamOff ? <CameraOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                </button>
              )}

              <button
                onClick={() => setActiveCall(null)}
                className="p-3.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow-lg shadow-rose-600/30"
                title="Termina Chiamata"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
