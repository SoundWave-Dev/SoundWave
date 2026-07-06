import { redirect } from 'next/navigation';

// ============================================================
// SOUNDWAVE — REGISTER PAGE
// Owner: Foad
// Registration lives on the login page as a tab (see
// app/(auth)/login/page.tsx) — this route just deep-links there.
// ============================================================

export default function RegisterPage() {
  redirect('/login?tab=register');
}
