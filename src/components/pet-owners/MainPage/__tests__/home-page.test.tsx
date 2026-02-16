import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import HomePage from '../HomePage/HomePage';

const mocks = vi.hoisted(() => ({
  getDashboardHome: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/services/api/client', () => ({
  getDashboardHome: mocks.getDashboardHome,
  authStorage: { getToken: vi.fn(() => 'mock_token') },
  markMedicationTaken: vi.fn(),
  getMedicationNotificationDetail: vi.fn(),
  getAppointmentDetail: vi.fn(),
}));

vi.mock('@/styles/components/homepage.styled', () => ({
  HomePageStyled: ({ children }: { children: any }) => <div>{children}</div>,
}));

vi.mock('../HomePage/AppointmentCard', () => ({ default: () => <div>appointment-card</div> }));
vi.mock('../HomePage/ReminderCard', () => ({ default: () => <button type="button">reminder-card</button> }));
vi.mock('../HomePage/MedicationDetailPopup', () => ({ default: () => <div>med-detail</div> }));
vi.mock('../HomePage/AppointmentDetailPopup', () => ({ default: () => <div>apt-detail</div> }));
vi.mock('@/components/pet-owners/shared/NewPet', () => ({ default: () => <button type="button">New Pet</button> }));
vi.mock('@/components/pet-owners/shared/Profile', () => ({ default: () => <div>Profile</div> }));
vi.mock('@/components/pet-owners/shared/SectionError', () => ({
  default: ({ message }: { message: string }) => <div>{message}</div>,
}));

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getDashboardHome.mockResolvedValue({
      success: true,
      data: {
        fname: 'User',
        profile_image: '',
        pets: [],
        medicines_notifications: [],
        appointments: [],
      },
    });
  });

  it('renders section errors when dashboard request fails', async () => {
    mocks.getDashboardHome.mockRejectedValueOnce(new Error('network error'));

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Could not load pets')).toBeInTheDocument();
      expect(screen.getByText('Could not load reminders')).toBeInTheDocument();
      expect(screen.getByText('Could not load appointments')).toBeInTheDocument();
    });
  });

  it('renders empty states when dashboard has no reminders/appointments', async () => {
    mocks.getDashboardHome.mockResolvedValueOnce({
      success: true,
      data: {
        fname: 'User',
        profile_image: '',
        pets: [],
        medicines_notifications: [],
        appointments: [],
      },
    });

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('No upcoming medication reminders.')).toBeInTheDocument();
      expect(screen.getByText('No upcoming appointments.')).toBeInTheDocument();
    });
  });
});
