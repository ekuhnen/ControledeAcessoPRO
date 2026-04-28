import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { collection, query, onSnapshot, addDoc, Timestamp, getDocs, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { deviceService } from "../services/deviceService";
import { 
  HardDrive, 
  Plus, 
  RefreshCcw, 
  DoorOpen, 
  Activity
} from "lucide-react";
import { cn } from "../lib/utils";
import { useTranslation } from "react-i18next";

export default function DeviceManagement() {
  const [devices, setDevices] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const q = query(collection(db, "devices"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDevices(docs);
    });
    return () => unsubscribe();
  }, []);

  const handleSync = async (deviceId: string) => {
    setSyncing(deviceId);
    try {
      const q = query(collection(db, "staff"), where("status", "==", "APPROVED"));
      const snapshot = await getDocs(q);
      
      for (const staffDoc of snapshot.docs) {
        const staff = staffDoc.data();
        await deviceService.updateUser(deviceId, {
          pin: staff.pin,
          name: staff.name,
          privilege: 0
        });
        await deviceService.authorizeUser(deviceId, staff.pin);
        await deviceService.updateFace(deviceId, staff.pin, staff.faceTemplate);
      }
      alert(`Sincronização iniciada para ${snapshot.size} usuários.`);
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(null);
    }
  };

  const handleOpenDoor = async (deviceId: string) => {
    await deviceService.openDoor(deviceId);
    alert("Comando de abertura enviado.");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">{t('devices.title')}</h2>
          <p className="text-sm text-slate-500">{t('devices.subtitle')}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-blue-500 transition-all">
          <Plus className="h-4 w-4" />
          {t('devices.register_hardware')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {devices.map((device) => (
          <div key={device.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden hover:shadow-md transition-all group">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                  <HardDrive className="h-6 w-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">{device.name}</h3>
                  <p className="text-[10px] font-mono text-slate-400">{device.serialNumber}</p>
                </div>
              </div>
              <div className={cn("px-2 px-1.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5", 
                device.status === "ONLINE" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400")}>
                <div className={cn("h-1.5 w-1.5 rounded-full", device.status === "ONLINE" ? "bg-green-500 animate-pulse" : "bg-slate-300")} />
                {device.status === "ONLINE" ? t('devices.online') : t('devices.offline')}
              </div>
            </div>

            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('devices.push_version')}</p>
                <p className="text-xs font-mono font-bold text-slate-700">{device.pushVersion || "v2.0"}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('devices.last_ping')}</p>
                <p className="text-xs font-bold text-slate-700">{device.lastPing ? new Date(device.lastPing.seconds * 1000).toLocaleTimeString() : "N/A"}</p>
              </div>
            </div>

            <div className="p-6 pt-0 flex gap-2">
              <button 
                onClick={() => handleSync(device.id)}
                disabled={syncing === device.id}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-white border border-slate-200 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <RefreshCcw className={cn("h-3.5 w-3.5", syncing === device.id && "animate-spin")} />
                {t('devices.sync')}
              </button>
              <button 
                onClick={() => handleOpenDoor(device.id)}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 py-2.5 text-[10px] font-bold uppercase tracking-wider hover:bg-blue-100 transition-all"
              >
                <DoorOpen className="h-3.5 w-3.5" />
                {t('devices.open_door')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <RegisterDeviceModal onClose={() => setShowModal(false)} />
      )}
    </motion.div>
  );
}

function RegisterDeviceModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [sn, setSn] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "devices"), {
        name,
        serialNumber: sn,
        tenantId: "default",
        status: "OFFLINE",
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
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm rounded-2xl bg-white border border-slate-200 p-8 shadow-2xl">
        <h3 className="text-lg font-bold text-slate-800 mb-6">{t('devices.register_title')}</h3>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t('devices.friendly_name')}</label>
            <input required value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Ex: Portão Staff A1" className="w-full rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t('devices.serial_number')}</label>
            <input required value={sn} onChange={e => setSn(e.target.value)} type="text" placeholder="Encontrado no menu do dispositivo" className="w-full rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
          </div>
          <div className="flex gap-3 pt-6">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-xs font-bold text-slate-400 hover:bg-slate-50 transition-colors">{t('events.cancel')}</button>
            <button disabled={loading} type="submit" className="flex-2 rounded-lg bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-all">{loading ? "..." : t('devices.register')}</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
