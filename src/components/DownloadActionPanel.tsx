'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  Check,
  Download,
  ExternalLink,
  Flag,
  Loader2,
  Share2,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from './ToastProvider';

interface DownloadActionPanelProps {
  downloadId: string;
  slug: string;
  title: string;
  initialCount: number;
  initialFavorited?: boolean;
  isAuthenticated?: boolean;
  fileSize?: string | null;
  fileType?: string | null;
  version?: string | null;
  securityNotice: string;
}

export function DownloadActionPanel({
  downloadId,
  slug,
  title,
  initialCount,
  initialFavorited = false,
  isAuthenticated = false,
  fileSize,
  fileType,
  version,
  securityNotice,
}: DownloadActionPanelProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [readyLink, setReadyLink] = useState<{
    url: string;
    fileName: string;
    securityNotice: string;
  } | null>(null);
  const [favorited, setFavorited] = useState(initialFavorited);
  const [copied, setCopied] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/downloads/${encodeURIComponent(slug)}/track`, {
        method: 'POST',
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Não foi possível iniciar o download.', 'error');
        return;
      }

      if (typeof data.downloadCount === 'number') {
        setCount(data.downloadCount);
      }

      setReadyLink({
        url: data.downloadUrl,
        fileName: data.fileName || title,
        securityNotice: data.securityNotice || securityNotice,
      });

      showToast('Link de download preparado e verificado com sucesso.', 'success');

      // Trigger download in browser safely without window.open popup blocking
      const anchor = document.createElement('a');
      anchor.href = data.downloadUrl;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.download = data.fileName || '';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    } catch {
      showToast('Erro de ligação ao preparar o download.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      showToast('Link copiado para a área de transferência.', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Não foi possível copiar o link.', 'error');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to copy
      }
    }
    await handleCopyLink();
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      showToast('Inicia sessão para guardar ficheiros nos favoritos.', 'info');
      return;
    }

    try {
      const res = await fetch(
        favorited ? `/api/favorites?download_id=${encodeURIComponent(downloadId)}` : '/api/favorites',
        {
          method: favorited ? 'DELETE' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: favorited ? undefined : JSON.stringify({ download_id: downloadId }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || 'Erro ao atualizar favoritos.', 'error');
        return;
      }

      setFavorited(!favorited);
      showToast(
        !favorited ? 'Adicionado aos teus favoritos.' : 'Removido dos favoritos.',
        'success'
      );
    } catch {
      showToast('Erro ao comunicar com o servidor.', 'error');
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#151B23] p-6 space-y-5">
      <div className="flex items-center justify-between text-xs text-[#A0AAB5] pb-4 border-b border-white/10">
        <span>Downloads registados</span>
        <span className="font-mono tabular-nums text-base font-semibold text-white">
          {count.toLocaleString('pt-PT')}
        </span>
      </div>

      <button
        type="button"
        onClick={handleDownload}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#00D084] px-6 py-4 text-sm font-bold tracking-wide text-[#0B0F14] hover:bg-[#00B874] disabled:opacity-60 transition-colors min-h-[52px]"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Download className="w-5 h-5" />
        )}
        <span>{loading ? 'A PREPARAR DOWNLOAD...' : 'DESCARREGAR AGORA'}</span>
      </button>

      {(version || fileSize || fileType) && (
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs font-mono tabular-nums text-[#A0AAB5]">
          {version && <span>v{version}</span>}
          {version && fileSize && <span aria-hidden="true">·</span>}
          {fileSize && <span>{fileSize}</span>}
          {(version || fileSize) && fileType && <span aria-hidden="true">·</span>}
          {fileType && <span>{fileType}</span>}
        </div>
      )}

      {readyLink && (
        <div className="rounded-lg border border-[#00D084]/40 bg-[#0B0F14] p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#00D084]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Download verificado pronto</span>
          </div>
          <p className="text-xs text-[#A0AAB5] leading-relaxed">
            {readyLink.securityNotice}
          </p>
          <a
            href={readyLink.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-[#00D084] underline"
          >
            <span>Se não iniciou automaticamente, clica aqui ({readyLink.fileName})</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      <div className="rounded-lg border border-white/10 bg-[#0B0F14] p-4 space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-white">
          <ShieldCheck className="w-4 h-4 text-[#00D084] shrink-0" />
          <span>Aviso de segurança</span>
        </div>
        <p className="text-xs text-[#A0AAB5] leading-relaxed">{securityNotice}</p>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-[#0B0F14] px-3 py-2.5 text-xs font-medium text-[#A0AAB5] hover:text-white hover:border-white/25 transition-colors min-h-[40px]"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#00D084]" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copiado' : 'Partilhar'}</span>
        </button>

        <button
          type="button"
          onClick={handleToggleFavorite}
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors min-h-[40px] ${
            favorited
              ? 'border-[#00D084] bg-[#00D084]/15 text-[#00D084]'
              : 'border-white/10 bg-[#0B0F14] text-[#A0AAB5] hover:text-white hover:border-white/25'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>{favorited ? 'Guardado' : 'Guardar'}</span>
        </button>

        <Link
          href={`/reportar?download_id=${encodeURIComponent(downloadId)}&titulo=${encodeURIComponent(title)}`}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-[#0B0F14] px-3 py-2.5 text-xs font-medium text-[#A0AAB5] hover:text-rose-400 hover:border-rose-400/40 transition-colors min-h-[40px]"
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Reportar</span>
        </Link>
      </div>
    </div>
  );
}
