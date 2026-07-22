'use client';

import React, { useState } from 'react';
import { Search, UserPlus, CheckCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

interface UserSearchModalProps {
  onClose: () => void;
  onSendInvite: (email: string, name: string) => void;
}

interface FoundUser {
  uid?: string;
  email: string;
  displayName: string;
  school?: string;
  displayAge?: number;
  bio?: string;
  photoURL?: string;
  status?: string;
}

export default function UserSearchModal({ onClose, onSendInvite }: UserSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<FoundUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [sentMap, setSentMap] = useState<Record<string, boolean>>({});

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, limit(10));
      const querySnapshot = await getDocs(q);
      const found: FoundUser[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const name = data.displayName || 'Utente Quantaly';
        const email = data.email || docSnap.id;
        if (
          name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          email.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          found.push({
            uid: docSnap.id,
            email,
            displayName: name,
            school: data.country ? `Quantaly ${data.country}` : 'Istituto Registrato',
          });
        }
      });
      setResults(found);
    } catch (err) {
      console.error('Error searching Firestore users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = (email: string, name: string) => {
    onSendInvite(email, name);
    setSentMap((prev) => ({ ...prev, [email]: true }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 max-w-lg w-full space-y-4 animate-in fade-in">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Search className="w-4 h-4 text-cyan-400" /> Ricerca Utenti Reali & Invia Inviti
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs font-bold">✕ Chiudi</button>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cerca per nome o email utente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all"
          >
            Cerca
          </button>
        </form>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {loading ? (
            <p className="text-xs text-slate-400 text-center py-4">Ricerca in corso su Firestore...</p>
          ) : results.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">
              {searchQuery ? 'Nessun utente trovato con questo criterio.' : 'Inserisci un nome o un indirizzo email per cercare.'}
            </p>
          ) : (
            results.map((u) => (
              <div key={u.email} className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">{u.displayName}</p>
                  <p className="text-[10px] text-slate-400">{u.email}</p>
                </div>

                {sentMap[u.email] ? (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Invito Inviato
                  </span>
                ) : (
                  <button
                    onClick={() => handleInvite(u.email, u.displayName)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-[11px] transition-all flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Connetti
                  </button>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
