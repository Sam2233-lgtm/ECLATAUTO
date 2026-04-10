const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  completed: 'bg-green-500/10 text-green-400 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const STATUS_LABELS_FR: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  completed: 'Complétée',
  cancelled: 'Annulée',
};

interface StatusBadgeProps {
  status: string;
  locale?: string;
}

export default function StatusBadge({ status, locale = 'fr' }: StatusBadgeProps) {
  const label = STATUS_LABELS_FR[status] ?? status;
  const style = STATUS_STYLES[status] ?? 'bg-brand-black-border text-brand-cream-muted border-brand-black-border';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {label}
    </span>
  );
}
