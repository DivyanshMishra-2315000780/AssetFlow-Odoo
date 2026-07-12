import React from "react";
import { X } from "lucide-react";

interface MockModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function MockModal({ isOpen, onClose, title, children }: MockModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border-2 border-border rounded-[24px] shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-5 border-b-2 border-border bg-secondary/20">
          <h3 className="font-black text-lg">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-white rounded-full transition-colors border-2 border-transparent hover:border-border">
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
