import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  MapPin, 
  Shield, 
  Activity, 
  Settings, 
  Plus, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Camera,
  Smartphone,
  LogOut,
  Building,
  HardDrive,
  Home,
  LayoutDashboard,
  ShieldCheck,
  Book
} from "lucide-react";
import { auth, db } from "./lib/firebase";
import { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { cn } from "./lib/utils";
import type { User } from "firebase/auth";
import { useTranslation } from "react-i18next";

// --- Components ---
import Logo from "./components/Logo";
import LandingPage from "./components/LandingPage";
import DashboardHome from "./components/DashboardHome";
import EventManagement from "./components/EventManagement";
import ContractorPortal from "./components/ContractorPortal";
import StaffRegistration from "./components/StaffRegistration";
import DeviceManagement from "./components/DeviceManagement";
import RealTimeEvents from "./components/RealTimeEvents";
import StaffApproval from "./components/StaffApproval";
import AppSettings from "./components/AppSettings";
import AppManual from "./components/AppManual";

import NotificationManager from "./components/NotificationManager";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 font-sans">
        <Logo variant="light" size="xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans selection:bg-blue-500/30">
        <Sidebar user={user} />
        
        <main className="flex-1 flex flex-col overflow-hidden relative">
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between bg-slate-900 px-8 text-white shadow-md">
            <div className="flex items-center gap-4">
              <Logo variant="light" size="md" />
              <div className="h-6 w-px bg-slate-700 hidden sm:block mx-1" />
              <h1 className="text-xl font-bold tracking-tight hidden md:block">
                <span className="text-slate-400 font-normal"><PageTitle /></span>
              </h1>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">{t('common.auth_online')}</span>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg">
                {[
                  { code: 'pt-BR', label: 'BR' },
                  { code: 'en', label: 'EN' },
                  { code: 'es', label: 'ES' }
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={cn(
                      "px-2 py-1 text-[10px] font-bold rounded transition-all",
                      i18n.language.startsWith(lang.code.split('-')[0]) 
                        ? "bg-blue-600 text-white shadow-sm" 
                        : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              {user ? (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-bold">{user.displayName || t('common.producer')}</p>
                    <p className="text-[10px] text-slate-400">{user.email}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold overflow-hidden">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" />
                    ) : (
                      user.displayName?.substring(0, 2).toUpperCase() || "AD"
                    )}
                  </div>
                  <button 
                    onClick={() => signOut(auth)}
                    className="rounded-full p-2 hover:bg-white/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={async () => {
                    try {
                      await signInWithPopup(auth, new GoogleAuthProvider());
                    } catch (error: any) {
                      if (error.code !== "auth/popup-closed-by-user") {
                        console.error("Auth error:", error);
                      }
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-xs font-bold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
                >
                  {t('common.sign_in')}
                </button>
              )}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<DashboardHome />} />
                <Route path="/events" element={<EventManagement />} />
                <Route path="/contractors/:eventId" element={<ContractorPortal />} />
                <Route path="/register/:contractorId" element={<StaffRegistration />} />
                <Route path="/devices" element={<DeviceManagement />} />
                <Route path="/monitoring" element={<RealTimeEvents />} />
                <Route path="/manual" element={<AppManual />} />
                <Route path="/approval" element={<StaffApproval />} />
                <Route path="/settings" element={<AppSettings />} />
              </Routes>
            </AnimatePresence>
            <NotificationManager />
          </div>

          <footer className="h-8 bg-white border-t border-slate-200 px-6 flex items-center justify-between text-[10px] font-medium text-slate-400 shrink-0 uppercase tracking-widest leading-none">
            <div className="flex gap-4 items-center">
              <span className="flex items-center gap-1.5 text-blue-600">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></div>
                {t('common.system_operational')}
              </span>
              <span>|</span>
              <span>{t('common.push_server')}: OK</span>
            </div>
            <div className="hidden sm:block">
              {t('common.region')}: us-east1 • v2.4.0-Polish
            </div>
          </footer>
        </main>
      </div>
    </BrowserRouter>
  );
}

function Sidebar({ user }: { user: User | null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const menuItems = [
    { name: t('common.dashboard'), icon: LayoutDashboard, path: '/' },
    { name: t('common.events'), icon: MapPin, path: '/events' },
    { name: 'Aprovação', icon: ShieldCheck, path: '/approval' },
    { name: t('common.hardware'), icon: HardDrive, path: '/devices' },
    { name: t('common.monitoring'), icon: Activity, path: '/monitoring' },
    { name: 'Manual', icon: Book, path: '/manual' },
    { name: t('common.config'), icon: Settings, path: '/settings' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
       <div className="p-8 pb-4">
          <div className="mb-8">
            <Logo size="lg" />
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">{t('common.management_portal')}</div>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold transition-all",
                  location.pathname === item.path 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </button>
            ))}
          </nav>
       </div>

       <div className="mt-auto p-8 pt-0">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 italic">
             <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
               {t('common.security_note')}
             </p>
          </div>
       </div>
    </aside>
  );
}

function PageTitle() {
  const location = useLocation();
  const { t } = useTranslation();
  const titles: Record<string, string> = {
    "/": t('common.dashboard'),
    "/events": t('common.events'),
    "/devices": t('common.hardware'),
    "/monitoring": t('common.monitoring'),
    "/manual": "Manual de Uso",
    "/contractors": t('contractors.title'),
  };
  
  const title = titles[location.pathname] || "Dashboard";
  return <span>{title}</span>;
}

export default App;
