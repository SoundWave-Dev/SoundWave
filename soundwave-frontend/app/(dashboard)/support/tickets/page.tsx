import { redirect } from 'next/navigation';

// ============================================================
// SOUNDWAVE — TICKETS INDEX
// Owner: Foad
// The ticket list lives inside the dashboard tab shell
// (see app/(dashboard)/support/page.tsx) — deep-link there.
// ============================================================

export default function TicketsIndexPage() {
  redirect('/support');
}
