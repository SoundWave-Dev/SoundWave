// ============================================================
// SOUNDWAVE — LOGIN PAGE
// Owner: Foad
// ============================================================
//
// TODO (Foad): Build login + registration flow:
//   LOGIN form:
//     - Email + password fields with validation (zod)
//     - "Forgot password" link → /forgot-password
//     - On success: redirect to role-appropriate page
//       listener/artist → /home
//       support/admin   → /support
//     - Handle error states (wrong credentials)
//
//   REGISTER form (tab/toggle on same page):
//     Listener fields:
//       displayName, email, password, confirmPassword,
//       birthDate, gender, privacyPolicy checkbox
//     Artist fields:
//       email, password, stageName, portfolio (file upload)
//       → on submit: status = 'pending' (shown to user)
//
// Use: useAuthStore (lib/store/authStore.ts)
// Validation: react-hook-form + zod (lib/validators/)
// ============================================================

export default function LoginPage() {
  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--color-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-6)',
      direction: 'rtl',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'var(--color-surface-1)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-8)',
        border: '1px solid var(--color-border)',
      }}>
        {/* Logo */}
        <div style={{
          textAlign: 'center',
          marginBottom: 'var(--space-8)',
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-2xl)',
          fontWeight: 700,
          color: 'var(--color-primary)',
        }}>
          🎵 Soundwave
        </div>

        {/* TODO (Foad): Replace this placeholder with the real form */}
        <div style={{
          background: 'var(--color-surface-2)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-8)',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          fontSize: 'var(--text-sm)',
        }}>
          🚧 فرم ورود — توسط Foad پیاده‌سازی می‌شود
        </div>

        {/* Quick login hint for dev */}
        <div style={{
          marginTop: 'var(--space-6)',
          padding: 'var(--space-4)',
          background: 'var(--color-primary-glow)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-primary)',
          textAlign: 'center',
        }}>
          🧪 Dev: هر ایمیل با رمز «password123» کار می‌کند
        </div>
      </div>
    </div>
  );
}
