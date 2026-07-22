'use client';

import React, { useState, useRef } from 'react';
import { UserProfile, QuantalyNotification } from '../types';
import ScreenLayoutController from './ScreenLayoutController';
import { useScreenSize } from '../hooks/useScreenSize';
import {
  Coins,
  Bell,
  Search,
  LogOut,
  CheckCheck,
  User,
  LayoutDashboard,
  FileText,
  Video,
  Calendar,
  FileQuestion,
  Users,
  Sliders,
  ShoppingBag,
  HelpCircle,
  Trophy,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Menu,
  X
} from 'lucide-react';

interface AppHeaderProps {
  user: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications: QuantalyNotification[];
  onMarkNotificationRead: (id: string) => void;
  onOpenSearch: () => void;
  onLogout: () => void;
  screenSize: ReturnType<typeof useScreenSize>;
}

export default function AppHeader({
  user,
  activeTab,
  setActiveTab,
  notifications,
  onMarkNotificationRead,
  onOpenSearch,
  onLogout,
  screenSize,
}: AppHeaderProps) {
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workspace', label: 'Hub Studio', icon: FileText },
    { id: 'meet', label: 'Aula Virtuale', icon: Video },
    { id: 'calendar', label: 'Agenda', icon: Calendar },
    { id: 'forms', label: 'Moduli', icon: FileQuestion },
    { id: 'community', label: 'Rubrica', icon: Users },
    { id: 'accessibility', label: 'Accessibilità', icon: Sliders },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
    { id: 'quizzes', label: 'Quiz Globali', icon: HelpCircle },
    { id: 'awards', label: 'Awards', icon: Trophy },
    { id: 'profile', label: 'Profilo', icon: User },
  ];

  const activeItem = navItems.find((item) => item.id === activeTab) || navItems[0];
  const ActiveIcon = activeItem.icon;

  const scrollNav = (direction: 'left' | 'right') => {
    if (navRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      navRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#050710] border-b border-slate-800 px-3 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col gap-2">
        
        {/* Main Row: Logo, Mobile Controls, Desktop Navigation & Controls */}
        <div className="flex items-center justify-between gap-3">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer flex-shrink-0" onClick={() => setActiveTab('dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-purple-600 to-emerald-500 p-[2px] glow-cyan">
              <div className="w-full h-full bg-[#080c18] rounded-[10px] flex items-center justify-center overflow-hidden">
                <img src="/unnamed_edited (1).png" alt="Quantaly Logo" className="w-full h-full object-cover rounded-[10px]" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-white text-sm sm:text-base leading-tight tracking-tight flex items-center gap-1.5">
                Quantaly
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  v2.4
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 hidden sm:block">L'Architettura dell'Apprendimento Adattivo</p>
            </div>
          </div>

          {/* Desktop Carousel Navigation with Left / Right Arrows */}
          <div className="hidden md:flex items-center gap-1.5 flex-1 max-w-2xl mx-auto">
            <button
              onClick={() => scrollNav('left')}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-400 transition-all flex-shrink-0"
              title="Scorri a sinistra"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div
              ref={navRef}
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800/80 text-xs font-medium scroll-smooth"
            >
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => scrollNav('right')}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-400 transition-all flex-shrink-0"
              title="Scorri a destra"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Controls Right Section */}
          <div className="flex items-center gap-2">
            
            {/* Screen Layout Controller */}
            <ScreenLayoutController screenSize={screenSize} />

            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white transition-all"
              title="Cerca Utenti Reali & Invia Inviti"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* QNT Token Badge */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs font-bold">
              <Coins className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{user.qntTokens} <span className="text-[9px] text-amber-400 font-mono hidden sm:inline">$QNT</span></span>
            </div>

            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationsDrawer(!showNotificationsDrawer)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white transition-all relative"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-[#050710] font-extrabold text-[9px] rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Drawer Modal */}
              {showNotificationsDrawer && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 p-4 rounded-2xl border border-slate-800 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 bg-[#080c18]">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center overflow-hidden">
                        <img src="/unnamed_edited (1).png" alt="Quantaly Logo" className="w-full h-full object-cover" />
                      </div>
                      <span className="font-bold text-sm text-white">Notifiche Quantaly</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{unreadCount} non lette</span>
                  </div>

                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-6">Nessuna notifica in sospeso.</p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 rounded-xl border transition-all text-xs flex items-start gap-3 ${
                            notif.read ? 'bg-slate-900/40 border-slate-800/60 text-slate-400' : 'bg-cyan-950/30 border-cyan-800/60 text-slate-200'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-cyan-500/30 flex-shrink-0 p-1 flex items-center justify-center overflow-hidden">
                            <img src="/unnamed_edited (1).png" alt="Quantaly Logo" className="w-full h-full object-cover rounded-md" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-slate-100">{notif.title}</h4>
                              <span className="text-[10px] text-slate-500">{notif.timestamp}</span>
                            </div>
                            <p className="mt-1 text-slate-300 leading-snug">{notif.body}</p>
                            {!notif.read && (
                              <button
                                onClick={() => onMarkNotificationRead(notif.id)}
                                className="mt-2 text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                              >
                                <CheckCheck className="w-3 h-3" /> Segna come letta
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Dropdown Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all flex items-center gap-1 font-bold text-xs"
              title="Menu Funzioni"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 text-cyan-400" /> : <Menu className="w-4 h-4 text-cyan-400" />}
            </button>

            {/* Profile Avatar / Logout */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
              <div
                onClick={() => setActiveTab('profile')}
                className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md overflow-hidden cursor-pointer"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                ) : (
                  user.displayName.charAt(0).toUpperCase()
                )}
              </div>

              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-all"
                title="Disconnetti"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Mobile Dropdown Collapsible Menu (Menu a tendina) */}
        <div className="md:hidden border-t border-slate-800/80 pt-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800/90 text-xs font-bold text-white flex items-center justify-between transition-all hover:border-cyan-500/40"
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono text-cyan-400">Funzione Attiva:</span>
              <ActiveIcon className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-200">{activeItem.label}</span>
            </div>
            {mobileMenuOpen ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Collapsible Grid Options */}
          {mobileMenuOpen && (
            <div className="mt-2 p-2 rounded-2xl bg-[#080c18] border border-cyan-500/30 shadow-2xl grid grid-cols-2 gap-1.5 animate-in fade-in slide-in-from-top-2">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all text-left ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm font-bold'
                        : 'bg-slate-900/60 text-slate-300 border border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

