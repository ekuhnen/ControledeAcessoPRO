import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { collection, addDoc, Timestamp, doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { 
  Camera, 
  User, 
  FileText, 
  CheckCircle2, 
  RotateCcw,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Smartphone
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";

export default function StaffRegistration() {
  const { contractorId } = useParams();
  const [contractor, setContractor] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [document, setDocument] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const { t } = useTranslation();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function fetchContractor() {
      if (!contractorId) return;
      const d = await getDoc(doc(db, "contractors", contractorId));
      if (d.exists()) setContractor(d.data());
    }
    fetchContractor();
  }, [contractorId]);

  const startCamera = async () => {
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied", err);
      alert("Não foi possível acessar a câmera.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvasRef.current.toDataURL("image/jpeg", 0.8);
      setImage(dataUrl);
      
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setCameraActive(false);
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/process-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: image?.split(",")[1] })
      });
      const { processedBase64 } = await response.json();

      await addDoc(collection(db, "staff"), {
        contractorId,
        eventId: contractor?.eventId || "unknown",
        tenantId: "default",
        name,
        document,
        pin: document.replace(/\D/g, "").slice(-4),
        photoUrl: image,
        faceTemplate: processedBase64,
        status: "PENDING_APPROVAL",
        createdAt: Timestamp.now()
      });

      setStep(4);
    } catch (e) {
      console.error("Registration error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-6 font-sans text-slate-900">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col pt-8">
        <header className="mb-8 text-center">
          <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">{t('registration.portal_title')}</h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold font-mono">{t('registration.secure_registration')}</p>
        </header>

        <div className="flex-1">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t('registration.full_name')}</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                        <input value={name} onChange={e => setName(e.target.value)} type="text" className="w-full rounded-lg bg-slate-50 border border-slate-200 p-3 pl-12 text-sm focus:outline-none focus:border-blue-500 transition-colors" placeholder="Digite seu nome" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t('registration.document')}</label>
                      <div className="relative">
                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                        <input value={document} onChange={e => setDocument(e.target.value)} type="text" className="w-full rounded-lg bg-slate-50 border border-slate-200 p-3 pl-12 text-sm focus:outline-none focus:border-blue-500 transition-colors" placeholder="000.000.000-00" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 flex gap-3">
                    <AlertTriangle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-blue-700/80 font-medium leading-relaxed uppercase">
                      {t('registration.auth_note')}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setStep(2)}
                  disabled={!name || !document}
                  className="w-full rounded-lg bg-slate-900 py-4 text-sm font-bold text-white shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50 uppercase tracking-widest"
                >
                  {t('registration.continue_photo')}
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="text-center space-y-1 mb-6">
                  <h2 className="text-sm font-bold text-slate-800 uppercase">{t('registration.facial_capture')}</h2>
                  <p className="text-xs text-slate-400">{t('registration.capture_desc')}</p>
                </div>

                <div className="aspect-[3/4] rounded-2xl bg-white border border-slate-200 overflow-hidden relative shadow-lg">
                  {cameraActive ? (
                    <>
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-[70%] aspect-[3/4] border-2 border-white/40 rounded-[3rem] shadow-[0_0_0_9999px_rgba(15,23,42,0.4)]" />
                      </div>
                      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                        <button 
                          onClick={capturePhoto}
                          className="h-16 w-16 rounded-full bg-white flex items-center justify-center border-4 border-slate-200 active:scale-95 transition-transform shadow-2xl"
                        >
                          <div className="h-12 w-12 rounded-full border-2 border-slate-100" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                      <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center">
                        <Camera className="h-8 w-8 text-slate-300" />
                      </div>
                      <button 
                        onClick={startCamera}
                        className="rounded-lg border border-blue-200 bg-blue-50 px-6 py-2 text-blue-600 text-xs font-bold uppercase tracking-widest"
                      >
                        {t('registration.activate_camera')}
                      </button>
                    </div>
                  )}
                </div>

                <canvas ref={canvasRef} className="hidden" />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="aspect-[3/4] rounded-2xl border border-slate-200 bg-white overflow-hidden relative shadow-lg">
                  <img src={image!} alt="Preview" className="w-full h-full object-cover scale-x-[-1] blur-[0.5px]" />
                  <div className="absolute top-4 right-4 h-8 w-8 rounded bg-blue-600 flex items-center justify-center shadow-lg">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex flex-col justify-end p-6">
                     <p className="text-[10px] font-bold text-white uppercase tracking-widest opacity-80">{t('registration.preview_badge')}</p>
                     <p className="text-xs font-bold text-white">{t('registration.ready_sync')}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => { setImage(null); startCamera(); setStep(2); }}
                    className="flex-1 rounded-lg border border-slate-200 bg-white py-4 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors uppercase tracking-widest"
                  >
                    {t('registration.retake')}
                  </button>
                  <button 
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-2 rounded-lg bg-blue-600 py-4 text-xs font-bold text-white shadow-lg hover:bg-blue-500 transition-all flex items-center justify-center uppercase tracking-widest"
                  >
                    {loading ? t('registration.submitting') : t('registration.submit')}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-8 py-12"
              >
                <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center mx-auto shadow-lg shadow-green-200">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold tracking-tight text-slate-800">{t('registration.success_title')}</h2>
                  <p className="text-slate-500 text-xs max-w-[280px] mx-auto uppercase font-medium">{t('registration.success_desc')}</p>
                </div>
                
                <div className="p-6 rounded-xl border border-slate-200 bg-white text-left shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <Smartphone className="h-4 w-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('registration.security_token')}</p>
                      <p className="text-xs font-mono font-bold text-slate-700">{document.slice(-4)}-ADMS-AUTH</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 italic">{t('registration.security_note')}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
