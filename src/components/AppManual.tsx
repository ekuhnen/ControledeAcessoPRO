import React from "react";
import { 
  Book, 
  UserPlus, 
  ShieldCheck, 
  Cpu, 
  Activity, 
  Users, 
  Settings,
  AlertCircle
} from "lucide-react";
import { motion } from "motion/react";
import Logo from "./Logo";

export default function AppManual() {
  const sections = [
    {
      title: "1. Cadastro Facial de Staff",
      icon: UserPlus,
      color: "text-blue-500",
      content: "Acesse 'Cadastro de Staff' para registrar novos trabalhadores. O sistema utiliza a câmera para capturar a face. Certifique-se de que o ambiente esteja iluminado. Após o cadastro, o status ficará 'PENDENTE'."
    },
    {
      title: "2. Processo de Aprovação",
      icon: ShieldCheck,
      color: "text-emerald-500",
      content: "Em 'Aprovação', os gestores revisam as fotos capturadas. Somente após a aprovação o comando é enviado para os terminais ZKTeco (catracas/portas) para permitir o acesso físico."
    },
    {
      title: "3. Gerenciamento de Dispositivos",
      icon: Cpu,
      color: "text-purple-500",
      content: "Na aba de Dispositivos, você configura as catracas ZKTeco. O sistema monitora se o equipamento está ONLINE ou OFFLINE via WebSocket em tempo real. Se um dispositivo desconectar, um alerta vermelho aparecerá no canto da tela."
    },
    {
      title: "4. Monitoramento em Tempo Real",
      icon: Activity,
      color: "text-orange-500",
      content: "O 'Monitoramento' mostra cada passagem em tempo real. Você verá o nome da pessoa, a foto e o local de acesso. Falhas de autenticação são marcadas visualmente para intervenção imediata."
    },
    {
      title: "5. Fornecedores & Prestadores",
      icon: Users,
      color: "text-indigo-500",
      content: "Gerencie empresas terceirizadas em 'Fornecedores'. Você pode vincular funcionários a empresas específicas para relatórios detalhados de horas trabalhadas por equipe."
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="space-y-6">
          <Logo size="xl" />
          <div className="h-px w-full bg-slate-200" />
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                <Book className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Manual do Operador</h2>
            </div>
            <p className="text-slate-500 font-medium">Guia completo para utilização da plataforma Controle de Acesso PRO.</p>
          </div>
        </header>

        <div className="grid gap-6">
          {sections.map((section, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex gap-6 hover:shadow-md transition-shadow"
            >
              <div className={`h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0`}>
                <section.icon className={`h-6 w-6 ${section.color}`} />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-slate-900">{section.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {section.content}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <section className="bg-blue-900 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-300" />
              <h3 className="font-bold text-lg uppercase tracking-widest text-blue-200 text-sm">Dica de Segurança</h3>
            </div>
            <p className="text-blue-100 leading-relaxed max-w-2xl">
              Sempre verifique o status do dispositivo antes de grandes fluxos (ex: abertura de portões). Dispositivos OFFLINE não recebem novos cadastros até que a conexão seja restabelecida.
            </p>
          </div>
          <div className="absolute -right-20 -bottom-20 h-64 w-64 bg-blue-800 rounded-full blur-3xl opacity-50" />
        </section>

        <footer className="text-center py-8 text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
          Controle de Acesso PRO v1.0.0 • 2024
        </footer>
      </div>
    </div>
  );
}
