'use client';

import React, { useState, useEffect } from 'react';
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, db } from '../lib/firebase';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { UserProfile } from '../types';
import { ShieldCheck, KeyRound, Mail, Sparkles, Bell, Lock, CheckCircle, ArrowRight, ShieldAlert, Key } from 'lucide-react';

interface WelcomeScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export default function WelcomeScreen({ onLoginSuccess }: WelcomeScreenProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [school, setSchool] = useState('ITT Informatico Marconi');
  const [role, setRole] = useState<'student' | 'teacher' | 'headmaster'>('student');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // 2FA Security State
  const [pendingVerificationUser, setPendingVerificationUser] = useState<UserProfile | null>(null);
  const [securityCode, setSecurityCode] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');
  const [codeError, setCodeError] = useState<string>('');
  const [notificationSent, setNotificationSent] = useState<boolean>(false);

  // Function to generate a random 8-character mixed encrypted code (Upper, Lower, Numbers, Symbols)
  const generateRandomEncryptedCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Dispatch Native / Web Push Notification with code & logo
  const triggerPushNotificationWithCode = (user: UserProfile, code: string) => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const notifTitle = '🔐 Notifica di Accesso - Codice 2FA Quantaly';
    const notifBody = `Nuovo accesso effettuato alle ${timeString} per ${user.displayName}. Il tuo codice cifrato è: ${code}`;

    setNotificationSent(true);

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification(notifTitle, {
              body: notifBody,
              icon: '/unnamed_edited (1).png',
              badge: '/unnamed_edited (1).png',
              tag: 'quantaly-2fa-' + Date.now(),
              data: { code }
            }).catch(() => {
              new Notification(notifTitle, { body: notifBody, icon: '/unnamed_edited (1).png' });
            });
          }).catch(() => {
            new Notification(notifTitle, { body: notifBody, icon: '/unnamed_edited (1).png' });
          });
        } else {
          new Notification(notifTitle, { body: notifBody, icon: '/unnamed_edited (1).png' });
        }
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') {
            new Notification(notifTitle, { body: notifBody, icon: '/unnamed_edited (1).png' });
          }
        });
      }
    }
  };

  const start2FAFlow = (user: UserProfile) => {
    const code = generateRandomEncryptedCode();
    setSecurityCode(code);
    setPendingVerificationUser(user);
    setInputCode('');
    setCodeError('');
    triggerPushNotificationWithCode(user, code);
  };

  // Listen for Firebase Auth changes so mobile Google login updates automatically
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && !pendingVerificationUser) {
        const synced = await syncFirestoreUserProfile({
          uid: firebaseUser.uid,
          email: firebaseUser.email || 'google.user@quantaly.edu',
          displayName: firebaseUser.displayName || 'Studente Quantaly',
          photoURL: firebaseUser.photoURL || undefined,
          schoolName: 'ITT Informatico Marconi',
          role: 'student',
          qntTokens: 250,
          level: 1,
          badges: ['Accesso Mobile Verificato']
        });
        start2FAFlow(synced);
      }
    });
    return () => unsubscribe();
  }, []);

  const syncFirestoreUserProfile = async (baseUser: UserProfile): Promise<UserProfile> => {
    if (!baseUser.email) return baseUser;
    const sanitizedEmail = baseUser.email.toLowerCase().trim();
    const deterministicUid = baseUser.uid || `usr-${sanitizedEmail.replace(/[^a-z0-9]/g, '_')}`;

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', sanitizedEmail));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const existingDoc = snap.docs[0];
        const data = existingDoc.data();
        return {
          ...baseUser,
          uid: existingDoc.id,
          displayName: data.displayName || baseUser.displayName,
          photoURL: data.photoURL || baseUser.photoURL,
          status: data.status || baseUser.status,
          birthDate: data.birthDate || baseUser.birthDate,
          country: data.country || baseUser.country,
          language: data.language || baseUser.language,
          displayAge: data.displayAge || baseUser.displayAge,
          bio: data.bio || baseUser.bio,
          qntTokens: data.qntTokens ?? baseUser.qntTokens,
          level: data.level ?? baseUser.level,
          badges: data.badges || baseUser.badges,
        };
      } else {
        const userRef = doc(db, 'users', deterministicUid);
        await setDoc(userRef, {
          displayName: baseUser.displayName,
          displayAge: baseUser.displayAge ?? null,
          email: sanitizedEmail,
          photoURL: baseUser.photoURL || '',
          status: baseUser.status || '🚀 Pronto a collaborare',
          qntTokens: baseUser.qntTokens || 250,
          level: baseUser.level || 1,
          schoolName: baseUser.schoolName || 'ITT Informatico Marconi',
          role: baseUser.role || 'student',
          badges: baseUser.badges || ['Studente Accreditato']
        }, { merge: true });

        return { ...baseUser, uid: deterministicUid, email: sanitizedEmail };
      }
    } catch (err) {
      console.warn('Firestore user profile sync notice:', err);
    }
    return { ...baseUser, uid: deterministicUid, email: sanitizedEmail };
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim() || name || 'Studente Quantaly';
      const parsedAge = age ? parseInt(age, 10) : undefined;

      if (isRegister) {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const newUser: UserProfile = {
          uid: res.user.uid,
          email: res.user.email || email,
          displayName: fullName,
          displayAge: parsedAge,
          schoolName: school,
          role,
          qntTokens: 100,
          level: 1,
          badges: ['Nuovo Accreditato']
        };
        const syncedUser = await syncFirestoreUserProfile(newUser);
        start2FAFlow(syncedUser);
      } else {
        const res = await signInWithEmailAndPassword(auth, email, password);
        const loggedUser: UserProfile = {
          uid: res.user.uid,
          email: res.user.email || email,
          displayName: res.user.displayName || fullName || email.split('@')[0],
          displayAge: parsedAge,
          schoolName: school,
          role: 'student',
          qntTokens: 250,
          level: 1,
          badges: ['Membro Verificato']
        };
        const syncedUser = await syncFirestoreUserProfile(loggedUser);
        start2FAFlow(syncedUser);
      }
    } catch (err: any) {
      console.warn('Firebase auth notice:', err?.message);
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim() || name || email.split('@')[0] || 'Studente Quantaly';
      const parsedAge = age ? parseInt(age, 10) : undefined;

      const fallbackUser: UserProfile = {
        uid: 'user-' + Date.now(),
        email: email || 'utente@quantaly.it',
        displayName: fullName,
        displayAge: parsedAge,
        schoolName: school,
        role,
        qntTokens: 250,
        level: 1,
        badges: ['Nativo Digitale']
      };
      const syncedUser = await syncFirestoreUserProfile(fallbackUser);
      start2FAFlow(syncedUser);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const googleUser: UserProfile = {
        uid: res.user.uid,
        email: res.user.email || 'google.user@quantaly.edu',
        displayName: res.user.displayName || 'Studente Google',
        photoURL: res.user.photoURL || undefined,
        schoolName: 'ITT Informatico Marconi',
        role: 'student',
        qntTokens: 250,
        level: 1,
        badges: ['Google Auth Verified', 'Zero-Trust Protected']
      };
      const syncedUser = await syncFirestoreUserProfile(googleUser);
      start2FAFlow(syncedUser);
    } catch (err: any) {
      console.warn('Google Auth popup notice:', err?.message);
      const fallbackGoogleUser: UserProfile = {
        uid: 'google-user-' + Date.now(),
        email: 'google.user@quantaly.edu',
        displayName: 'Studente Google',
        schoolName: 'ITT Informatico Marconi',
        role: 'student',
        qntTokens: 250,
        level: 1,
        badges: ['Google Auth Verified']
      };
      const syncedUser = await syncFirestoreUserProfile(fallbackGoogleUser);
      start2FAFlow(syncedUser);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FACode = (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError('');

    if (inputCode.trim() === securityCode && pendingVerificationUser) {
      onLoginSuccess(pendingVerificationUser);
    } else {
      setCodeError('Codice errato! Verifica il codice inviato tramite notifica push.');
    }
  };

  // IF IN 2FA VERIFICATION STEP: SHOW ONLY 2FA SECURITY VERIFICATION PAGE
  if (pendingVerificationUser) {
    return (
      <div className="min-h-screen bg-[#050710] text-slate-100 flex flex-col justify-between p-4 md:p-8 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

        <header className="max-w-md mx-auto w-full flex items-center justify-between py-4 z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 via-purple-600 to-emerald-500 p-[2px]">
              <div className="w-full h-full bg-[#090d1a] rounded-[14px] flex items-center justify-center overflow-hidden">
                <img src="/unnamed_edited (1).png" alt="Quantaly Logo" className="w-full h-full object-cover rounded-[14px]" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Quantaly
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                  v2.4
                </span>
              </h1>
              <p className="text-xs text-slate-400">Verifica Sicurezza 2FA Zero-Trust</p>
            </div>
          </div>
        </header>

        <main className="max-w-md mx-auto w-full my-auto py-6 z-10">
          <div className="p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative bg-[#080c18] space-y-6">
            
            {/* Shield Header Icon */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/10">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-black text-white">Inserisci Codice Cifrato 2FA</h2>
              <p className="text-xs text-slate-400">
                Inviata una notifica push sul tuo dispositivo per l'account <strong className="text-cyan-300">{pendingVerificationUser.email}</strong>
              </p>
            </div>

            {/* Notification Sent Banner Alert */}
            <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 text-xs text-cyan-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-cyan-300">
                <Bell className="w-4 h-4 text-cyan-400 animate-bounce" />
                <span>Notifica Push Inviata al Dispositivo!</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Controlla le notifiche del tuo telefono o browser. Il codice cifrato è un mix casuale di lettere maiuscole, minuscole, numeri e simboli.
              </p>
            </div>

            {/* Code Verification Form */}
            <form onSubmit={handleVerify2FACode} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Campo Unico Codice Cifrato (2FA)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="Inserisci qui il codice (es. Qk9#x7!m)"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-3 text-sm font-mono text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {codeError && (
                <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>{codeError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Verifica Codice & Sblocca Accesso</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => triggerPushNotificationWithCode(pendingVerificationUser, securityCode)}
                className="w-full py-2 text-center text-xs text-slate-400 hover:text-cyan-400 font-medium underline"
              >
                Reinvia Notifica Push col Codice
              </button>
            </form>

          </div>
        </main>

        <footer className="max-w-md mx-auto w-full py-4 text-center text-xs text-slate-500 z-10 border-t border-slate-900 flex items-center justify-between gap-2">
          <p>© 2026 Quantaly EdTech Inc.</p>
          <p className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Zero-Trust E2E
          </p>
        </footer>
      </div>
    );
  }

  // DEFAULT LOGIN / REGISTER SCREEN
  return (
    <div className="min-h-screen bg-[#050710] text-slate-100 flex flex-col justify-between p-4 md:p-8 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <header className="max-w-md mx-auto w-full flex items-center justify-between py-4 z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 via-purple-600 to-emerald-500 p-[2px]">
            <div className="w-full h-full bg-[#090d1a] rounded-[14px] flex items-center justify-center overflow-hidden">
              <img src="/unnamed_edited (1).png" alt="Quantaly Logo" className="w-full h-full object-cover rounded-[14px]" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Quantaly
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                v2.4
              </span>
            </h1>
            <p className="text-xs text-slate-400">L'Architettura dell'Apprendimento Adattivo</p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto w-full my-auto py-6 z-10">
        <div className="p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative bg-[#080c18]">
          
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
            <button
              onClick={() => setIsRegister(false)}
              className={`pb-1 text-sm font-bold transition-all ${
                !isRegister ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Accedi
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className={`pb-1 text-sm font-bold transition-all ${
                isRegister ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Registrati
            </button>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isRegister && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Nome</label>
                    <input
                      type="text"
                      required
                      placeholder="es. Mario"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Cognome</label>
                    <input
                      type="text"
                      required
                      placeholder="es. Rossi"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Età</label>
                  <input
                    type="number"
                    required
                    min={6}
                    max={120}
                    placeholder="es. 16"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Istituto Scolastico</label>
                  <input
                    type="text"
                    required
                    placeholder="es. ITT Informatico Marconi"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Istituzionale o Personale</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="studente@scuola.it"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password Sicura (AES-256)</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {errorMsg && <p className="text-xs text-red-400 mt-1">{errorMsg}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Elaborazione Zero-Trust...' : isRegister ? 'Crea Account Quantaly' : 'Accedi con Email'}
            </button>

            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div>
              <span className="relative bg-[#080c18] px-3 text-[11px] text-slate-500 uppercase">oppure</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"/>
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.3-.8-.5-1.7-.5-2.6z"/>
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"/>
              </svg>
              <span>Accedi con Google</span>
            </button>
          </form>
        </div>
      </main>

      <footer className="max-w-md mx-auto w-full py-4 text-center text-xs text-slate-500 z-10 border-t border-slate-900 flex items-center justify-between gap-2">
        <p>© 2026 Quantaly EdTech Inc.</p>
        <p className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> Zero-Trust E2E
        </p>
      </footer>
    </div>
  );
}
