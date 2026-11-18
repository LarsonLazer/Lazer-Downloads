'use client';

import React, { useEffect, useState } from 'react';
import { Shield, UserCheck, UserX } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import type { DownloadEvent, Profile } from '@/types/database';

export function UsersManager() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<Profile[]>([]);
  const [events, setEvents] = useState<DownloadEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
        setEvents(data.recentEvents || []);
      }
    } catch {
      showToast('Erro ao carregar utilizadores.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let activeFlag = true;
    fetch('/api/admin/users')
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (activeFlag && ok) {
          setUsers(data.users || []);
          setEvents(data.recentEvents || []);
        }
      })
      .catch(() => {
        if (activeFlag) showToast('Erro ao carregar utilizadores.', 'error');
      })
      .finally(() => {
        if (activeFlag) setLoading(false);
      });
    return () => {
      activeFlag = false;
    };
  }, [showToast]);

  const updateUser = async (id: string, patch: { active?: boolean; role?: 'admin' | 'user' }) => {
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...patch }),
    });
    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || 'Erro ao atualizar utilizador.', 'error');
      return;
    }
    showToast('Utilizador atualizado com sucesso.', 'success');
    await loadData();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
          Gestão de Utilizadores
        </h1>
        <p className="text-sm text-[#A0AAB5] mt-1">
          Consulta utilizadores registados, datas de registo, estados e atividade recente.
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#151B23] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-[#A0AAB5]">A carregar utilizadores...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#A0AAB5]">Nenhum utilizador registado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-[#0B0F14] text-xs text-[#A0AAB5]">
                <tr>
                  <th className="px-4 py-3 font-medium">Utilizador</th>
                  <th className="px-4 py-3 font-medium">Função</th>
                  <th className="px-4 py-3 font-medium">Registo</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{u.display_name || 'Sem nome'}</div>
                      <div className="text-xs text-[#A0AAB5]">{u.email || u.id}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-white">
                      {u.role === 'admin' ? 'Administrador' : 'Utilizador'}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono tabular-nums text-[#A0AAB5]">
                      {new Date(u.created_at).toLocaleDateString('pt-PT')}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className={u.active ? 'text-[#00D084]' : 'text-rose-400'}>
                        {u.active ? 'Ativo' : 'Bloqueado'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => updateUser(u.id, { active: !u.active })}
                          className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-[#0B0F14] px-2.5 py-1.5 text-xs text-white hover:border-[#00D084]"
                        >
                          {u.active ? (
                            <>
                              <UserX className="w-3.5 h-3.5 text-rose-400" />
                              <span>Bloquear</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5 text-[#00D084]" />
                              <span>Ativar</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateUser(u.id, { role: u.role === 'admin' ? 'user' : 'admin' })
                          }
                          className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-[#0B0F14] px-2.5 py-1.5 text-xs text-[#A0AAB5] hover:text-white"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>{u.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <section className="rounded-xl border border-white/10 bg-[#151B23] p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold text-white">Atividades recentes</h2>
        {events.length === 0 ? (
          <p className="text-sm text-[#A0AAB5]">Sem eventos de download registados ainda.</p>
        ) : (
          <div className="divide-y divide-white/10">
            {events.map((ev) => (
              <div key={ev.id} className="py-2.5 flex items-center justify-between text-xs">
                <span className="text-white">
                  {ev.download?.title || 'Download'} ({ev.source})
                </span>
                <span className="font-mono tabular-nums text-[#A0AAB5]">
                  {new Date(ev.created_at).toLocaleString('pt-PT')}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
