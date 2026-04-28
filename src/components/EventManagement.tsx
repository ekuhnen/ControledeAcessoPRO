import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { collection, query, onSnapshot, addDoc, Timestamp } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { 
  Plus, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  Users, 
  Building 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function EventManagement() {
  const [events, setEvents] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, "events"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(docs);
    }, (error: any) => {
      if (error.code !== "permission-denied") {
        console.error("Firestore error in EventManagement:", error);
      }
    });
    return () => unsubscribe();
  }, [auth.currentUser]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">{t('events.title')}</h2>
          <p className="text-sm text-slate-500">{t('events.subtitle')}</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-blue-500 transition-all"
        >
          <Plus className="h-4 w-4" />
          {t('events.new_event')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard key={event.id} event={event} onManage={() => navigate(`/contractors/${event.id}`)} />
        ))}
        {events.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white/50">
            <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-sm text-slate-400 font-medium">{t('events.no_events')}</p>
          </div>
        )}
      </div>

      {showModal && (
        <CreateEventModal onClose={() => setShowModal(false)} />
      )}
    </motion.div>
  );
}

function EventCard({ event, onManage }: any) {
  const { t } = useTranslation();
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all">
      <div className="h-32 bg-slate-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
        <div className="absolute bottom-4 left-6">
          <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full mb-1 inline-block uppercase tracking-wider border border-blue-100">
            {event.status}
          </span>
          <h3 className="text-lg font-bold text-slate-900 leading-tight">{event.name}</h3>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>Set 15 - Set 22, 2026</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Building className="h-4 w-4 text-slate-400" />
            <span>{t('events.vendor_management')}</span>
          </div>
        </div>
        
        <button 
          onClick={onManage}
          className="w-full flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <span>{t('events.manage_vendors')}</span>
          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform text-slate-400" />
        </button>
      </div>
    </div>
  );
}

function CreateEventModal({ onClose }: any) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { t } = useTranslation();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await addDoc(collection(db, "events"), {
        name,
        status: "PREPARING",
        tenantId: "default",
        createdAt: Timestamp.now()
      });
      onClose();
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes("permission")) {
        setError("Erro: Você precisa estar logado (clique em Entrar) para cadastrar eventos.");
      } else {
        setError("Erro ao salvar o evento. Verifique sua conexão.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-8 shadow-2xl"
      >
        <h3 className="text-xl font-bold mb-6 text-slate-800">{t('events.create_title')}</h3>
        
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-xs font-bold border border-red-100 italic">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">{t('events.event_name')}</label>
            <input 
              required 
              value={name} 
              onChange={e => setName(e.target.value)} 
              type="text" 
              placeholder="Ex: Rock in Rio 2026" 
              className="w-full rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm focus:outline-none focus:border-blue-500 transition-colors" 
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">{t('events.cancel')}</button>
            <button disabled={loading} type="submit" className="flex-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-200">{loading ? t('events.saving') : t('events.save')}</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
