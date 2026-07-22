'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile, UserInvite } from '../types';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import {
  X,
  User,
  School,
  Sparkles,
  MessageSquare,
  UserPlus,
  CheckCircle,
  Coins,
  Globe,
  Award,
  Clock,
  ShieldCheck,
  Video
} from 'lucide-react';

interface PublicProfileModalProps {
  targetUser: UserProfile;
  currentUser: UserProfile;
  onClose: () => void;
  onStartChat: (targetUser: UserProfile) => void;
  onSendInvite: (email: string, name: string) => void;
  onStartCall?: (targetUser: UserProfile) => void;
}

export default function PublicProfileModal({
  targetUser,
  currentUser,
  onClose,
  onStartChat,
  onSendInvite,
  onStartCall
}: PublicProfileModalProps) {
  const [inviteStatus, setInviteStatus] = useState<'none' | 'pending' | 'accepted'>('none');
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Check if online (mocked based on timestamp or online status field)
  const isOnline = targetUser.status?.includes('Online') || targetUser.uid.length % 2 === 0;

  useEffect(() => {
    checkInviteStatus();
  }, [targetUser.uid, currentUser.uid]);

  const checkInviteStatus = async () => {
    setLoadingInvite(true);
    try {
      if (targetUser.uid === currentUser.uid) {
        setInviteStatus('accepted');
        setLoadingInvite(false);
        return;
      }

      // Query Firestore invites
      const invitesRef = collection(db, 'user_invites');
      const q1 = query(
        invitesRef,
        where('fromUid', '==', currentUser.uid),
        where('toUid', '==', targetUser.uid)
      );
      const q2 = query(
        invitesRef,
        where('fromUid', '==', targetUser.uid),
        where('toUid', '==', currentUser.uid)
      );

      const [snap1, snap2] = await Promise.all([getDocs(q1).catch(() => null), getDocs(q2).catch(() => null)]);

      let foundStatus: 'none' | 'pending' | 'accepted' = 'none';

      if (snap1 && !snap1.empty) {
        const docData = snap1.docs[0].data();
        foundStatus = docData.status === 'accepted' ? 'accepted' : 'pending';
      } else if (snap2 && !snap2.empty) {
        const docData = snap2.docs[0].data();
        foundStatus = docData.status === 'accepted' ? 'accepted' : 'pending';
      }

      setInviteStatus(foundStatus);
    } catch (err) {
      console.warn('Invite check notice:', err);
    } finally {
      setLoadingInvite(false);
    }
  };

  const handleSendInviteAction = async () => {
    setIsSending(true);
    try {
      await onSendInvite(targetUser.email, targetUser.displayName);
      setInviteStatus('pending');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#080c18] border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-6 animate-in fade-in zoom-in-95">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Profile Banner & Avatar */}
        <div className="text-center space-y-3 pt-2">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-cyan-500 via-purple-600 to-emerald-500 p-1 shadow-xl shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[22px] overflow-hidden flex items-center justify-center">
                {targetUser.photoURL ? (
                  <img src={targetUser.photoURL} alt={targetUser.displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-black text-cyan-400">{targetUser.displayName.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>

            {/* Online / Offline Dot Indicator */}
            <div
              className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-[#080c18] flex items-center justify-center ${
                isOnline ? 'bg-emerald-500 shadow-md shadow-emerald-500/50' : 'bg-slate-600'
              }`}
              title={isOnline ? 'Utente Online adesso' : 'Utente Offline'}
            >
              {isOnline && <span className="w-2 h-2 rounded-full bg-white animate-ping" />}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center justify-center gap-2">
              {targetUser.displayName}
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </h2>
            <div className="flex items-center justify-center gap-2 mt-1 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800 text-[11px] font-semibold whitespace-nowrap">
                {isOnline ? '🟢 Online' : '⚪ Offline'}
              </span>
              <span className="px-3 py-1 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800 text-[11px] font-semibold whitespace-nowrap">
                Età: {targetUser.displayAge || 'Non spec.'} anni
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-[11px] font-semibold whitespace-nowrap capitalize">
                {targetUser.role === 'student' ? 'Studente' : targetUser.role === 'teacher' ? 'Docente' : 'Dirigente'}
              </span>
            </div>
          </div>
        </div>

        {/* Public Details Cards */}
        <div className="space-y-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <School className="w-3.5 h-3.5 text-cyan-400" /> Istituto Scolastico:
            </span>
            <span className="font-bold text-white text-right">{targetUser.schoolName || 'ITT Informatico Marconi'}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Globe className="w-3.5 h-3.5 text-emerald-400" /> Paese & Lingua:
            </span>
            <span className="font-bold text-white">{targetUser.country || 'Italia'} ({targetUser.language || 'IT'})</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Coins className="w-3.5 h-3.5 text-amber-400" /> Token $QNT Guadagnati:
            </span>
            <span className="font-bold text-amber-400">{targetUser.qntTokens || 250} $QNT</span>
          </div>

          {targetUser.status && (
            <div className="pt-1">
              <span className="text-slate-400 block mb-1 font-medium">Stato Visibile:</span>
              <p className="text-slate-200 bg-slate-950 p-2.5 rounded-xl border border-slate-800 italic">
                "{targetUser.status}"
              </p>
            </div>
          )}

          {targetUser.bio && (
            <div className="pt-1">
              <span className="text-slate-400 block mb-1 font-medium">Biografia Pubblica:</span>
              <p className="text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800 leading-relaxed">
                {targetUser.bio}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons: Chat or Invite */}
        <div className="space-y-2 pt-2">
          {targetUser.uid === currentUser.uid ? (
            <p className="text-xs text-slate-500 text-center py-2">Questo è il tuo profilo pubblico.</p>
          ) : inviteStatus === 'accepted' ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onStartChat(targetUser);
                  onClose();
                }}
                className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" /> Chatta Subito
              </button>

              <button
                onClick={() => {
                  if (onStartCall) onStartCall(targetUser);
                  onClose();
                }}
                className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
              >
                <Video className="w-4 h-4" /> Chiama
              </button>
            </div>
          ) : inviteStatus === 'pending' ? (
            <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 animate-spin" />
              <span>Invito in Sospeso - In attesa di accettazione</span>
            </div>
          ) : (
            <button
              onClick={handleSendInviteAction}
              disabled={isSending}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-extrabold text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSending ? 'Invio in corso...' : 'Invita a Chattare (Crittografato)'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
