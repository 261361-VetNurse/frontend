import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MedicationPage from '../MedicationPage/MedicationPage';

const mocks = vi.hoisted(() => ({
  getMedications: vi.fn(),
  getMedicineDetail: vi.fn(),
  push: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
  useSearchParams: () => new URLSearchParams('tab=today&noti_id=noti_001&med_id=med_001&open=edit'),
}));

vi.mock('@/hooks', () => ({
  usePets: () => ({ pets: [{ _id: '430242', name: 'Mochi', profile_image: '' }], loading: false }),
}));

vi.mock('@/services/api/client', () => ({
  authStorage: { getToken: vi.fn(() => 'mock_token') },
  getMedications: mocks.getMedications,
  getMedicineDetail: mocks.getMedicineDetail,
  createMedicine: vi.fn(),
  deleteMedicine: vi.fn(),
  markMedicationTaken: vi.fn(),
}));

vi.mock('@/components/pet-owners/shared/Tabs', () => ({
  Tabs: () => <div>tabs</div>,
}));
vi.mock('@/components/pet-owners/shared/PetFilterSelector', () => ({
  default: () => <div>pet-selector</div>,
}));
vi.mock('@/components/pet-owners/shared/QuickDialButton', () => ({
  QuickDialButton: () => <button type="button">fab</button>,
}));
vi.mock('../MedicationPage/MedicineCard', () => ({ default: () => <div>medicine-card</div> }));
vi.mock('../MedicationPage/AddMedicationPopup', () => ({ default: () => <div>add-med-popup</div> }));
vi.mock('../MedicationPage/MedicationDetailPopup', () => ({
  default: () => <div>medication-detail-popup</div>,
}));
vi.mock('../MedicationPage/EditMedicationPopup', () => ({
  default: ({ open }: { open: boolean }) => (open ? <div>Edit Medication</div> : null),
}));
vi.mock('@/components/pet-owners/shared/SectionError', () => ({
  default: ({ message }: { message: string }) => <div>{message}</div>,
}));

describe('MedicationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getMedications.mockResolvedValue([]);
    mocks.getMedicineDetail.mockResolvedValue({
      _id: 'med_001',
      user_id: 'user',
      pet_id: '430242',
      medicine_id: 'med_001',
      medicine_name: 'Amoxicillin',
      medicine_dosage: '5ml',
      medicine_frequency: '-1',
      pet_name: 'Mochi',
      pet_image: '',
      reminder_time: ['08:00'],
      created_at: '2026-02-01T00:00:00.000Z',
      updated_at: '2026-02-01T00:00:00.000Z',
    });
  });

  it('opens edit popup from deep link query params', async () => {
    render(<MedicationPage />);

    await waitFor(() => {
      expect(mocks.getMedicineDetail).toHaveBeenCalledWith('mock_token', 'noti_001', 'med_001');
    });

    expect(screen.getByText('Edit Medication')).toBeInTheDocument();
  });

  it('renders empty state when no reminders returned', async () => {
    render(<MedicationPage />);

    await waitFor(() => {
      expect(screen.getByText('No medication reminders.')).toBeInTheDocument();
    });
  });
});
