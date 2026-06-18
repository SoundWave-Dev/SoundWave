import { redirect } from 'next/navigation';

// Redirect root to home (or login if not authenticated)
// TODO (Foad): Add auth guard — if no token in localStorage, redirect to /login
export default function RootPage() {
  redirect('/home');
}
