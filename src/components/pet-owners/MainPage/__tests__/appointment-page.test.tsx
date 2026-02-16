import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AppointmentPage from '../CalendarPage/appointment/AppointmentPage';

const refetchMock = vi.fn();
const mockReplace = vi.fn();
let appointmentsData: any[] = [];

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: vi.fn() }),
  useSearchParams: () => new URLSearchParams('tab=appointment&appointment_id=apt-001&open=edit'),
}));

vi.mock('@/hooks/useAppointments', () => ({
  useAppointments: () => ({
    appointments: appointmentsData,
    loading: false,
    error: null,
    refetch: refetchMock,
  }),
}));

vi.mock('@/services/api/client', () => ({
  authStorage: { getToken: vi.fn(() => 'mock_token') },
  createAppointment: vi.fn(),
  editAppointment: vi.fn(),
  cancelAppointment: vi.fn(),
  deleteAppointment: vi.fn(),
  getAppointmentDetail: vi.fn(async () => null),
}));

vi.mock('@/components/pet-owners/shared/CalendarModule', () => ({
  default: () => <div>calendar-module</div>,
}));
vi.mock('../CalendarPage/appointment/AppointmentCard', () => ({
  default: () => <div>appointment-card</div>,
}));
vi.mock('@/components/pet-owners/shared/appointment/AddAppointmentPopup', () => ({
  default: () => <div>add-appointment-popup</div>,
}));
vi.mock('@/components/pet-owners/shared/appointment/AppointmentDetail', () => ({
  default: () => <div>appointment-detail</div>,
}));
vi.mock('@/components/pet-owners/shared/appointment/EditAppointment', () => ({
  default: ({ open }: { open: boolean }) => (open ? <div>Edit Appointment</div> : null),
}));
vi.mock('@/components/pet-owners/shared/QuickDialButton', () => ({
  QuickDialButton: () => <button type="button">fab</button>,
}));
vi.mock('@/components/pet-owners/shared/SectionError', () => ({
  default: ({ message }: { message: string }) => <div>{message}</div>,
}));

describe('AppointmentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    appointmentsData = [
      {
        appointment_id: 1,
        pet_id: 430242,
        pet_name: 'Mochi',
        pet_image: '',
        appointment_date: '2026-02-10T10:00:00.000Z',
        location: 'Novel CMU',
        status: 'Upcoming',
      },
    ];
  });

  it('opens edit dialog when deep-link params are present', async () => {
    render(<AppointmentPage selectedPetId={0} allPets={[]} />);

    await waitFor(() => {
      expect(screen.getByText('Edit Appointment')).toBeInTheDocument();
    });
  });

  it('shows empty-state text for selected date with no cards', async () => {
    appointmentsData = [];
    render(<AppointmentPage selectedPetId={0} allPets={[]} />);
    expect(await screen.findByText('No appointments on this date')).toBeInTheDocument();
  });
});
