import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppointments } from './useAppointments';
import { useMedications } from './useMedications';
import { usePets } from './usePets';
import { useSymptomRecords } from './useSymptomRecords';

const mocks = vi.hoisted(() => ({
  getPets: vi.fn(),
  getAppointments: vi.fn(),
  getMedications: vi.fn(),
  getSymptomRecordsCalendar: vi.fn(),
  getToken: vi.fn(),
}));

vi.mock('@/services/api/client', () => ({
  getPets: mocks.getPets,
  getAppointments: mocks.getAppointments,
  getMedications: mocks.getMedications,
  getSymptomRecordsCalendar: mocks.getSymptomRecordsCalendar,
  authStorage: {
    getToken: mocks.getToken,
  },
}));

vi.mock('@/utils/mock-helper', () => ({
  USE_MOCK_DATA: true,
}));

describe('hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getToken.mockReturnValue('mock_token_user_1_long_live');
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => (key === 'auth_token' ? 'mock_token_user_1_long_live' : null)),
      },
      configurable: true,
    });
  });

  it('usePets loads pets data and exposes refetch', async () => {
    mocks.getPets.mockResolvedValue([{ _id: '430242', name: 'Mochi' }]);

    const { result } = renderHook(() => usePets());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.pets).toHaveLength(1);
    await act(async () => {
      await result.current.refetch();
    });
    expect(mocks.getPets).toHaveBeenCalled();
  });

  it('useAppointments loads appointment list', async () => {
    mocks.getAppointments.mockResolvedValue([{ _id: 'apt-001', status: 'upcoming' }]);

    const { result } = renderHook(() => useAppointments('upcoming'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.appointments[0]?._id).toBe('apt-001');
    expect(mocks.getAppointments).toHaveBeenCalledWith('mock_token_user_1_long_live', 'upcoming');
  });

  it('useMedications loads medication list with pet/date filters', async () => {
    mocks.getMedications.mockResolvedValue([{ _id: 'noti_001' }]);

    const { result } = renderHook(() => useMedications('430242', '2026-02-10'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.medications).toHaveLength(1);
    expect(mocks.getMedications).toHaveBeenCalledWith('mock_token_user_1_long_live', '430242', '2026-02-10');
  });

  it('useSymptomRecords flattens calendar response into records', async () => {
    mocks.getSymptomRecordsCalendar.mockResolvedValue({
      '2026-02-10': [
        {
          _id: 'sym_001',
          pet_id: '430242',
          date: '2026-02-10T08:30:00.000Z',
          note: 'Vomited after eating breakfast.',
          images: [],
        },
      ],
    });

    const { result } = renderHook(() => useSymptomRecords('430242'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.records).toHaveLength(1);
    expect(result.current.records[0]?.id).toBe('sym_001');
    expect(result.current.records[0]?.time).toMatch(/^\d{2}:\d{2}$/);
  });
});
