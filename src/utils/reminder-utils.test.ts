import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  buildOccurrencesForDate,
  formatTimeForDisplay,
  getTodayInLocalTimezone,
  getUserTimezone,
  updateReminderTakenStatus,
} from './reminder-utils';
import type { MedicineReminderVM } from '@/types/domain/medication';

describe('reminder-utils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-10T09:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns expected user timezone', () => {
    expect(getUserTimezone()).toBe('Asia/Bangkok');
  });

  it('formats 24h time to 12h display', () => {
    expect(formatTimeForDisplay('00:05')).toBe('12:05 AM');
    expect(formatTimeForDisplay('12:30')).toBe('12:30 PM');
    expect(formatTimeForDisplay('23:45')).toBe('11:45 PM');
  });

  it('builds medication occurrences and applies override status', () => {
    const reminders: MedicineReminderVM[] = [
      {
        _id: 'noti_001',
        user_id: 'user_1',
        pet_id: '430242',
        medicine_id: 'med_001',
        medicine_name: 'Amoxicillin',
        medicine_dosage: '5ml',
        medicine_frequency: '-1',
        pet_name: 'Mochi',
        pet_image: '/pets-example/pet-ex1.svg',
        reminder_time: ['08:00', '20:00'],
        created_at: '2026-02-01T00:00:00.000Z',
        updated_at: '2026-02-01T00:00:00.000Z',
      },
    ];

    const date = new Date('2026-02-10T00:00:00.000Z');
    const overrideId = 'noti_001_2026-02-10_20:00';

    const occurrences = buildOccurrencesForDate(reminders, date, {
      [overrideId]: { status: 'taken', taken_at: '2026-02-10T20:00:00.000Z' },
    });

    expect(occurrences).toHaveLength(2);
    expect(occurrences[0]?.plan_id).toBe('noti_001');
    expect(occurrences[1]?.reminder_id).toBe(overrideId);
    expect(occurrences[1]?.status).toBe('taken');
  });

  it('returns start-of-day in configured timezone', () => {
    const localDay = getTodayInLocalTimezone();
    expect(localDay.getHours()).toBe(0);
    expect(localDay.getMinutes()).toBe(0);
  });

  it('keeps reminder list unchanged when updating taken status helper', () => {
    const reminders: MedicineReminderVM[] = [
      {
        _id: 'noti_001',
        user_id: 'user_1',
        pet_id: '430242',
        medicine_id: 'med_001',
        medicine_name: 'Amoxicillin',
        medicine_dosage: '5ml',
        medicine_frequency: '-1',
        pet_name: 'Mochi',
        pet_image: '/pets-example/pet-ex1.svg',
        reminder_time: ['08:00'],
        created_at: '2026-02-01T00:00:00.000Z',
        updated_at: '2026-02-01T00:00:00.000Z',
      },
    ];

    expect(updateReminderTakenStatus(reminders, 'noti_001', 'rid', true)).toBe(reminders);
  });
});
