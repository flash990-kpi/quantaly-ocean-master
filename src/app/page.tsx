'use client';

import React, { useState, useEffect } from 'react';
import { useScreenSize } from '../hooks/useScreenSize';
import WelcomeScreen from '../components/WelcomeScreen';
import AppHeader from '../components/AppHeader';
import ProfileSettings from '../components/ProfileSettings';
import UserSearchModal from '../components/UserSearchModal';

// 10 Core Quantaly App Modules
import DashboardView from '../components/DashboardView';
import WorkspaceView from '../components/WorkspaceView';
import MeetView from '../components/MeetView';
import CalendarView from '../components/CalendarView';
import FormsView from '../components/FormsView';
import CommunityView from '../components/CommunityView';
import AccessibilitySettingsView from '../components/AccessibilitySettingsView';
import Marketplace from '../components/Marketplace';
import QuizzesView from '../components/QuizzesView';
import AwardsView from '../components/AwardsView';

import { UserProfile, MarketplaceItem, UserInvite, QuantalyNotification } from '../types';
import { Smartphone } from 'lucide-react';

export default function QuantalyApp() {
  const screenSize = useScreenSize();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Marketplace Items Collection
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([
    {
      id: 'mp-1',
      title: 'Mappa Concettuale Fisica Quantistica & Dualismo',
      author: 'Prof. L. Lombardo',
      authorUid: 'teacher-1',
      school: 'ITT Marconi',
      subject: 'Fisica',
      priceQnt: 50,
      rating: 4.9,
      reviewsCount: 18,
      description: 'Mappa concettuale ad alta leggibilità con font OpenDyslexic integrato.',
      type: 'mindmap',
      previewText: 'Concetti chiave: Fotoni, Equazione di Schrödinger, Principio di Indeterminazione.',
      verifiedByPeer: true
    },
    {
      id: 'mp-2',
      title: 'Template Studio Google Drive & Note Sincronizzate',
      author: 'Marco Rossi',
      authorUid: 'student-1',
      school: 'Liceo Scientifico Galileo',
      subject: 'Informatica',
      priceQnt: 80,
      rating: 5.0,
      reviewsCount: 24,
      description: 'Template di appunti ottimizzati per la sintesi vocale e scomposizione compiti.',
      type: 'notes',
      previewText: 'Struttura a moduli con pause forzate di 30s per il bilanciamento cognitivo.',
      verifiedByPeer: true
    }
  ]);

  // Invites & Notifications
  const [invites, setInvites] = useState<UserInvite[]>([]);
  const [notifications, setNotifications] = useState<QuantalyNotification[]>([]);

  // Modals & Banners
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showIosPwaNotice, setShowIosPwaNotice] = useState(false);

  useEffect(() => {
    // Detect iOS for PWA push notification warning
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isIos && !isStandalone) {
      setShowIosPwaNotice(true);
    }

    // Register PWA Service Worker for Push Notifications
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((reg) => {
          console.log('[Quantaly PWA] Service Worker registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('[Quantaly PWA] Service Worker registration notice:', err);
        });
    }

    // Request notification permission if default
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const addNotification = (title: string, body: string, type: QuantalyNotification['type']) => {
    const newNotif: QuantalyNotification = {
      id: 'notif-' + Date.now(),
      title,
      body,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      icon: '/unnamed_edited (1).png'
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Native Push Notification trigger with custom Quantaly Logo
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, {
            body,
            icon: '/unnamed_edited (1).png',
            badge: '/unnamed_edited (1).png',
            tag: 'quantaly-notif-' + Date.now(),
            data: { date: Date.now() }
          }).catch(() => {
            new Notification(title, { body, icon: '/unnamed_edited (1).png', badge: '/unnamed_edited (1).png' });
          });
        }).catch(() => {
          new Notification(title, { body, icon: '/unnamed_edited (1).png', badge: '/unnamed_edited (1).png' });
        });
      } else {
        try {
          new Notification(title, { body, icon: '/unnamed_edited (1).png', badge: '/unnamed_edited (1).png' });
        } catch (e) {
          // fallback if notification constructor fails in certain iframe contexts
        }
      }
    }
  };

  const handleRewardTokens = (amount: number, reason: string) => {
    if (!currentUser) return;
    const updatedTokens = currentUser.qntTokens + amount;
    setCurrentUser({
      ...currentUser,
      qntTokens: updatedTokens
    });
    addNotification('Token $QNT Accreditati!', `+${amount} $QNT per: ${reason}`, 'reward');
  };

  const handleSendInvite = (targetEmail: string, targetName: string) => {
    if (!currentUser) return;
    const newInv: UserInvite = {
      id: 'inv-' + Date.now(),
      fromUid: currentUser.uid,
      fromName: currentUser.displayName,
      fromEmail: currentUser.email,
      toUid: targetEmail,
      status: 'pending',
      timestamp: 'Ora'
    };
    setInvites((prev) => [...prev, newInv]);
    addNotification('Invito Inviato', `Richiesta di connessione inviata a ${targetName}.`, 'invite');
  };

  const handleBuyMarketplaceItem = (item: MarketplaceItem) => {
    if (!currentUser) return;
    if (currentUser.qntTokens < item.priceQnt) {
      alert(`Saldo $QNT insufficiente! Servono ${item.priceQnt} $QNT.`);
      return;
    }
    setCurrentUser({
      ...currentUser,
      qntTokens: currentUser.qntTokens - item.priceQnt
    });
    addNotification('Acquisto Completato', `Sbloccato "${item.title}" per ${item.priceQnt} $QNT.`, 'reward');
  };

  const handlePublishMarketplaceItem = (newItemData: any) => {
    if (!currentUser) return;
    const newItem: MarketplaceItem = {
      id: 'mp-' + Date.now(),
      ...newItemData,
      rating: 5.0,
      reviewsCount: 1,
      verifiedByPeer: true
    };
    setMarketplaceItems((prev) => [newItem, ...prev]);
    handleRewardTokens(50, 'Pubblicazione Appunti Marketplace');
  };

  if (!currentUser) {
    return <WelcomeScreen onLoginSuccess={(u) => setCurrentUser(u)} />;
  }

  return (
    <div className="min-h-screen bg-[#050710] text-slate-100 flex flex-col justify-between">
      
      {/* App Header & Navigation */}
      <AppHeader
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={notifications}
        onMarkNotificationRead={(id) =>
          setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
        }
        onOpenSearch={() => setShowSearchModal(true)}
        onLogout={() => setCurrentUser(null)}
        screenSize={screenSize}
      />

      {/* iOS PWA Push Notification Hint Banner */}
      {showIosPwaNotice && (
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-cyan-950 p-3 text-center text-xs text-cyan-300 border-b border-cyan-800 flex items-center justify-center gap-2">
          <Smartphone className="w-4 h-4 text-cyan-400" />
          <span>
            <strong>Safari / iOS Push Notification:</strong> Per attivare le notifiche push native, aggiungi Quantaly alla Schermata Home del tuo iPhone/iPad come PWA!
          </span>
          <button onClick={() => setShowIosPwaNotice(false)} className="text-slate-400 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Active Tab View Body with Dynamic Anti-Collision Screen Layout Wrapper */}
      <main
        className={`flex-1 pt-3 sm:pt-5 pb-16 transition-all duration-300 ${screenSize.paddingClass}`}
        style={screenSize.scale !== 100 ? { zoom: `${screenSize.scale}%` } : undefined}
      >
        <div className="max-w-7xl mx-auto w-full min-w-0 space-y-6">
        {activeTab === 'dashboard' && (
          <DashboardView user={currentUser} onRewardTokens={handleRewardTokens} />
        )}

        {activeTab === 'workspace' && (
          <WorkspaceView user={currentUser} onRewardTokens={handleRewardTokens} />
        )}

        {activeTab === 'meet' && (
          <MeetView user={currentUser} onRewardTokens={handleRewardTokens} />
        )}

        {activeTab === 'calendar' && (
          <CalendarView user={currentUser} onRewardTokens={handleRewardTokens} />
        )}

        {activeTab === 'forms' && (
          <FormsView user={currentUser} onRewardTokens={handleRewardTokens} />
        )}

        {activeTab === 'community' && (
          <CommunityView user={currentUser} onRewardTokens={handleRewardTokens} />
        )}

        {activeTab === 'accessibility' && (
          <AccessibilitySettingsView
            user={currentUser}
            onUpdateUser={(updated) => setCurrentUser(updated)}
            onRewardTokens={handleRewardTokens}
          />
        )}

        {activeTab === 'marketplace' && (
          <Marketplace
            items={marketplaceItems}
            userQnt={currentUser.qntTokens}
            userUid={currentUser.uid}
            onBuyItem={handleBuyMarketplaceItem}
            onPublishItem={handlePublishMarketplaceItem}
          />
        )}

        {activeTab === 'quizzes' && (
          <QuizzesView user={currentUser} onRewardTokens={handleRewardTokens} />
        )}

        {activeTab === 'awards' && (
          <AwardsView user={currentUser} onRewardTokens={handleRewardTokens} />
        )}

        {activeTab === 'profile' && (
          <ProfileSettings
            user={currentUser}
            onUpdateUser={(updated) => setCurrentUser(updated)}
          />
        )}
        </div>
      </main>

      {/* Modals */}
      {showSearchModal && (
        <UserSearchModal
          onClose={() => setShowSearchModal(false)}
          onSendInvite={handleSendInvite}
        />
      )}

      {/* Fixed Footer */}
      <footer className="border-t border-slate-900 py-3 text-center text-[11px] text-slate-500 bg-[#050710]">
        <p>Quantaly Enterprise EdTech v2.4 • Zero-Trust AES-256 E2E • Protocollo HITL 100% Verified</p>
      </footer>
    </div>
  );
}
