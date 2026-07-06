// ============================================================
// SOUNDWAVE — LOGIN FORM TESTS
// ============================================================

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/auth/LoginForm';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

describe('LoginForm', () => {
  it('renders email and password fields', () => {
    render(<LoginForm onSwitchToRegister={jest.fn()} />);

    expect(screen.getByLabelText('ایمیل')).toBeInTheDocument();
    expect(screen.getByLabelText('رمز عبور')).toBeInTheDocument();
  });

  it('shows a validation error when the form is submitted empty', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSwitchToRegister={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: 'ورود' }));

    await waitFor(() => {
      expect(screen.getByText('ایمیل الزامی است')).toBeInTheDocument();
    });
    expect(screen.getByText('رمز عبور باید حداقل ۸ کاراکتر باشد')).toBeInTheDocument();
  });
});
