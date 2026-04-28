import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { 
  Clock, 
  User, 
  HardDrive, 
  CheckCircle2, 
  XCircle,
  Activity
} from "lucide-react";
import { cn } from "../lib/utils";
import { useTranslation } from "react-i18next";

export default function RealTimeEvents() {
  const [logs, setLogs] = useState<any[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "accessLogs"),
      orderBy("timestamp", "desc"),
      limit(50)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogs(docs);
    }, (error: any) => {
      if (error.code !== "permission-denied") {
        console.error("Firestore error in RealTimeEvents:", error);
      }
    });
    return () => unsubscribe();
  }, [auth.currentUser]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">{t('monitoring.title')}</h2>
          <p className="text-sm text-slate-500">{t('monitoring.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
          <Activity className="h-3 w-3 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider">{t('monitoring.live_feed')}</span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                <th className="p-4">{t('monitoring.horary')}</th>
                <th className="p-4">{t('monitoring.worker')}</th>
                <th className="p-4">{t('monitoring.device')}</th>
                <th className="p-4">{t('monitoring.door_status')}</th>
                <th className="p-4">{t('monitoring.result')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors group text-slate-700">
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                      <Clock className="h-3 w-3 text-slate-300" />
                      {log.createdAt ? new Date(log.createdAt.seconds * 1000).toLocaleTimeString() : new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center border border-slate-200">
                        <User className="h-4 w-4 text-slate-400" />
                      </div>
                      <div>
                         <p className="text-xs font-bold">PIN: {log.pin}</p>
                         <p className="text-[10px] text-slate-400 uppercase">Empresa {log.contractorId || "Default"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <HardDrive className="h-3.5 w-3.5 text-slate-300" />
                      {log.serialNumber}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-[10px] font-bold text-slate-400">PORTAL 01</div>
                  </td>
                  <td className="p-4">
                    <div className={cn("inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold", 
                      log.type === "VERIFY" ? "bg-green-100 text-green-700" : "bg-red-500 text-white")}>
                      {log.type === "VERIFY" ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {log.type === "VERIFY" ? t('dashboard.granted') : t('dashboard.denied')}
                    </div>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-slate-400 text-sm italic">
                    {t('monitoring.waiting_logs')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
