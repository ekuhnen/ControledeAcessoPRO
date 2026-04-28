import React from "react";
import { motion } from "motion/react";
import { 
  Users, 
  HardDrive, 
  Activity, 
  MapPin, 
  ShieldCheck, 
  AlertCircle,
  ArrowUpRight,
  ChevronRight,
  Building,
  Sparkles
} from "lucide-react";
import { cn } from "../lib/utils";
import { useTranslation } from "react-i18next";
import Logo from "./Logo";
import { auth } from "../lib/firebase";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const chartData = [
  { time: '08:00', total: 1200 },
  { time: '10:00', total: 2800 },
  { time: '12:00', total: 3400 },
  { time: '14:00', total: 4200 },
  { time: '16:00', total: 4821 },
  { time: '18:00', total: 4600 },
];

export default function DashboardHome() {
  const { t } = useTranslation();
  const user = auth.currentUser;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-8 space-y-8"
    >
      {!user && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex items-center gap-4 text-amber-800 shadow-sm border-l-4 border-l-amber-500">
          <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <AlertCircle className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold">Acesso Restrito</h3>
            <p className="text-sm opacity-90">Você precisa clicar no botão <strong>Entrar</strong> no topo da página para visualizar os dados reais e gerenciar o sistema.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-8 rounded-3xl text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
         <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Logo size="xl" variant="light" showText={false} className="scale-[3] rotate-[20deg]" />
         </div>
         <div className="relative z-10 space-y-2">
            <Logo size="lg" variant="light" />
            <p className="text-slate-400 text-sm max-w-md mt-4">
              Bem-vindo ao centro de comando. Monitore acessos, gerencie dispositivos e garanta a segurança do seu evento em tempo real.
            </p>
         </div>
         <div className="relative z-10 flex gap-4">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
               <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Status Global</div>
               <div className="text-xl font-bold flex items-center gap-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  PROTEGIDO
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="col-span-full bg-blue-50 border border-blue-100 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-600/20">
              <Building className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-blue-900">Portal do Contratado</h3>
              <p className="text-sm text-blue-700/80">Envie este link para as empresas cadastrarem suas equipes e fotos faciais.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 pl-4 rounded-xl border border-blue-200">
            <span className="text-xs font-mono text-slate-500 truncate max-w-[200px] md:max-w-xs">{window.location.origin}/portal</span>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/portal`);
                alert("Link copiado!");
              }}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500 transition-colors shrink-0"
            >
              Copiar Link
            </button>
          </div>
        </div>

        <StatCard 
          title={t('dashboard.workers_present')} 
          value="4,821" 
          change="+122 in last 10min" 
          icon={Users} 
          positive
        />
        <StatCard 
          title={t('dashboard.access_denied')} 
          value="42" 
          change="Auth failures" 
          icon={AlertCircle} 
          negative
        />
        <StatCard 
          title={t('dashboard.active_devices')} 
          value="18 / 19" 
          change="1 Unit Offline (Gate G4)" 
          icon={HardDrive} 
          warning
        />
        <StatCard 
          title={t('dashboard.pending_approvals')} 
          value="156" 
          change="Review queue" 
          icon={ShieldCheck} 
          info
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            Guia Rápido
          </h3>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 group hover:border-blue-200 transition-colors">
              <p className="text-xs font-bold text-slate-700">Para que serve o botão Entrar?</p>
              <p className="text-[10px] text-slate-500 mt-1">É necessário para autenticar sua sessão e permitir alterações no sistema (cadastro de eventos, aprovações, etc).</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 group hover:border-blue-200 transition-colors">
              <p className="text-xs font-bold text-slate-700">Onde cadastro facial?</p>
              <p className="text-[10px] text-slate-500 mt-1">No **Portal do Contratado**. As empresas recebem o link, cadastram os colaboradores e capturam a foto (face) diretamente pelo celular.</p>
            </div>
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ShieldCheck className="h-24 w-24" />
          </div>
          <h3 className="text-lg font-bold flex items-center gap-2 relative z-10">
            Dica de Segurança
          </h3>
          <p className="text-sm text-slate-400 relative z-10 leading-relaxed">
            Sempre verifique o status dos dispositivos antes de iniciar o evento. Dispositivos OFFLINE não sincronizam novas faces em tempo real.
          </p>
          <div className="pt-2 relative z-10">
            <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors">
              Ver Manual do Sistema
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Visual: Occupancy Timeline */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <div>
                   <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('dashboard.occupancy_flow')}</h3>
                   <p className="text-sm font-bold text-slate-800">{t('dashboard.occupancy_subtitle')}</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg">
                   <Activity className="h-3.5 w-3.5 animate-pulse" />
                   <span className="text-[10px] font-bold uppercase tracking-wider">Live Tracking</span>
                </div>
             </div>
             <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorTotal)" 
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="space-y-4">
          <div className="flex items-center justify-between">
            <SectionHeader title={t('dashboard.live_stream')} subtitle={t('dashboard.biometric_validation')} />
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold uppercase shrink-0">{t('dashboard.live_badge')}</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">{t('dashboard.worker_photo')}</th>
                      <th className="px-4 py-3">{t('dashboard.area_door')}</th>
                      <th className="px-4 py-3">{t('dashboard.time')}</th>
                      <th className="px-4 py-3 text-right">{t('dashboard.result')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { user: "Roberto Silveira", company: "Segurança XPTO", area: "Main Backstage", device: "ProFace-X [SN:9032]", time: "14:22:04", status: "GRANTED" },
                      { user: "Carla Mendes", company: "Production Team", area: "Catering Entrance", device: "SpeedFace [SN:1288]", time: "14:21:58", status: "GRANTED" },
                      { user: "Unknown User", company: "Attempting Access", area: "Artist Dressing Room", device: "FaceDepot [SN:4450]", time: "14:21:40", status: "DENIED" },
                    ].map((log, i) => (
                      <tr key={i} className={cn("hover:bg-slate-50 transition-colors", log.status === "DENIED" && "bg-red-50/30")}>
                        <td className="px-4 py-3 flex items-center gap-3">
                          <div className={cn("w-8 h-8 rounded shrink-0", log.status === "DENIED" ? "bg-red-200 border border-red-300" : "bg-slate-200")} />
                          <div>
                            <div className={cn("text-xs font-bold", log.status === "DENIED" ? "text-red-700" : "text-slate-800")}>{log.user}</div>
                            <div className={cn("text-[10px] uppercase font-medium", log.status === "DENIED" ? "text-red-500" : "text-slate-500")}>{log.company}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs font-medium text-slate-700">{log.area}</div>
                          <div className="text-[10px] text-slate-400">{log.device}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 font-mono">{log.time}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={cn(
                            "text-[10px] px-2 py-1 rounded-full font-bold",
                            log.status === "GRANTED" ? "bg-green-100 text-green-700" : "bg-red-500 text-white"
                          )}>{log.status === "GRANTED" ? t('dashboard.granted') : t('dashboard.denied')}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
          <SectionHeader title={t('dashboard.system_alerts')} subtitle={t('dashboard.health_monitoring')} />
          <div className="rounded-xl bg-slate-900 text-white p-6 shadow-lg shadow-slate-300/20 space-y-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('dashboard.hardware_integrity')}</div>
            
            <div className="space-y-3">
              <AlertItem 
                icon="⚠️" 
                title={t('dashboard.alert_unauthorized')} 
                desc={t('dashboard.alert_unauthorized_desc')} 
                type="error" 
              />
              <AlertItem 
                icon="🔌" 
                title={t('dashboard.alert_offline')} 
                desc={t('dashboard.alert_offline_desc')} 
                type="warning" 
              />
              <AlertItem 
                icon="ℹ️" 
                title={t('dashboard.alert_sync')} 
                desc={t('dashboard.alert_sync_desc')} 
                type="info" 
              />
            </div>

            <button className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-[10px] font-bold transition-all uppercase tracking-widest">
              {t('dashboard.view_audit_logs')}
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">{t('dashboard.occupancy_area')}</h3>
            <div className="space-y-4">
              <ProgressItem label="Production Office" val={84} color="bg-amber-500" />
              <ProgressItem label="VIP Catering" val={42} color="bg-blue-500" />
              <ProgressItem label="Tech Village" val={98} color="bg-red-500" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, change, icon: Icon, positive, negative, warning, info }: any) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</div>
      <div className={cn("text-3xl font-bold tracking-tight", negative ? "text-red-600" : "text-slate-800")}>{value}</div>
      <div className={cn(
        "text-[10px] font-medium mt-1",
        positive ? "text-green-600" : warning ? "text-amber-500 shadow-amber-500/10" : negative ? "text-slate-400" : "text-blue-600"
      )}>
        {change}
      </div>
    </div>
  );
}

function AlertItem({ icon, title, desc, type }: any) {
  const styles = {
    error: "bg-red-500/10 border-red-500/30",
    warning: "bg-amber-500/10 border-amber-500/30",
    info: "bg-blue-500/10 border-blue-500/30",
  };
  return (
    <div className={cn("flex gap-3 p-3 border rounded-lg", styles[type as keyof typeof styles])}>
      <div className="text-lg shrink-0">{icon}</div>
      <div>
        <div className="text-xs font-bold">{title}</div>
        <div className="text-[10px] text-slate-300">{desc}</div>
      </div>
    </div>
  );
}

function ProgressItem({ label, val, color }: any) {
  return (
    <div>
      <div className="flex justify-between text-[10px] font-bold mb-1">
        <span className="text-slate-700">{label}</span>
        <span className="text-slate-400">{val}%</span>
      </div>
      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${val}%` }} />
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }: any) {
  return (
    <div>
      <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{title}</h2>
      <p className="text-xs text-slate-400">{subtitle}</p>
    </div>
  );
}
