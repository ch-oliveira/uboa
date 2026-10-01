'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface CopilotTriggerProps {
  onClick: () => void;
}

export function CopilotTrigger({ onClick }: CopilotTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Consultar Urbi - Inteligência de Zeladoria Municipal (Ctrl+J)"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#0A2540] text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all border border-[#38BDF8]/40 group cursor-pointer print:hidden"
    >
      <div className="w-6 h-6 rounded-full bg-[#38BDF8] text-[#0A2540] flex items-center justify-center font-bold shadow-xs group-hover:rotate-12 transition-transform">
        <Sparkles size={14} />
      </div>
      <div className="flex flex-col text-left">
        <span className="text-xs font-black tracking-tight leading-none text-white">
          Urbi
        </span>
        <span className="text-[9px] font-bold text-[#38BDF8] tracking-wider uppercase mt-0.5">
          Copiloto IA
        </span>
      </div>
      <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[9px] font-mono bg-white/10 text-[#94A3B8] rounded border border-white/10">
        Ctrl+J
      </kbd>
    </button>
  );
}
