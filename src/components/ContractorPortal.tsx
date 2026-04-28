import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { collection, query, where, onSnapshot, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { 
  Building, 
  Plus, 
  Users, 
  Share2, 
  Check,
  ChevronLeft,
  Link2,
  Trash2
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ContractorPortal() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [contractors, setContractors] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!eventId) return;
    const q = query(collection(db, "contractors"), where("eventId", "==", eventId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setContractors(docs);
    });
    return () => unsubscribe();
  }, [eventId]);

  const copyLink = (contractorId: string) => {
    const link = `${window.location.origin}/register/${contractorId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(contractorId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 space-y-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/events')} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">{t('contractors.title')}</h2>
            <p className="text-sm text-slate-500">{t('contractors.subtitle')}</p>
          </div>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-blue-500 transition-all"
        >
          <Plus className="h-4 w-4" />
          {t('contractors.invite')}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {contractors.map((c) => (
          <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-all">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="h-12 w-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                <Building className="h-6 w-6 text-slate-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800 uppercase tracking-tight">{c.name}</h3>
                <p className="text-xs text-slate-400">{t('contractors.tax_id')}: {c.taxId}</p>
              </div>
            </div>

            <div className="flex items-center gap-12 w-full md:w-auto">
              <div className="text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('contractors.status_flow')}</p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">{c.status}</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('contractors.capacity')}</p>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  <span>0 / {c.allowedStaffCount}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => copyLink(c.id)}
                  className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-blue-100 transition-all"
                >
                  {copiedId === c.id ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
                  {copiedId === c.id ? t('contractors.link_copied') : t('contractors.copy_link')}
                </button>
              </div>
            </div>
          </div>
        ))}
        {contractors.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white/50 text-slate-400 italic font-medium w-full">
            {t('contractors.no_contractors')}
          </div>
        )}
      </div>

      {showModal && (
        <AddContractorModal eventId={eventId!} onClose={() => setShowModal(false)} />
      )}
    </motion.div>
  );
}

function AddContractorModal({ eventId, onClose }: any) {
  const [name, setName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [limit, setLimit] = useState("50");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "contractors"), {
        eventId,
        name,
        taxId,
        allowedStaffCount: parseInt(limit),
        status: "APPROVED",
        createdAt: Timestamp.now()
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm rounded-2xl bg-white border border-slate-200 p-8 shadow-2xl"
      >
        <h3 className="text-lg font-bold text-slate-800 mb-6">{t('contractors.modal_title')}</h3>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t('contractors.company_name')}</label>
            <input required value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Ex: Segurança XPTO" className="w-full rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t('contractors.tax_id')}</label>
            <input required value={taxId} onChange={e => setTaxId(e.target.value)} type="text" placeholder="00.000.000/0001-00" className="w-full rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t('contractors.staff_limit')}</label>
            <input required value={limit} onChange={e => setLimit(e.target.value)} type="number" className="w-full rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
          </div>
          
          <div className="flex gap-3 pt-6">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-xs font-bold text-slate-400 hover:bg-slate-50 transition-colors">{t('events.cancel')}</button>
            <button disabled={loading} type="submit" className="flex-2 rounded-lg bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-all">{loading ? t('contractors.syncing') : t('contractors.send_invite')}</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
