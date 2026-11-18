'use client';

import React, { useState } from 'react';
import { Flag, Loader2 } from 'lucide-react';
import { useToast } from './ToastProvider';

const REPORT_REASONS = [
  'Violação de direitos de autor (Copyright / DMCA)',
  'Link quebrado ou ficheiro corrompido',
  'Suspeita de malware ou ficheiro inseguro',
  'Informação incorreta ou enganosa',
  'Outro motivo',
];

export function ReportForm({
  downloadId,
  downloadTitle,
}: {
  downloadId?: string | null;
  downloadTitle?: string | null;
}) {
  const { showToast } = useToast();
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          download_id: downloadId || null,
          reason,
          description: downloadTitle
            ? `[Conteúdo: ${downloadTitle}] ${description}`
            : description,
          email,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Erro ao enviar denúncia.', 'error');
        return;
      }
      setSubmitted(true);
      setDescription('');
      showToast('Denúncia registada. A nossa equipa irá rever o conteúdo.', 'success');
    } catch {
      showToast('Erro de ligação ao enviar denúncia.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-[#151B23] p-6 sm:p-8 space-y-5"
    >
      {downloadTitle && (
        <div className="rounded-lg border border-white/10 bg-[#0B0F14] p-3.5 text-sm">
          <span className="text-[#A0AAB5]">Conteúdo reportado: </span>
          <span className="font-semibold text-white">{downloadTitle}</span>
        </div>
      )}

      {submitted && (
        <div className="rounded-lg border border-[#00D084]/40 bg-[#0B0F14] p-4 text-sm text-[#00D084]">
          O teu reporte foi registado com sucesso e será avaliado pela administração.
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="report-reason" className="block text-xs font-medium text-[#A0AAB5]">
          Motivo da denúncia
        </label>
        <select
          id="report-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm text-white focus:border-[#00D084] focus:outline-none"
        >
          {REPORT_REASONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="report-email" className="block text-xs font-medium text-[#A0AAB5]">
          Email de contacto
        </label>
        <input
          id="report-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nome@exemplo.com"
          className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm text-white placeholder-[#A0AAB5]/60 focus:border-[#00D084] focus:outline-none"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="report-description" className="block text-xs font-medium text-[#A0AAB5]">
          Descrição detalhada
        </label>
        <textarea
          id="report-description"
          rows={5}
          required
          minLength={10}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Explica o problema encontrado ou apresenta provas de titularidade caso seja um pedido de remoção..."
          className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm text-white placeholder-[#A0AAB5]/60 focus:border-[#00D084] focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#00D084] px-6 py-3 text-sm font-semibold text-[#0B0F14] hover:bg-[#00B874] disabled:opacity-60 transition-colors"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />}
        <span>{loading ? 'A enviar...' : 'Submeter denúncia'}</span>
      </button>
    </form>
  );
}
