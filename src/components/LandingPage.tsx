import React from "react";
import { motion } from "motion/react";
import { 
  ShieldCheck, 
  Users, 
  Clock, 
  Smartphone, 
  ChevronRight,
  Fingerprint,
  FileCheck,
  Zap
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Logo from "./Logo";
import { auth } from "../lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function LandingPage() {
  const { t } = useTranslation();

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") {
        console.log("Login popup closed by user");
      } else {
        console.error("Auth error:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 text-slate-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo size="lg" />
          <button 
            onClick={handleSignIn}
            className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
          >
            {t('common.sign_in')}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-slate-900 text-white text-[10px] font-black tracking-[0.3em] uppercase"
          >
            <Zap className="h-3 w-3 text-blue-400 fill-blue-400" />
            Empowering Event Security
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter text-slate-950 max-w-5xl mx-auto leading-[0.9] italic"
          >
            SISTEMA DE ACESSO <span className="text-blue-600">PRO</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed"
          >
            A plataforma definitiva para controle biométrico facial, gestão de staff e segurança integrada para grandes eventos.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={handleSignIn}
              className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-blue-600 text-white font-black text-lg hover:bg-blue-500 transition-all shadow-2xl shadow-blue-600/20 flex items-center justify-center gap-3 group active:scale-95"
            >
              ACESSAR PAINEL PRO
              <ShieldCheck className="h-6 w-6 group-hover:rotate-12 transition-transform" />
            </button>
            <a href="#features" className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-black text-lg hover:bg-slate-50 transition-all text-center active:scale-95">
              CONHECER RECURSOS
            </a>
          </motion.div>
        </div>
      </section>

      {/* Stats/Social Proof */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-[100px] -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full blur-[100px] -ml-48 -mb-48" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
          <div className="space-y-2">
            <div className="text-4xl md:text-5xl font-black text-blue-400">0.3s</div>
            <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Face Match Speed</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl md:text-5xl font-black text-blue-400">99.9%</div>
            <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Precision rate</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl md:text-5xl font-black text-blue-400">&lt; 1%</div>
            <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">False Reject</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl md:text-5xl font-black text-blue-400">ADMS</div>
            <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Native Protocol</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black text-slate-950">Potencialize sua Operação</h2>
            <p className="text-slate-500 font-medium text-lg">Soluções integradas do planejamento ao pós-evento.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Fingerprint className="h-8 w-8 text-blue-600" />}
              title="Reconhecimento Facial"
              description="Algoritmos de alta precisão para identificação instantânea de staff e prestadores."
            />
            <FeatureCard 
              icon={<Users className="h-8 w-8 text-blue-600" />}
              title="Portal do Contratado"
              description="Auto-atendimento para empresas cadastrarem suas equipes e enviarem documentos."
            />
            <FeatureCard 
              icon={<Zap className="h-8 w-8 text-blue-600" />}
              title="Gestão de Checkpoints"
              description="Controle múltiplos pontos de entrada e saída com sincronização em tempo real."
            />
            <FeatureCard 
              icon={<FileCheck className="h-8 w-8 text-blue-600" />}
              title="Relatórios Detalhados"
              description="Acompanhe a produtividade e o fluxo de pessoas com dashboards intuitivos."
            />
            <FeatureCard 
              icon={<Smartphone className="h-8 w-8 text-blue-600" />}
              title="App do Operador"
              description="Interface otimizada para tablets e coletores de dados em campo."
            />
            <FeatureCard 
              icon={<Clock className="h-8 w-8 text-blue-600" />}
              title="Controle de Escala"
              description="Validação automática de horários e turnos para evitar acessos indevidos."
            />
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-32 px-6 bg-blue-600 text-white text-center">
        <div className="max-w-4xl mx-auto space-y-10">
          <h2 className="text-5xl md:text-6xl font-black tracking-tight leading-tight">Pronto para transformar seu evento?</h2>
          <p className="text-xl text-blue-100 font-medium">Junte-se às maiores produtoras que já confiam no Controle de Acesso PRO.</p>
          <button 
            onClick={handleSignIn}
            className="px-12 py-6 rounded-2xl bg-white text-blue-600 font-black text-xl hover:bg-blue-50 transition-all shadow-2xl shadow-black/20"
          >
            Entrar no Sistema
          </button>
        </div>
      </section>

      <footer className="py-12 border-t border-slate-200 text-center text-slate-400 text-xs font-bold uppercase tracking-widest bg-white">
        © {new Date().getFullYear()} Controle de Acesso PRO • Todos os direitos reservados
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all group">
      <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed">{description}</p>
    </div>
  );
}
