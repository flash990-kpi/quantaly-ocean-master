'use client';

import React, { useState } from 'react';
import { UserProfile } from '../types';
import { User, Camera, Globe, Calendar, Languages, ShieldCheck, Save, Sparkles, CheckCircle2, MessageSquare, HeartHandshake } from 'lucide-react';

interface ProfileSettingsProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
];

import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function ProfileSettings({ user, onUpdateUser }: ProfileSettingsProps) {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [status, setStatus] = useState(user.status || '🚀 Pronto a collaborare');
  const [birthDate, setBirthDate] = useState(user.birthDate || '2010-04-12');
  const [country, setCountry] = useState(user.country || 'Italia');
  const [language, setLanguage] = useState(user.language || 'Italiano');
  const [displayAge, setDisplayAge] = useState<number>(user.displayAge || 16);
  const [photoURL, setPhotoURL] = useState(user.photoURL || PRESET_AVATARS[0]);
  const [bio, setBio] = useState(user.bio || 'Studente appassionato di tecnologia, intelligenza artificiale e scienze STEM.');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [customAvatarInput, setCustomAvatarInput] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoURL(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      displayName,
      status,
      birthDate,
      country,
      language,
      displayAge: Number(displayAge),
      photoURL,
      bio,
    };

    onUpdateUser(updated);

    try {
      if (user.uid) {
        await setDoc(doc(db, 'users', user.uid), {
          displayName,
          status,
          birthDate,
          country,
          language,
          displayAge: Number(displayAge),
          photoURL,
          bio,
          email: user.email,
          qntTokens: user.qntTokens,
          level: user.level,
        }, { merge: true });
      }
    } catch (err) {
      console.error('Error saving profile to Firestore:', err);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 space-y-8 animate-in fade-in duration-300">
      
      {/* Title Header */}
      <div className="text-center space-y-2 pb-4 border-b border-slate-800/80">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/50 text-cyan-300 text-xs font-semibold">
          <User className="w-3.5 h-3.5 text-cyan-400" />
          <span>Gestione Profilo Utente</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Impostazioni Account</h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          Personalizza la tua identità visiva, lo stato di presenza e le informazioni personali mostrate agli altri studenti della rete Quantaly.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/80 text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-lg shadow-emerald-950/50 animate-in zoom-in-95">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Profilo aggiornato con successo! Le modifiche sono ora visibili.</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Profile Picture Card */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-cyan-400" /> Foto dell'Account
            </h2>
            <span className="text-[10px] text-slate-500 font-mono">Formati: JPG, PNG, WebP</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <img
                src={photoURL}
                alt="Foto Profilo"
                className="w-24 h-24 rounded-2xl object-cover border-2 border-cyan-500 shadow-xl shadow-cyan-500/10 transition-transform group-hover:scale-105"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black shadow-md cursor-pointer transition-all"
                title="Carica nuova foto"
              >
                <Camera className="w-4 h-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-3 flex-1 text-center sm:text-left">
              <p className="text-xs font-semibold text-slate-300">Scegli tra gli Avatar Predefiniti:</p>
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setPhotoURL(url)}
                    className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all ${
                      photoURL === url ? 'border-cyan-400 ring-2 ring-cyan-500/30 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              <div className="pt-1">
                <input
                  type="url"
                  placeholder="Oppure incolla URL immagine personalizzata..."
                  value={customAvatarInput}
                  onChange={(e) => {
                    setCustomAvatarInput(e.target.value);
                    if (e.target.value.startsWith('http')) {
                      setPhotoURL(e.target.value);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Identity & Status */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-5">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800/60">
            <User className="w-4 h-4 text-purple-400" /> Identità & Stato Visibile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nome e Cognome / Display Name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="Es. Marco Rossi"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Stato dell'Account (Status Message)
              </label>
              <div className="relative">
                <MessageSquare className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Es. 📚 In preparazione esami STEM"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Didascalia / Bio dell'Account
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none"
              placeholder="Scrivi una breve presentazione di te per gli altri studenti..."
            />
          </div>
        </div>

        {/* Personal Details */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-5">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800/60">
            <Globe className="w-4 h-4 text-emerald-400" /> Dettagli Personali & Localizzazione
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Data di Nascita
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Età Mostrata a Schermo
              </label>
              <input
                type="number"
                min={10}
                max={99}
                value={displayAge}
                onChange={(e) => setDisplayAge(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" /> Paese di Origine
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="Italia">Italia 🇮🇹</option>
                <option value="Svizzera">Svizzera 🇨🇭</option>
                <option value="San Marino">San Marino 🇸🇲</option>
                <option value="Francia">Francia 🇫🇷</option>
                <option value="Germania">Germania 🇩🇪</option>
                <option value="Spagna">Spagna 🇪🇸</option>
                <option value="Regno Unito">Regno Unito 🇬🇧</option>
                <option value="Stati Uniti">Stati Uniti 🇺🇸</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-purple-400" /> Lingua Parlata
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="Italiano">Italiano</option>
                <option value="Inglese">Inglese (English)</option>
                <option value="Tedesco">Tedesco (Deutsch)</option>
                <option value="Francese">Francese (Français)</option>
                <option value="Spagnolo">Spagnolo (Español)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Device Push Notifications Test Section */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Test Notifiche Push Nativa (Dispositivo)
            </h2>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              Web Push & FCM
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Invia una notifica di test al tuo sistema operativo/dispositivo (non solo in-app). Assicurati che le notifiche di sistema siano consentite dal browser.
          </p>

          <button
            type="button"
            onClick={async () => {
              if (typeof window !== 'undefined' && 'Notification' in window) {
                const perm = await Notification.requestPermission();
                if (perm === 'granted') {
                  if ('serviceWorker' in navigator) {
                    const reg = await navigator.serviceWorker.ready.catch(() => null);
                    if (reg) {
                      reg.showNotification('Quantaly System Push', {
                        body: `Notifica push inviata con successo al tuo dispositivo per ${user.displayName}!`,
                        icon: '/logo.png',
                        badge: '/logo.png',
                        tag: 'quantaly-test-push'
                      });
                    } else {
                      new Notification('Quantaly System Push', {
                        body: `Notifica push inviata con successo al tuo dispositivo per ${user.displayName}!`,
                        icon: '/logo.png'
                      });
                    }
                  } else {
                    new Notification('Quantaly System Push', {
                      body: `Notifica push inviata con successo al tuo dispositivo per ${user.displayName}!`,
                      icon: '/logo.png'
                    });
                  }
                  alert('Notifica Push inviata al tuo dispositivo!');
                } else {
                  alert('Permesso notifiche rifiutato dal dispositivo.');
                }
              } else {
                alert('Le notifiche Push non sono supportate da questo browser.');
              }
            }}
            className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Invia Notifica Push di Test sul Dispositivo</span>
          </button>
        </div>

        {/* Save Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Salva Modifiche Profilo</span>
          </button>
        </div>

      </form>
    </div>
  );
}
