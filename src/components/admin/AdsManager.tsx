'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import type { AdPosition, Advertisement } from '@/types/database';

const POSITIONS: { value: AdPosition; label: string }[] = [
  { value: 'header_banner', label: 'Banner superior' },
  { value: 'in_feed', label: 'Publicidade entre conteúdos' },
  { value: 'sidebar_desktop', label: 'Banner lateral desktop' },
  { value: 'footer_banner', label: 'Banner no rodapé' },
];

export function AdsManager() {
  const { showToast } = useToast();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [position, setPosition] = useState<AdPosition>('header_banner');
  const [code, setCode] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [destinationUrl, setDestinationUrl] = useState('');
  const [active, setActive] = useState(true);

  const loadAds = async () => {
    try {
      const res = await fetch('/api/admin/ads');
      const data = await res.json();
      if (res.ok) setAds(data.ads || []);
    } catch {
      showToast('Erro ao carregar anúncios.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let activeFlag = true;
    fetch('/api/admin/ads')
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (activeFlag && ok) setAds(data.ads || []);
      })
      .catch(() => {
        if (activeFlag) showToast('Erro ao carregar anúncios.', 'error');
      })
      .finally(() => {
        if (activeFlag) setLoading(false);
      });
    return () => {
      activeFlag = false;
    };
  }, [showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          position,
          code: code || null,
          image_url: imageUrl || null,
          destination_url: destinationUrl || null,
          active,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Erro ao guardar anúncio.', 'error');
        return;
      }
      setName('');
      setCode('');
      setImageUrl('');
      setDestinationUrl('');
      showToast('Espaço publicitário criado.', 'success');
      await loadAds();
    } catch {
      showToast('Erro de ligação.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (ad: Advertisement) => {
    const res = await fetch(`/api/admin/ads/${encodeURIComponent(ad.id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !ad.active }),
    });
    if (res.ok) {
      showToast(ad.active ? 'Anúncio desativado.' : 'Anúncio ativado.', 'success');
      await loadAds();
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/ads/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Anúncio eliminado.', 'success');
      await loadAds();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
          Gestão de Publicidade
        </h1>
        <p className="text-sm text-[#A0AAB5] mt-1">
          Configura banners personalizados ou slots validados do Google AdSense sem scripts inseguros.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-white/10 bg-[#151B23] p-6 space-y-4"
      >
        <h2 className="font-display text-lg font-semibold text-white">Novo espaço publicitário</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#A0AAB5]">Nome da campanha *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Parceiro Principal"
              className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm text-white focus:border-[#00D084] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#A0AAB5]">Posição</label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value as AdPosition)}
              className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm text-white focus:border-[#00D084] focus:outline-none"
            >
              {POSITIONS.map((pos) => (
                <option key={pos.value} value={pos.value}>
                  {pos.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#A0AAB5]">
              Slot Google AdSense (opcional, apenas ID numérico)
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ex: 1234567890"
              className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm font-mono text-white focus:border-[#00D084] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#A0AAB5]">
              URL da imagem do banner (opcional)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm text-white focus:border-[#00D084] focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-[#A0AAB5]">
            URL de destino ao clicar (opcional)
          </label>
          <input
            type="url"
            value={destinationUrl}
            onChange={(e) => setDestinationUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm text-white focus:border-[#00D084] focus:outline-none"
          />
        </div>

        <label className="inline-flex items-center gap-2 text-xs text-white cursor-pointer">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="accent-[#00D084]"
          />
          <span>Ativar imediatamente</span>
        </label>

        <div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-[#00D084] px-5 py-2.5 text-sm font-semibold text-[#0B0F14]"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>Guardar anúncio</span>
          </button>
        </div>
      </form>

      <div className="rounded-xl border border-white/10 bg-[#151B23] divide-y divide-white/10">
        {loading ? (
          <div className="p-8 text-center text-sm text-[#A0AAB5]">A carregar anúncios...</div>
        ) : ads.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#A0AAB5]">
            Nenhum anúncio configurado ainda.
          </div>
        ) : (
          ads.map((ad) => (
            <div key={ad.id} className="p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-white text-sm">{ad.name}</p>
                <p className="text-xs text-[#A0AAB5]">
                  {POSITIONS.find((p) => p.value === ad.position)?.label || ad.position}
                  {ad.code ? ` · AdSense: ${ad.code}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleActive(ad)}
                  className={`rounded-md border px-2.5 py-1 text-xs ${
                    ad.active
                      ? 'border-[#00D084]/40 text-[#00D084]'
                      : 'border-white/10 text-[#A0AAB5]'
                  }`}
                >
                  {ad.active ? 'Ativo' : 'Pausado'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(ad.id)}
                  className="p-1.5 rounded-md border border-white/10 text-[#A0AAB5] hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
