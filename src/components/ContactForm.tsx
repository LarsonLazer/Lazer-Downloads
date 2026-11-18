'use client';

import React, { useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { useToast } from './ToastProvider';

export function ContactForm() {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Erro ao enviar mensagem.', 'error');
        return;
      }
      setSent(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      showToast('Mensagem enviada com sucesso.', 'success');
    } catch {
      showToast('Erro de ligação ao enviar mensagem.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-[#151B23] p-6 sm:p-8 space-y-5"
    >
      {sent && (
        <div className="rounded-lg border border-[#00D084]/40 bg-[#0B0F14] p-4 text-sm text-[#00D084]">
          Obrigado pelo contacto. A equipa LAZER EMPRESAS irá analisar a tua mensagem.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="contact-name" className="block text-xs font-medium text-[#A0AAB5]">
            Nome completo
          </label>
          <input
            id="contact-name"
            type="text"
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="O teu nome"
            className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm text-white placeholder-[#A0AAB5]/60 focus:border-[#00D084] focus:outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="contact-email" className="block text-xs font-medium text-[#A0AAB5]">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nome@exemplo.com"
            className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm text-white placeholder-[#A0AAB5]/60 focus:border-[#00D084] focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contact-subject" className="block text-xs font-medium text-[#A0AAB5]">
          Assunto
        </label>
        <input
          id="contact-subject"
          type="text"
          required
          minLength={3}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Parcerias, submissão de software, suporte..."
          className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm text-white placeholder-[#A0AAB5]/60 focus:border-[#00D084] focus:outline-none"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contact-message" className="block text-xs font-medium text-[#A0AAB5]">
          Mensagem
        </label>
        <textarea
          id="contact-message"
          rows={5}
          required
          minLength={10}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escreve a tua mensagem com o máximo de detalhes..."
          className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm text-white placeholder-[#A0AAB5]/60 focus:border-[#00D084] focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#00D084] px-6 py-3 text-sm font-semibold text-[#0B0F14] hover:bg-[#00B874] disabled:opacity-60 transition-colors"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        <span>{loading ? 'A enviar...' : 'Enviar mensagem'}</span>
      </button>
    </form>
  );
}
