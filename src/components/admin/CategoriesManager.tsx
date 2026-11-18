'use client';

import React, { useEffect, useState } from 'react';
import { Edit3, Loader2, Plus, Trash2, Upload } from 'lucide-react';
import { slugify } from '@/lib/format';
import { useToast } from '@/components/ToastProvider';
import { CategoryIcon } from '@/components/CategoryIcon';
import type { Category } from '@/types/database';

const ICON_OPTIONS = [
  'Smartphone',
  'Monitor',
  'Gamepad2',
  'Music',
  'Video',
  'BookOpen',
  'Cpu',
  'Wrench',
  'Image',
  'HardDrive',
  'Folder',
];

export function CategoriesManager() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Folder');
  const [imageUrl, setImageUrl] = useState('');
  const [active, setActive] = useState(true);

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (res.ok) setCategories(data.categories || []);
    } catch {
      showToast('Erro ao carregar categorias.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let activeFlag = true;
    fetch('/api/admin/categories')
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (activeFlag && ok) setCategories(data.categories || []);
      })
      .catch(() => {
        if (activeFlag) showToast('Erro ao carregar categorias.', 'error');
      })
      .finally(() => {
        if (activeFlag) setLoading(false);
      });
    return () => {
      activeFlag = false;
    };
  }, [showToast]);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setIcon('Folder');
    setImageUrl('');
    setActive(true);
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description);
    setIcon(cat.icon || 'Folder');
    setImageUrl(cat.image_url || '');
    setActive(cat.active);
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('bucket', 'covers');
    fd.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || 'Erro ao enviar imagem.', 'error');
      return;
    }
    if (data.publicUrl) setImageUrl(data.publicUrl);
    showToast('Imagem da categoria carregada.', 'success');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId
        ? `/api/admin/categories/${encodeURIComponent(editingId)}`
        : '/api/admin/categories';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          description,
          icon,
          image_url: imageUrl || null,
          active,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Erro ao guardar categoria.', 'error');
        return;
      }
      showToast(editingId ? 'Categoria atualizada.' : 'Categoria criada.', 'success');
      setShowForm(false);
      resetForm();
      await loadCategories();
    } catch {
      showToast('Erro de ligação.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/categories/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      showToast('Não foi possível eliminar a categoria.', 'error');
      return;
    }
    setConfirmDeleteId(null);
    showToast('Categoria eliminada.', 'success');
    await loadCategories();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Gestão de Categorias
          </h1>
          <p className="text-sm text-[#A0AAB5] mt-1">
            Organiza slugs, ícones, imagens e estado de visibilidade das categorias.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              resetForm();
            } else {
              resetForm();
              setShowForm(true);
            }
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-[#00D084] px-4 py-2.5 text-xs font-semibold text-[#0B0F14] hover:bg-[#00B874]"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Fechar formulário' : 'Nova categoria'}</span>
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-[#151B23] p-6 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#A0AAB5]">Nome *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!editingId) setSlug(slugify(e.target.value));
                }}
                className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm text-white focus:border-[#00D084] focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#A0AAB5]">Slug *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm font-mono text-white focus:border-[#00D084] focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#A0AAB5]">Ícone</label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm text-white focus:border-[#00D084] focus:outline-none"
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#A0AAB5]">Imagem (URL ou upload)</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2 text-xs text-white focus:border-[#00D084] focus:outline-none"
                />
                <label className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0B0F14] px-3 py-2 text-xs text-white cursor-pointer hover:border-[#00D084]">
                  <Upload className="w-3.5 h-3.5 text-[#00D084]" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#A0AAB5]">Descrição SEO</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
            <span>Categoria ativa e visível no site</span>
          </label>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#00D084] px-5 py-2.5 text-sm font-semibold text-[#0B0F14]"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{editingId ? 'Guardar' : 'Criar categoria'}</span>
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl border border-white/10 bg-[#151B23] divide-y divide-white/10">
        {loading ? (
          <div className="p-8 text-center text-sm text-[#A0AAB5]">A carregar categorias...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#A0AAB5]">Sem categorias registadas.</div>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-[#0B0F14] text-[#00D084] shrink-0">
                  <CategoryIcon name={cat.icon} className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white truncate">{cat.name}</span>
                    <span className="text-xs font-mono text-[#A0AAB5]">/{cat.slug}</span>
                  </div>
                  <p className="text-xs text-[#A0AAB5] truncate">{cat.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs ${cat.active ? 'text-[#00D084]' : 'text-[#A0AAB5]'}`}>
                  {cat.active ? 'Ativa' : 'Inativa'}
                </span>
                <button
                  type="button"
                  onClick={() => handleEdit(cat)}
                  className="p-1.5 rounded-md border border-white/10 text-[#A0AAB5] hover:text-white"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                {confirmDeleteId === cat.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDelete(cat.id)}
                      className="rounded bg-rose-600 px-2 py-1 text-[11px] text-white"
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
                    onClick={() => setConfirmDeleteId(cat.id)}
                    className="p-1.5 rounded-md border border-white/10 text-[#A0AAB5] hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
