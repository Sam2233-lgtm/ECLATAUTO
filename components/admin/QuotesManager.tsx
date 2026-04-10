'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Trash2, Send, ChevronDown, ChevronUp, ExternalLink, Check, X } from 'lucide-react';

interface Quote {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  vehicleType: string;
  description: string;
  photoUrls: string[] | null;
  status: string;
  adminNote: string | null;
  quoteAmount: number | null;
  quoteDetails: string | null;
  token: string | null;
  createdAt: string;
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending:  { label: 'En attente',  className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  sent:     { label: 'Soumis',      className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  accepted: { label: 'Accepté',     className: 'bg-green-500/10 text-green-400 border-green-500/20' },
  declined: { label: 'Refusé',      className: 'bg-red-500/10 text-red-400 border-red-500/20' },
  archived: { label: 'Archivé',     className: 'bg-brand-black-border text-brand-cream-muted border-transparent' },
};

export default function QuotesManager({ initialQuotes }: { initialQuotes: Quote[] }) {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [quoteForm, setQuoteForm] = useState<Record<string, { amount: string; details: string }>>({});
  const [sending, setSending] = useState<string | null>(null);

  function toggleExpand(id: string) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  function getQuoteForm(id: string) {
    return quoteForm[id] || { amount: '', details: '' };
  }

  function updateQuoteForm(id: string, field: 'amount' | 'details', value: string) {
    setQuoteForm((prev) => ({ ...prev, [id]: { ...getQuoteForm(id), [field]: value } }));
  }

  async function handleSendQuote(quote: Quote) {
    const form = getQuoteForm(quote.id);
    if (!form.amount || !form.details) return;
    setSending(quote.id);
    try {
      const res = await fetch(`/api/admin/quotes/${quote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteAmount: form.amount, quoteDetails: form.details, sendQuote: true }),
      });
      const updated = await res.json();
      setQuotes((prev) => prev.map((q) => (q.id === quote.id ? updated : q)));
      router.refresh();
    } finally {
      setSending(null);
    }
  }

  async function handleStatusChange(id: string, status: string) {
    const res = await fetch(`/api/admin/quotes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const updated = await res.json();
    setQuotes((prev) => prev.map((q) => (q.id === id ? updated : q)));
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer la demande de ${name}? Cette action est irréversible.`)) return;
    await fetch(`/api/admin/quotes/${id}`, { method: 'DELETE' });
    setQuotes((prev) => prev.filter((q) => q.id !== id));
    router.refresh();
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('fr-CA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  const activeQuotes = quotes.filter((q) => q.status !== 'archived');
  const archivedQuotes = quotes.filter((q) => q.status === 'archived');

  return (
    <div className="space-y-4">
      {activeQuotes.length === 0 && (
        <div className="card-dark p-10 text-center text-brand-cream-muted">
          Aucune demande de devis active.
        </div>
      )}

      {activeQuotes.map((q) => {
        const isOpen = expanded === q.id;
        const status = STATUS_LABELS[q.status] || STATUS_LABELS.pending;
        const form = getQuoteForm(q.id);

        return (
          <div key={q.id} className="card-dark overflow-hidden">
            {/* Header row */}
            <div className="p-5 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-brand-cream font-semibold">{q.firstName} {q.lastName}</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full border ${status.className}`}>{status.label}</span>
                  {q.quoteAmount && (
                    <span className="text-brand-gold font-semibold text-sm">${q.quoteAmount.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-sm text-brand-cream-muted flex-wrap">
                  <span>{q.email}</span>
                  <span className="text-brand-cream-muted/40">·</span>
                  <span>{q.phone}</span>
                  <span className="text-brand-cream-muted/40">·</span>
                  <span>{q.vehicleType}</span>
                  <span className="text-brand-cream-muted/40">·</span>
                  <span className="text-xs">{formatDate(q.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => toggleExpand(q.id)}
                  className="p-2 rounded-lg text-brand-cream-muted hover:text-brand-gold hover:bg-brand-gold/10 transition-all"
                  title="Voir détails">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button onClick={() => handleDelete(q.id, `${q.firstName} ${q.lastName}`)}
                  className="p-2 rounded-lg text-brand-cream-muted hover:text-red-400 hover:bg-red-500/10 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Expanded details */}
            {isOpen && (
              <div className="border-t border-brand-black-border p-5 space-y-5">
                {/* Description */}
                <div>
                  <div className="text-xs font-medium text-brand-cream-muted mb-1">Description du client</div>
                  <p className="text-brand-cream text-sm whitespace-pre-line bg-brand-black/50 rounded-lg p-3">{q.description}</p>
                </div>

                {/* Photos */}
                {q.photoUrls && (q.photoUrls as string[]).length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-brand-cream-muted mb-2">Photos ({(q.photoUrls as string[]).length})</div>
                    <div className="flex flex-wrap gap-3">
                      {(q.photoUrls as string[]).map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 text-brand-gold text-sm hover:underline">
                          <ExternalLink className="w-3.5 h-3.5" />
                          Photo {i + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Send quote form */}
                {q.status === 'pending' && (
                  <div className="bg-brand-black/50 rounded-lg p-4 space-y-3">
                    <div className="text-sm font-semibold text-brand-cream">Envoyer une soumission</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-brand-cream-muted mb-1">Montant ($)</label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-gold text-sm font-bold">$</span>
                          <input
                            type="number"
                            className="input-dark pl-6"
                            value={form.amount}
                            onChange={(e) => updateQuoteForm(q.id, 'amount', e.target.value)}
                            placeholder="0.00"
                            min={0}
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs text-brand-cream-muted mb-1">Détails de la soumission</label>
                        <textarea
                          className="input-dark resize-none"
                          rows={3}
                          value={form.details}
                          onChange={(e) => updateQuoteForm(q.id, 'details', e.target.value)}
                          placeholder="Décrivez les services inclus dans cette soumission..."
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleSendQuote(q)}
                      disabled={sending === q.id || !form.amount || !form.details}
                      className="btn-gold flex items-center gap-2 disabled:opacity-60"
                    >
                      {sending === q.id
                        ? <span className="inline-block w-4 h-4 border-2 border-brand-black/30 border-t-brand-black rounded-full animate-spin" />
                        : <Send className="w-4 h-4" />
                      }
                      Envoyer la soumission par courriel
                    </button>
                  </div>
                )}

                {/* Sent/accepted status info */}
                {(q.status === 'sent' || q.status === 'accepted') && q.quoteAmount && (
                  <div className="bg-brand-black/50 rounded-lg p-4">
                    <div className="text-xs font-medium text-brand-cream-muted mb-1">Soumission envoyée</div>
                    <div className="text-brand-gold font-bold text-lg mb-1">${q.quoteAmount.toFixed(2)}</div>
                    {q.quoteDetails && <p className="text-brand-cream-muted text-sm whitespace-pre-line">{q.quoteDetails}</p>}
                  </div>
                )}

                {/* Status actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-brand-cream-muted">Changer le statut :</span>
                  {q.status !== 'archived' && (
                    <button onClick={() => handleStatusChange(q.id, 'archived')}
                      className="px-3 py-1 text-xs rounded-lg bg-brand-black-border text-brand-cream-muted hover:text-brand-cream transition-colors">
                      Archiver
                    </button>
                  )}
                  {q.status !== 'declined' && (
                    <button onClick={() => handleStatusChange(q.id, 'declined')}
                      className="px-3 py-1 text-xs rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                      Refusé
                    </button>
                  )}
                  {q.status !== 'accepted' && q.status !== 'pending' && (
                    <button onClick={() => handleStatusChange(q.id, 'accepted')}
                      className="px-3 py-1 text-xs rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors">
                      Accepté
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Archived section */}
      {archivedQuotes.length > 0 && (
        <details className="mt-6">
          <summary className="text-sm text-brand-cream-muted cursor-pointer hover:text-brand-cream transition-colors">
            Afficher les demandes archivées ({archivedQuotes.length})
          </summary>
          <div className="mt-3 space-y-3">
            {archivedQuotes.map((q) => (
              <div key={q.id} className="card-dark p-4 opacity-50 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-brand-cream font-medium text-sm">{q.firstName} {q.lastName}</div>
                  <div className="text-brand-cream-muted text-xs">{q.email} · {formatDate(q.createdAt)}</div>
                </div>
                <button onClick={() => handleDelete(q.id, `${q.firstName} ${q.lastName}`)}
                  className="p-2 rounded-lg text-brand-cream-muted hover:text-red-400 hover:bg-red-500/10 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
