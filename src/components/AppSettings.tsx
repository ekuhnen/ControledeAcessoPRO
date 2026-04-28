import React from "react";
import { motion } from "motion/react";
import { 
  Settings as SettingsIcon, 
  Globe, 
  Shield, 
  Database, 
  Cloud, 
  Smartphone,
  Save,
  Bell,
  Lock
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";

export default function AppSettings() {
  const { t, i18n } = useTranslation();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 max-w-4xl mx-auto space-y-8">
      <header>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">{t('common.config')}</h2>
        <p className="text-sm text-slate-500">Parâmetros globais do sistema e integração ADMS.</p>
      </header>

      <div className="space-y-6">
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
            <Globe className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-800">Regional & Idioma</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Idioma do Sistema</label>
               <div className="flex gap-2">
                 {['pt-BR', 'en', 'es'].map((lang) => (
                   <button 
                     key={lang}
                     onClick={() => i18n.changeLanguage(lang)}
                     className={cn(
                       "flex-1 py-3 rounded-xl border text-xs font-bold transition-all",
                       i18n.language.startsWith(lang) 
                        ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200" 
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                     )}
                   >
                     {lang === 'pt-BR' ? 'Português' : lang === 'en' ? 'English' : 'Español'}
                   </button>
                 ))}
               </div>
            </div>
            <div className="space-y-4">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Timezone</label>
               <select className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-sm focus:outline-none focus:border-blue-500 transition-colors">
                  <option>America/Sao_Paulo (GMT-3)</option>
                  <option>Europe/London (GMT+0)</option>
                  <option>America/New_York (GMT-5)</option>
               </select>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
            <Shield className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-800">Protocolo PUSH (ADMS)</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Ping Interval (s)</label>
                <input type="number" defaultValue={30} className="w-full rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Trans Log Interval (s)</label>
                <input type="number" defaultValue={10} className="w-full rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Photo Upload</label>
                <div className="flex h-11 items-center gap-3">
                  <input type="checkbox" defaultChecked className="h-4 w-4 accent-blue-600" />
                  <span className="text-xs font-medium text-slate-600">Habilitar envio de fotos</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
            <Bell className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-800">Notificações Real-Time</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
               <div>
                 <p className="text-xs font-bold text-slate-800">Alertas de Hardware</p>
                 <p className="text-[10px] text-slate-500">Testar o fluxo de WebSocket para dispositivos offline.</p>
               </div>
               <button 
                 onClick={async () => {
                   await fetch('/api/simulate/offline', { 
                     method: 'POST', 
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({ name: "Terminal Gate 05", SN: "ZK-TEST-99" })
                   });
                 }}
                 className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors uppercase tracking-widest shadow-sm"
               >
                 Disparar Alerta Teste
               </button>
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <button className="px-6 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-widest">
            Resetar Padrões
          </button>
          <button className="px-8 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xl hover:bg-slate-800 transition-all uppercase tracking-widest flex items-center gap-2">
            <Save className="h-4 w-4" />
            Salvar Alterações
          </button>
        </div>
      </div>
    </motion.div>
  );
}
