"use client";
import { useState, useEffect, useCallback } from "react";

type Estado = "idle" | "loading" | "ok" | "erro";

export default function Kiosk() {
  const [digits, setDigits] = useState("");
  const [estado, setEstado] = useState<Estado>("idle");
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState("");
  const [hora, setHora] = useState("");

  useEffect(() => {
    const tick = () =>
      setHora(new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const confirmar = useCallback(async () => {
    if (!digits || estado === "loading") return;
    setEstado("loading");
    try {
      const res = await fetch("/api/picar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero: digits }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro ?? "Erro desconhecido");
        setEstado("erro");
      } else {
        setNome(data.nome);
        setEstado("ok");
      }
    } catch {
      setErro("Sem ligação ao servidor");
      setEstado("erro");
    } finally {
      setTimeout(() => {
        setDigits("");
        setEstado("idle");
        setNome("");
        setErro("");
      }, 3000);
    }
  }, [digits, estado]);

  const pressKey = (k: string) => {
    if (estado !== "idle") return;
    if (k === "del") setDigits((d) => d.slice(0, -1));
    else if (k === "clear") setDigits("");
    else if (digits.length < 8) setDigits((d) => d + k);
  };

  // Suporte a teclado físico
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") pressKey(e.key);
      else if (e.key === "Backspace") pressKey("del");
      else if (e.key === "Escape") pressKey("clear");
      else if (e.key === "Enter") confirmar();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [digits, estado, confirmar]);

  const keys = ["1","2","3","4","5","6","7","8","9","clear","0","del"];

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 select-none">
      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Picagem de presença</p>
      <p className="text-sm text-gray-400 mb-8 tabular-nums">{hora}</p>

      {/* Ecrã de confirmação OK */}
      {estado === "ok" && (
        <div className="flex flex-col items-center gap-3 animate-in fade-in">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-2xl font-medium text-gray-800">{nome}</p>
          <p className="text-gray-500">Presença registada</p>
        </div>
      )}

      {/* Ecrã de erro */}
      {estado === "erro" && (
        <div className="flex flex-col items-center gap-3 animate-in fade-in">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-xl font-medium text-gray-800">{erro}</p>
        </div>
      )}

      {/* Ecrã principal */}
      {(estado === "idle" || estado === "loading") && (
        <div className="w-full max-w-xs flex flex-col gap-4">
          {/* Display */}
          <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 text-center min-h-[64px] flex items-center justify-center">
            {digits ? (
              <span className="text-3xl font-medium tracking-widest text-gray-800">{digits}</span>
            ) : (
              <span className="text-sm text-gray-400">Introduza o seu número</span>
            )}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2">
            {keys.map((k) => (
              <button
                key={k}
                onClick={() => pressKey(k)}
                className="h-16 rounded-xl bg-white border border-gray-200 text-xl font-medium text-gray-700
                           hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center"
              >
                {k === "del" ? "⌫" : k === "clear" ? "✕" : k}
              </button>
            ))}
          </div>

          {/* Confirmar */}
          <button
            onClick={confirmar}
            disabled={!digits || estado === "loading"}
            className="w-full h-14 rounded-xl bg-blue-600 text-white font-medium text-base
                       hover:bg-blue-700 active:scale-98 transition-all
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {estado === "loading" ? "A registar..." : "Confirmar"}
          </button>
        </div>
      )}

      {/* Link discreto para admin */}
      <a href="/admin" className="absolute bottom-4 right-4 text-xs text-gray-300 hover:text-gray-400">
        admin
      </a>
    </main>
  );
}