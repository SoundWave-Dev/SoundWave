// ============================================================
// SOUNDWAVE — LISTENER REGISTRATION FORM TESTS
// ============================================================

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterListenerForm } from '@/components/auth/RegisterListenerForm';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

describe('RegisterListenerForm', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders all required fields', () => {
    render(<RegisterListenerForm />);

    expect(screen.getByLabelText('نام نمایشی')).toBeInTheDocument();
    expect(screen.getByLabelText('ایمیل')).toBeInTheDocument();
    expect(screen.getByLabelText('رمز عبور')).toBeInTheDocument();
    expect(screen.getByLabelText('تکرار رمز عبور')).toBeInTheDocument();
    expect(screen.getByLabelText('تاریخ تولد')).toBeInTheDocument();
    expect(screen.getByLabelText('جنسیت')).toBeInTheDocument();
  });

  it('shows a validation error when passwords do not match', async () => {
    const user = userEvent.setup();
    render(<RegisterListenerForm />);

    await user.type(screen.getByLabelText('نام نمایشی'), 'Test User');
    await user.type(screen.getByLabelText('ایمیل'), 'test@example.com');
    await user.type(screen.getByLabelText('رمز عبور'), 'password123');
    await user.type(screen.getByLabelText('تکرار رمز عبور'), 'password456');
    await user.type(screen.getByLabelText('تاریخ تولد'), '2000-01-01');
    await user.selectOptions(screen.getByLabelText('جنسیت'), 'other');
    await user.click(screen.getByRole('checkbox'));

    await user.click(screen.getByRole('button', { name: 'ثبت‌نام' }));

    await waitFor(() => {
      expect(screen.getByText('رمز عبور و تکرار آن مطابقت ندارند')).toBeInTheDocument();
    });
  });
});
