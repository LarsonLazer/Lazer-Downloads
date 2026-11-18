'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Edit3,
  ExternalLink,
  Loader2,
  Plus,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import { OPERATING_SYSTEMS } from '@/lib/constants';
import { slugify } from '@/lib/format';
import { useToast } from '@/components/ToastProvider';
import type { Category, DownloadItem, DownloadStatus } from '@/types/database';

interface DownloadFormState {
  id?: string;
  title: string;
  slug: string;
  category_id: string;
  short_description: string;
  description: string;
  thumbnail_url: string;
  file_url: string;
  external_download_url: string;
  file_path: string;
  file_name: string;
  file_size: string;
  file_type: string;
  version: string;
  operating_system: string;
  developer: string;
  author: string;
  instructions: string;
  requirements: string;
  security_notes: string;
  tags: string;
  screenshots: string[];
  featured: boolean;
  popular: boolean;
  premium: boolean;
  status: DownloadStatus;
}

const EMPTY_FORM: DownloadFormState = {
  title: '',
  slug: '',
  category_id: '',
  short_description: '',
  description: '',
  thumbnail_url: '',
  file_url: '',
  external_download_url: '',
  file_path: '',
  file_name: '',
  file_size: '',
  file_type: '',
  version: '',
  operating_system: 'Windows',
  developer: '',
  author: '',
  instructions: '',
  requirements: '',
  security_notes: '',
  tags: '',
  screenshots: [],
  featured: false,
  popular: false,
  premium: false,
  status: 'published',
};

function uploadWithProgress(
  file: File,
  bucket: 'downloads' | 'covers' | 'screenshots',
  onProgress: (pct: number) => void
): Promise<{
  path: string;
  publicUrl: string | null;
  fileName: string;
  fileSize: string;
  fileType: string;
}> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/admin/upload');
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) {
        onProgress(Math.round((ev.loaded / ev.total) * 100));
      }
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
        } else {
          reject(new Error(data.error || 'Erro no upload.'));
        }
      } catch {
        reject(new Error('Resposta inválida do servidor de upload.'));
      }
    };
    xhr.onerror = () => reject(new Error('Falha de rede durante o upload.'));

    const fd = new FormData();
    fd.append('bucket', bucket);
    fd.append('file', file);
    xhr.send(fd);
  });
}

export function DownloadsManager({ categories }: { categories: Category[] }) {
  const { showToast } = useToast();
  const [items, setItems] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<DownloadFormState>(EMPTY_FORM);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<{
    bucket: string | null;
    progress: number;
  }>({ bucket: null, progress: 0 });

  const loadDownloads = async () => {
    try {
      const res = await fetch('/api/admin/downloads');
      const data = await res.json();
      if (res.ok) {
        setItems(data.downloads || []);
      }
    } catch {
      showToast('Erro ao carregar lista de downloads.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let activeFlag = true;
    fetch('/api/admin/downloads')
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (activeFlag && ok) setItems(data.downloads || []);
      })
      .catch(() => {
        if (activeFlag) showToast('Erro ao carregar lista de downloads.', 'error');
      })
      .finally(() => {
        if (activeFlag) setLoading(false);
      });
    return () => {
      activeFlag = false;
    };
  }, [showToast]);

  const handleOpenCreate = () => {
    setForm({
      ...EMPTY_FORM,
      category_id: categories[0]?.id || '',
    });
    setShowForm(true);
  };

  const handleOpenEdit = (item: DownloadItem) => {
    setForm({
      id: item.id,
      title: item.title,
      slug: item.slug,
      category_id: item.category_id || '',
      short_description: item.short_description || '',
      description: item.description || '',
      thumbnail_url: item.thumbnail_url || '',
      file_url: item.file_url || '',
      external_download_url: item.external_download_url || '',
      file_path: item.file_path || '',
      file_name: item.file_name || '',
      file_size: item.file_size || '',
      file_type: item.file_type || '',
      version: item.version || '',
      operating_system: item.operating_system || 'Windows',
      developer: item.developer || '',
      author: item.author || '',
      instructions: item.instructions || '',
      requirements: item.requirements || '',
      security_notes: item.security_notes || '',
      tags: (item.tags || []).join(', '),
      screenshots: item.screenshots || [],
      featured: item.featured,
      popular: item.popular,
      premium: item.premium,
      status: item.status,
    });
    setShowForm(true);
  };

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    bucket: 'downloads' | 'covers' | 'screenshots'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadState({ bucket, progress: 0 });
    try {
      const result = await uploadWithProgress(file, bucket, (pct) => {
        setUploadState({ bucket, progress: pct });
      });

      if (bucket === 'covers' && result.publicUrl) {
        setForm((prev) => ({ ...prev, thumbnail_url: result.publicUrl! }));
      } else if (bucket === 'screenshots' && result.publicUrl) {
        setForm((prev) => ({
          ...prev,
          screenshots: [...prev.screenshots, result.publicUrl!],
        }));
      } else if (bucket === 'downloads') {
        setForm((prev) => ({
          ...prev,
          file_path: result.path,
          file_name: result.fileName,
          file_size: prev.file_size || result.fileSize,
          file_type: prev.file_type || result.fileType,
        }));
      }

      showToast(`Upload concluído (${result.fileName}).`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro no upload.', 'error');
    } finally {
      setUploadState({ bucket: null, progress: 0 });
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const endpoint = form.id
        ? `/api/admin/downloads/${encodeURIComponent(form.id)}`
        : '/api/admin/downloads';
      const method = form.id ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Erro ao guardar download.', 'error');
        return;
      }

      showToast(
        form.id ? 'Download atualizado com sucesso.' : 'Download criado com sucesso.',
        'success'
      );
      setShowForm(false);
      await loadDownloads();
    } catch {
      showToast('Erro de ligação ao guardar.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickPatch = async (id: string, patch: Record<string, unknown>, msg: string) => {
    try {
      const res = await fetch(`/api/admin/downloads/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        showToast(d.error || 'Falha ao atualizar.', 'error');
        return;
      }
      showToast(msg, 'success');
      await loadDownloads();
    } catch {
      showToast('Erro de ligação.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/downloads/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        showToast(d.error || 'Falha ao eliminar.', 'error');
        return;
      }
      setConfirmDeleteId(null);
      showToast('Download eliminado.', 'success');
      await loadDownloads();
    } catch {
      showToast('Erro ao eliminar.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Gestão de Downloads
          </h1>
          <p className="text-sm text-[#A0AAB5] mt-1">
            Cria, edita, publica, destaca e carrega ficheiros no Supabase Storage.
          </p>
        </div>
        <button
          type="button"
          onClick={() => (showForm ? setShowForm(false) : handleOpenCreate())}
          className="inline-flex items-center gap-2 rounded-lg bg-[#00D084] px-4 py-2.5 text-xs font-semibold text-[#0B0F14] hover:bg-[#00B874] transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Fechar formulário' : 'Adicionar download'}</span>
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-[#151B23] p-6 space-y-6"
        >
          <h2 className="font-display text-lg font-semibold text-white">
            {form.id ? 'Editar download' : 'Publicar novo download'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#A0AAB5]">Título *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    title,
                    slug: prev.id ? prev.slug : slugify(title),
                  }));
                }}
                className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm text-white focus:border-[#00D084] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#A0AAB5]">Slug (URL) *</label>
              <input
                type="text"
                required
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm font-mono text-white focus:border-[#00D084] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#A0AAB5]">Categoria</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm((prev) => ({ ...prev, category_id: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm text-white focus:border-[#00D084] focus:outline-none"
              >
                <option value="">Sem categoria</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#A0AAB5]">Sistema compatível</label>
              <select
                value={form.operating_system}
                onChange={(e) => setForm((prev) => ({ ...prev, operating_system: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm text-white focus:border-[#00D084] focus:outline-none"
              >
                {OPERATING_SYSTEMS.map((os) => (
                  <option key={os} value={os}>
                    {os}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#A0AAB5]">Versão</label>
              <input
                type="text"
                placeholder="ex: 2.4.1"
                value={form.version}
                onChange={(e) => setForm((prev) => ({ ...prev, version: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm text-white focus:border-[#00D084] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#A0AAB5]">Tamanho</label>
              <input
                type="text"
                placeholder="ex: 48.5 MB"
                value={form.file_size}
                onChange={(e) => setForm((prev) => ({ ...prev, file_size: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm text-white focus:border-[#00D084] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#A0AAB5]">Formato do ficheiro</label>
              <input
                type="text"
                placeholder="ex: APK, EXE, ZIP, PDF"
                value={form.file_type}
                onChange={(e) => setForm((prev) => ({ ...prev, file_type: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm text-white focus:border-[#00D084] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#A0AAB5]">Desenvolvedor / Autor</label>
              <input
                type="text"
                value={form.developer}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, developer: e.target.value, author: e.target.value }))
                }
                className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm text-white focus:border-[#00D084] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#A0AAB5]">Descrição curta</label>
            <input
              type="text"
              value={form.short_description}
              onChange={(e) => setForm((prev) => ({ ...prev, short_description: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm text-white focus:border-[#00D084] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#A0AAB5]">Descrição completa</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm text-white focus:border-[#00D084] focus:outline-none"
            />
          </div>

          {/* Storage Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/10">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-[#A0AAB5]">
                Capa / Thumbnail (URL ou Upload para bucket &quot;covers&quot;)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={form.thumbnail_url}
                onChange={(e) => setForm((prev) => ({ ...prev, thumbnail_url: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2 text-xs text-white focus:border-[#00D084] focus:outline-none"
              />
              <label className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#0B0F14] px-3 py-2 text-xs text-white cursor-pointer hover:border-[#00D084]">
                <Upload className="w-3.5 h-3.5 text-[#00D084]" />
                <span>Enviar imagem de capa</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => handleUpload(e, 'covers')}
                />
              </label>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-[#A0AAB5]">
                Ficheiro privado (Upload para bucket &quot;downloads&quot;) ou Link externo
              </label>
              <input
                type="url"
                placeholder="Link externo oficial (https://...)"
                value={form.external_download_url}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, external_download_url: e.target.value }))
                }
                className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2 text-xs text-white focus:border-[#00D084] focus:outline-none"
              />
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#0B0F14] px-3 py-2 text-xs text-white cursor-pointer hover:border-[#00D084]">
                  <Upload className="w-3.5 h-3.5 text-[#00D084]" />
                  <span>Enviar ficheiro para Storage</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleUpload(e, 'downloads')}
                  />
                </label>
                {form.file_path && (
                  <span className="text-[11px] font-mono text-[#00D084] truncate max-w-[220px]">
                    {form.file_path}
                  </span>
                )}
              </div>
            </div>
          </div>

          {uploadState.bucket && (
            <div className="rounded-lg border border-[#00D084]/40 bg-[#0B0F14] p-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-white">
                <span>A enviar para {uploadState.bucket}...</span>
                <span className="font-mono tabular-nums">{uploadState.progress}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-[#00D084] transition-all"
                  style={{ width: `${uploadState.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Screenshots Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-[#A0AAB5]">
              Capturas de ecrã ({form.screenshots.length})
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#0B0F14] px-3 py-2 text-xs text-white cursor-pointer hover:border-[#00D084]">
                <Upload className="w-3.5 h-3.5 text-[#00D084]" />
                <span>Adicionar screenshot</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => handleUpload(e, 'screenshots')}
                />
              </label>
              {form.screenshots.map((shot, i) => (
                <div key={`${shot}-${i}`} className="flex items-center gap-1.5 text-xs text-[#A0AAB5]">
                  <span className="truncate max-w-[140px]">Imagem {i + 1}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        screenshots: prev.screenshots.filter((_, idx) => idx !== i),
                      }))
                    }
                    className="text-rose-400 hover:underline"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#A0AAB5]">Requisitos</label>
              <textarea
                rows={3}
                value={form.requirements}
                onChange={(e) => setForm((prev) => ({ ...prev, requirements: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm text-white focus:border-[#00D084] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#A0AAB5]">
                Instruções de instalação
              </label>
              <textarea
                rows={3}
                value={form.instructions}
                onChange={(e) => setForm((prev) => ({ ...prev, instructions: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm text-white focus:border-[#00D084] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#A0AAB5]">
                Etiquetas (separadas por vírgula)
              </label>
              <input
                type="text"
                placeholder="android, utilitario, gratuito"
                value={form.tags}
                onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm text-white focus:border-[#00D084] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#A0AAB5]">Estado</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, status: e.target.value as DownloadStatus }))
                }
                className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm text-white focus:border-[#00D084] focus:outline-none"
              >
                <option value="published">Publicado</option>
                <option value="draft">Rascunho</option>
                <option value="archived">Arquivado</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-white">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))}
                className="accent-[#00D084]"
              />
              <span>Destacar na homepage</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.popular}
                onChange={(e) => setForm((prev) => ({ ...prev, popular: e.target.checked }))}
                className="accent-[#00D084]"
              />
              <span>Marcar como popular</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.premium}
                onChange={(e) => setForm((prev) => ({ ...prev, premium: e.target.checked }))}
                className="accent-[#00D084]"
              />
              <span>Conteúdo Premium</span>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#00D084] px-5 py-2.5 text-sm font-semibold text-[#0B0F14] hover:bg-[#00B874] disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{form.id ? 'Guardar alterações' : 'Criar download'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-white/10 bg-[#0B0F14] px-4 py-2.5 text-sm text-[#A0AAB5] hover:text-white"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Downloads Table */}
      <div className="rounded-xl border border-white/10 bg-[#151B23] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-[#A0AAB5]">A carregar downloads...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#A0AAB5]">
            Ainda não existem downloads registados na base de dados. Clica em &quot;Adicionar download&quot; para publicar o primeiro.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-[#0B0F14] text-xs text-[#A0AAB5]">
                <tr>
                  <th className="px-4 py-3 font-medium">Título</th>
                  <th className="px-4 py-3 font-medium">Categoria</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium text-right">Downloads</th>
                  <th className="px-4 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{item.title}</div>
                      <div className="text-xs font-mono text-[#A0AAB5]">
                        {item.version ? `v${item.version}` : '—'} · {item.file_size || '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#A0AAB5]">
                      {item.category?.name || 'Sem categoria'}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span
                        className={
                          item.status === 'published'
                            ? 'text-[#00D084] font-medium'
                            : 'text-[#A0AAB5]'
                        }
                      >
                        {item.status === 'published'
                          ? 'Publicado'
                          : item.status === 'draft'
                            ? 'Rascunho'
                            : 'Arquivado'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-xs text-white">
                      {Number(item.download_count).toLocaleString('pt-PT')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          title={item.featured ? 'Remover destaque' : 'Destacar na homepage'}
                          onClick={() =>
                            handleQuickPatch(
                              item.id,
                              { featured: !item.featured },
                              item.featured ? 'Removido dos destaques.' : 'Destacado na homepage.'
                            )
                          }
                          className={`p-1.5 rounded-md border border-white/10 ${
                            item.featured ? 'text-amber-400 border-amber-400/40' : 'text-[#A0AAB5]'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          title={item.status === 'published' ? 'Despublicar' : 'Publicar'}
                          onClick={() =>
                            handleQuickPatch(
                              item.id,
                              { status: item.status === 'published' ? 'draft' : 'published' },
                              item.status === 'published'
                                ? 'Movido para rascunho.'
                                : 'Download publicado.'
                            )
                          }
                          className={`p-1.5 rounded-md border border-white/10 ${
                            item.status === 'published'
                              ? 'text-[#00D084] border-[#00D084]/40'
                              : 'text-[#A0AAB5]'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>

                        <Link
                          href={`/download/${item.slug}`}
                          title="Ver página pública"
                          className="p-1.5 rounded-md border border-white/10 text-[#A0AAB5] hover:text-white"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          type="button"
                          title="Editar"
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-md border border-white/10 text-[#A0AAB5] hover:text-white"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {confirmDeleteId === item.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className="rounded bg-rose-600 px-2 py-1 text-[11px] font-semibold text-white"
                            >
                              Confirmar
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="rounded border border-white/10 px-2 py-1 text-[11px] text-[#A0AAB5]"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            title="Eliminar"
                            onClick={() => setConfirmDeleteId(item.id)}
                            className="p-1.5 rounded-md border border-white/10 text-[#A0AAB5] hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
