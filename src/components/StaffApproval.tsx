import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { collection, query, where, onSnapshot, doc, updateDoc, Timestamp } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { 
  Check, 
  X, 
  User, 
  Image as ImageIcon, 
  ShieldCheck, 
  AlertCircle,
  Search,
  Filter
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";
import Logo from "./Logo";

export default function StaffApproval() {
  const { t } = useTranslation();
  const [pendingStaff, setPendingStaff] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEvent, setFilterEvent] = useState("all");

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, "staff"), where("status", "==", "PENDING_APPROVAL"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPendingStaff(docs);
    }, (error: any) => {
      if (error.code !== "permission-denied") {
        console.error("Firestore error in StaffApproval:", error);
      }
    });
    return () => unsubscribe();
  }, [auth.currentUser]);

  const handleAction = async (id: string, approve: boolean) => {
    try {
      await updateDoc(doc(db, "staff", id), {
        status: approve ? "APPROVED" : "REJECTED",
        approvedAt: Timestamp.now(),
        // Em um cenário real, aqui dispararíamos o comando para os dispositivos
      });
    } catch (e) {
      console.error(e);
    }
  };

  const filteredStaff = pendingStaff.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.document.includes(searchTerm)
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-4">
          <Logo size="sm" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">Fila de Aprovação Biométrica</h2>
            <p className="text-sm text-slate-500">Revise identidades e fotos capturadas via portal de auto-atendimento.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:border-blue-500 w-64"
            />
          </div>
          <div className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">
            {pendingStaff.length} Pendentes
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredStaff.map((staff) => (
            <motion.div 
              key={staff.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all"
            >
              <div className="aspect-[3/4] relative bg-slate-100 overflow-hidden group">
                <img src={staff.photoUrl} alt={staff.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-3 left-3 bg-blue-600/80 backdrop-blur-md text-[8px] font-bold text-white px-2 py-1 rounded uppercase tracking-widest">
                   Review Required
                </div>
              </div>
              
              <div className="p-4 space-y-3 flex-1 flex flex-col">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 line-clamp-1">{staff.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <ShieldCheck className="h-3 w-3 text-slate-400" />
                    <span className="text-[10px] font-mono font-bold text-slate-500">{staff.document}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 mt-auto flex gap-2">
                  <button 
                    onClick={() => handleAction(staff.id, false)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-50 text-red-600 text-[10px] font-bold uppercase transition-colors hover:bg-red-100"
                  >
                    <X className="h-3.5 w-3.5" />
                    Reprovar
                  </button>
                  <button 
                    onClick={() => handleAction(staff.id, true)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-600 text-white text-[10px] font-bold uppercase shadow-lg shadow-blue-200 transition-all hover:bg-blue-500"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Aprovar
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredStaff.length === 0 && (
          <div className="col-span-full py-32 text-center">
            <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <ImageIcon className="h-8 w-8 text-slate-200" />
            </div>
            <p className="text-slate-400 text-sm font-medium">Tudo limpo! Nenhuma aprovação pendente.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
