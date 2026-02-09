// Domain Types - Main Barrel Export

// Domain Models
export * from './domain/pet';
export * from './domain/medication';
export * from './domain/medication-occurrence';
export * from './domain/appointment';
export * from './domain/owner';
export * from './domain/dashboard';
export * from './domain/medical';

// API DTOs
export * from './api/auth.dto';
export * from './api/medication.dto';
export * from './api/appointment.dto';
export * from './api/pet.dto';
export * from './api/record.dto';
export * from './api/medical.dto';

// UI Props - exported from ui/index.ts to avoid namespace pollution
