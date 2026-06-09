"use client";
import { useState, useEffect } from "react";

type Funcionario = { id: number; numero: string; nome: string; ativo: boolean };
type Picagem = { id: number; timestamp: string; funcionario: { numero: string; nome: string } };

export default function Admin() {
  const [password, setPassword] = useState("");
  const [autenticado, setAutenticado] = useState(false);
  const [tab, setTab] = useState<"funcionarios" | "picagens">("funcionarios");
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [picagens, setPicagens] = useState<Picagem[]>([]);
  const [novoNumero, setNovoNumero] = useState("");
  const [novoNome, setNovoNome] = useState("");
  const [msg, setMsg] = useState("");

  const headers = { "Content-Type": "application/json", "x-admin-password": password };

  const carregar = async () => {
    const [f, p] = await Promise.all([
      fetch("/api/admin/funcionarios", { headers }).then((r) => r.json()),
      fetch("/api/admin/picagens", { headers }).then((r) => r.json()),
    ]);
    if (!f.erro) setFuncionarios(f);
    if (!p.erro) setPicagens(p);
  };

  const login = async () => {
    const res = await fetch("/api/admin/funcionarios", {
      headers: { "x-admin-password": password },
    });
    if (res.ok) { setAutenticado(true); carregar(); }
    else setMsg("Password incorreta");
  };

  const adicionar = async () => {
    if (!novoNumero || !novoNome) return;
    const res = await fetch("/api/admin/funcionarios", {
      method: "POST", headers,
      body: JSON.stringify({ numero: novoNumero, nome: novoNome }),
    });
    if (res.ok) { setNovoNumero(""); setNovoNome(""); carregar(); }
    else { const d = await res.json(); setMsg(d.erro); }
  };

  const desativar = async (id: number) => {
    await fetch(`/api/admin/funcionarios/${id}`, { method: "DELETE", headers });
    carregar();
  };

  if (!autenticado) return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl border border-gray-200 p-8 w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-lg font-medium text-gray-800">Painel de administração</h1>
        <input
          type="password" placeholder="Password"
          value={password} onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && login()}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        {msg && <p className="text-sm text-red-500">{msg}</p>}
        <button onClick={login} className="bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700">
          Entrar
        </button>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-medium text-gray-800">Administração</h1>
          <a href="/" className="text-sm text-gray-400 hover:text-gray-600">← Voltar ao kiosk</a>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["funcionarios","picagens"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              {t === "funcionarios" ? "Funcionários" : "Registos de picagem"}
            </button>
          ))}
        </div>

        {tab === "funcionarios" && (
          <div className="flex flex-col gap-4">
            {/* Adicionar */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm font-medium text-gray-700 mb-3">Adicionar funcionário</p>
              <div className="flex gap-2">
                <input placeholder="Número" value={novoNumero} onChange={(e) => setNovoNumero(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-28 outline-none focus:ring-2 focus:ring-blue-500" />
                <input placeholder="Nome" value={novoNome} onChange={(e) => setNovoNome(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && adicionar()}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 outline-none focus:ring-2 focus:ring-blue-500" />
                <button onClick={adicionar}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                  Adicionar
                </button>
              </div>
              {msg && <p className="text-xs text-red-500 mt-2">{msg}</p>}
            </div>

            {/* Lista */}
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {funcionarios.filter(f => f.ativo).map((f) => (
                <div key={f.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <span className="text-sm font-medium text-gray-800">{f.nome}</span>
                    <span className="ml-2 text-xs text-gray-400">#{f.numero}</span>
                  </div>
                  <button onClick={() => desativar(f.id)}
                    className="text-xs text-red-400 hover:text-red-600">Remover</button>
                </div>
              ))}
              {funcionarios.filter(f => f.ativo).length === 0 && (
                <p className="px-5 py-4 text-sm text-gray-400">Nenhum funcionário ainda.</p>
              )}
            </div>
          </div>
        )}

        {tab === "picagens" && (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {picagens.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <span className="text-sm font-medium text-gray-800">{p.funcionario.nome}</span>
                  <span className="ml-2 text-xs text-gray-400">#{p.funcionario.numero}</span>
                </div>
                <span className="text-xs text-gray-400 tabular-nums">
                  {new Date(p.timestamp).toLocaleString("pt-PT")}
                </span>
              </div>
            ))}
            {picagens.length === 0 && (
              <p className="px-5 py-4 text-sm text-gray-400">Sem registos ainda.</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}