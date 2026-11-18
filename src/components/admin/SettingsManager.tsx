'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Save, ShieldAlert, Upload } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import type { ReportItem, SiteSettings } from '@/types/database';

export function SettingsManager({ initialSettings }: { initialSettings: SiteSettings }) {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [saving, setSaving] = useState(false);

  const loadReports = async () => {
    try {
      const res = await fetch('/api/admin/reports');
      const data = await res.json();
      if (res.ok) setReports(data.reports || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    let activeFlag = true;
    fetch('/api/admin/reports')
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (activeFlag && ok) setReports(data.reports || []);
      })
      .catch(() => {});
    return () => {
      activeFlag = false;
    };
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('bucket', 'branding');
    fd.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || 'Erro ao carregar logótipo.', 'error');
      return;
    }
    if (data.publicUrl) {
      setSettings((prev) => ({ ...prev, logo_url: data.publicUrl }));
    }
    showToast('Logótipo carregado no bucket branding.', 'success');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Erro ao guardar configurações.', 'error');
        return;
      }
      setSettings(data.settings);
      showToast('Configurações guardadas com sucesso.', 'success');
    } catch {
      showToast('Erro de ligação.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReportStatus = async (
    id: string,
    status: 'resolved' | 'dismissed',
    unpublishDownload = false
  ) => {
    const res = await fetch('/api/admin/reports', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, unpublishDownload }),
    });
    if (res.ok) {
      showToast(
        unpublishDownload ? 'Conteúdo arquivado e denúncia resolvida.' : 'Estado da denúncia atualizado.',
        'success'
      );
      await loadReports();
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
          Configurações Gerais e Moderação
        </h1>
        <p className="text-sm text-[#A0AAB5] mt-1">
          Personaliza identidade, SEO, analytics, publicidade, avisos de segurança e gere denúncias.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="rounded-2xl border border-white/10 bg-[#151B23] p-6 space-y-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#A0AAB5]">Nome do site</label>
            <input
              type="text"
              value={settings.site_name}
              onChange={(e) => setSettings((prev) => ({ ...prev, site_name: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm text-white focus:border-[#00D084] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#A0AAB5]">Empresa</label>
            <input
              type="text"
              value={settings.company_name}
              onChange={(e) => setSettings((prev) => ({ ...prev, company_name: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm text-white focus:border-[#00D084] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#A0AAB5]">Slogan</label>
            <input
              type="text"
              value={settings.slogan}
              onChange={(e) => setSettings((prev) => ({ ...prev, slogan: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm text-white focus:border-[#00D084] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#A0AAB5]">Email de contacto</label>
            <input
              type="email"
              value={settings.contact_email}
              onChange={(e) => setSettings((prev) => ({ ...prev, contact_email: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm text-white focus:border-[#00D084] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#A0AAB5]">
              Google Tag / Analytics ID (ex: GTM-5GPTFGQV ou G-XXXXXXXXXX)
            </label>
            <input
              type="text"
              value={settings.ga_measurement_id}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, ga_measurement_id: e.target.value }))
              }
              className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm font-mono text-white focus:border-[#00D084] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#A0AAB5]">
              Google AdSense Client (ex: ca-pub-XXXXXXXX)
            </label>
            <input
              type="text"
              value={settings.adsense_client_id}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, adsense_client_id: e.target.value }))
              }
              className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm font-mono text-white focus:border-[#00D084] focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-[#A0AAB5]">Logótipo (URL ou upload)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={settings.logo_url}
              onChange={(e) => setSettings((prev) => ({ ...prev, logo_url: e.target.value }))}
              className="flex-1 rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2 text-sm text-white focus:border-[#00D084] focus:outline-none"
            />
            <label className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0B0F14] px-3 py-2 text-xs text-white cursor-pointer hover:border-[#00D084]">
              <Upload className="w-3.5 h-3.5 text-[#00D084]" />
              <span>Enviar</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-[#A0AAB5]">Descrição SEO principal</label>
          <textarea
            rows={2}
            value={settings.description}
            onChange={(e) => setSettings((prev) => ({ ...prev, description: e.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm text-white focus:border-[#00D084] focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-[#A0AAB5]">
            Aviso de segurança padrão nos downloads
          </label>
          <textarea
            rows={2}
            value={settings.security_notice}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, security_notice: e.target.value }))
            }
            className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm text-white focus:border-[#00D084] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-[#00D084] px-5 py-2.5 text-sm font-semibold text-[#0B0F14] hover:bg-[#00B874]"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Guardar configurações</span>
        </button>
      </form>

      {/* Moderation / Reports Queue */}
      <section className="rounded-2xl border border-white/10 bg-[#151B23] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <h2 className="font-display text-lg font-semibold text-white">
            Denúncias e Pedidos de Remoção ({reports.length})
          </h2>
        </div>

        {reports.length === 0 ? (
          <p className="text-sm text-[#A0AAB5]">Sem denúncias registadas.</p>
        ) : (
          <div className="divide-y divide-white/10">
            {reports.map((r) => (
              <div key={r.id} className="py-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-white">{r.reason}</span>
                  <span className="font-mono text-[#A0AAB5]">
                    {r.status} · {new Date(r.created_at).toLocaleDateString('pt-PT')}
                  </span>
                </div>
                <p className="text-sm text-[#A0AAB5]">{r.description}</p>
                <p className="text-xs text-[#A0AAB5]">
                  Submetido por: <span className="text-white">{r.email}</span>
                  {r.download ? ` · Conteúdo: ${r.download.title}` : ''}
                </p>
                {r.status === 'pending' && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {r.download_id && (
                      <button
                        type="button"
                        onClick={() => handleReportStatus(r.id, 'resolved', true)}
                        className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Remover conteúdo e resolver
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleReportStatus(r.id, 'resolved', false)}
                      className="rounded-md border border-[#00D084]/40 px-3 py-1.5 text-xs text-[#00D084]"
                    >
                      Marcar resolvido
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReportStatus(r.id, 'dismissed', false)}
                      className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-[#A0AAB5]"
                    >
                      Arquivar denúncia
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
