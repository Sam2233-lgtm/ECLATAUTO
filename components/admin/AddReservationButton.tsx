'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import AddReservationModal from './AddReservationModal';

export default function AddReservationButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-gold flex items-center gap-2 text-sm py-2.5 px-5"
      >
        <Plus className="w-4 h-4" />
        Ajouter une réservation
      </button>

      {open && <AddReservationModal onClose={() => setOpen(false)} />}
    </>
  );
}
