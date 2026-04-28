import React from 'react';
import { ShieldCheck, SquareUser, DoorOpen } from 'lucide-react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: 'light' | 'dark' | 'color';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Logo({ className, showText = true, variant = 'color', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-14 h-14"
  };

  const textClasses = {
    sm: "text-xs",
    md: "text-base",
    lg: "text-xl",
    xl: "text-4xl"
  };

  return (
    <div className={cn("flex items-center gap-3 group select-none", className)}>
      <div className="relative">
        <div className={cn(
          "relative flex items-center justify-center rounded-xl transition-all duration-500 group-hover:scale-105",
          sizeClasses[size],
          variant === 'light' ? "bg-white/10" : "bg-blue-600/5 shadow-inner"
        )}>
          <ShieldCheck className={cn(
            "w-[70%] h-[70%] stroke-[2]",
            variant === 'light' ? "text-white" : variant === 'dark' ? "text-slate-900" : "text-blue-600"
          )} />
        </div>
      </div>
      
      {showText && (
        <div className="flex flex-col -space-y-1">
          <span className={cn(
            "font-black tracking-tighter uppercase italic",
            textClasses[size],
            variant === 'light' ? "text-white" : "text-slate-900"
          )}>
            Access <span className="text-blue-600 font-black">PRO</span>
          </span>
          <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase leading-none opacity-60">
            Biometric Intelligence
          </span>
        </div>
      )}
    </div>
  );
}
