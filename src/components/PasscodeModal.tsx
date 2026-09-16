"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRoadmap } from "@/context/RoadmapContext";
import { ShieldCheck, ShieldAlert, KeyRound, X } from "lucide-react";
import { soundFx } from "@/lib/audio";

export const PasscodeModal: React.FC = () => {
  const { isPasscodeModalOpen, setIsPasscodeModalOpen, authenticateCommander } = useRoadmap();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isPasscodeModalOpen) {
        setIsPasscodeModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPasscodeModalOpen, setIsPasscodeModalOpen]);

  if (!isPasscodeModalOpen) return null;

  return (
    <PasscodeModalDialog
      onClose={() => setIsPasscodeModalOpen(false)}
      onAuthenticate={authenticateCommander}
    />
  );
};

interface DialogProps {
  onClose: () => void;
  onAuthenticate: (code: string) => boolean;
}

const PasscodeModalDialog: React.FC<DialogProps> = ({ onClose, onAuthenticate }) => {
  const [passcode, setPasscode] = useState("");
  const [hasError, setHasError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const success = onAuthenticate(passcode);
    if (!success) {
      setHasError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleKeyPress = (num: string) => {
    soundFx.playBlip(750);
    setPasscode((prev) => prev + num);
  };

  const handleBackspace = () => {
    soundFx.playBlip(450);
    setPasscode((prev) => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-md p-6 rounded-xl cyber-card border border-cyan-500/40 shadow-2xl bg-slate-950/95 ${
          shake ? "animate-bounce" : ""
        }`}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-cyan-400">
                Commander Authentication
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                CLEARANCE VERIFICATION PROTOCOL
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions */}
        <div className="mb-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Enter the Commander Master PIN to enable write authorization, persist completed milestones, and edit task telemetry.
          </p>
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              ref={inputRef}
              type="password"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setHasError(false);
              }}
              placeholder="ENTER PASSCODE..."
              className={`w-full px-4 py-3 bg-slate-900/90 border rounded-lg font-mono text-sm tracking-widest text-cyan-300 placeholder:text-slate-600 focus:outline-none transition-all ${
                hasError
                  ? "border-rose-500 shadow-rose-500/30 focus:border-rose-400"
                  : "border-cyan-500/40 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,240,255,0.3)]"
              }`}
            />
          </div>

          {hasError && (
            <div className="flex items-center gap-1.5 text-xs text-rose-400 font-mono">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>ACCESS REJECTED: INVALID CLEARANCE KEY</span>
            </div>
          )}

          {/* Sci-Fi Numeric Quickpad */}
          <div className="grid grid-cols-3 gap-2 pt-2" role="group" aria-label="Numeric PIN entry pad">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                aria-label={`Digit ${num}`}
                className="py-2.5 rounded bg-slate-900/60 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 font-mono text-sm font-bold text-slate-200 hover:text-cyan-300 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleBackspace}
              aria-label="Delete last digit"
              className="py-2.5 rounded bg-slate-900/60 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/40 font-mono text-xs font-semibold text-rose-300 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
            >
              DEL
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress("0")}
              aria-label="Digit 0"
              className="py-2.5 rounded bg-slate-900/60 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 font-mono text-sm font-bold text-slate-200 hover:text-cyan-300 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => {
                soundFx.playBlip(350);
                setPasscode("");
              }}
              aria-label="Clear PIN entry"
              className="py-2.5 rounded bg-slate-900/60 hover:bg-slate-800 border border-slate-800 font-mono text-xs text-slate-400 hover:text-slate-200 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
            >
              CLR
            </button>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-slate-700 bg-slate-900/80 hover:bg-slate-800 font-mono text-xs text-slate-300 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg border border-cyan-400 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-mono text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.2)] focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
            >
              <ShieldCheck className="w-4 h-4" />
              AUTHENTICATE
            </button>
          </div>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>SHORTCUT: CTRL + SHIFT + A</span>
          <span>SECURE LOCAL TOKEN</span>
        </div>
      </div>
    </div>
  );
};
