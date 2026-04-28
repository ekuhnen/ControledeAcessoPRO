import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { io } from "socket.io-client";
import { AlertCircle, X, HardDrive, Bell } from "lucide-react";
import { useTranslation } from "react-i18next";

const socket = io();

interface Notification {
  id: string;
  type: "DEVICE_OFFLINE" | "ALERT";
  title: string;
  message: string;
  timestamp: string;
}

export default function NotificationManager() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    socket.on("deviceOffline", (data: { SN: string; name: string; timestamp: string }) => {
      const newNotification: Notification = {
        id: Math.random().toString(36).substring(7),
        type: "DEVICE_OFFLINE",
        title: "Dispositivo Offline",
        message: `${data.name || data.SN} parou de responder ao servidor.`,
        timestamp: data.timestamp
      };
      setNotifications(prev => [newNotification, ...prev]);
      
      // Auto-remove after 10 seconds
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, 10000);
    });

    return () => {
      socket.off("deviceOffline");
    };
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-3 max-w-sm w-full">
      <AnimatePresence mode="popLayout">
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700/50 flex gap-4 relative overflow-hidden group"
          >
            {/* Progress Bar */}
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 10, ease: "linear" }}
              className="absolute bottom-0 left-0 h-0.5 bg-red-500"
            />
            
            <div className="h-10 w-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
              <HardDrive className="h-5 w-5 text-red-500" />
            </div>
            
            <div className="flex-1 space-y-1 pr-6">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold uppercase tracking-widest text-red-500">Alerta Crítico</h4>
                <div className="h-1 w-1 rounded-full bg-red-500 animate-pulse" />
              </div>
              <p className="text-sm font-bold">{n.title}</p>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                {n.message}
              </p>
            </div>

            <button 
              onClick={() => removeNotification(n.id)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
