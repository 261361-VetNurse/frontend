import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

import PageSkeleton from '@/components/shared/PageSkeleton';

// ── Layout (not lazy — small, always needed) ─────────────────────────────────
import PetOwnersLayout from './app/(liff)/pet-owners/layout';

// ── Auth Pages ───────────────────────────────────────────────────────────────
const AuthCallbackPage = lazy(() => import('./app/auth/callback/page'));
const LoginPage = lazy(() => import('./app/(liff)/pet-owners/(authen)/login-page/page'));
const RegisterPage = lazy(() => import('./app/(liff)/pet-owners/(authen)/register-page/page'));

// ── Main Pages ───────────────────────────────────────────────────────────────
const HomePage = lazy(() => import('./app/(liff)/pet-owners/home-page/page'));
const CalendarPage = lazy(() => import('./app/(liff)/pet-owners/calendar-page/page'));
const MedicationPage = lazy(() => import('./app/(liff)/pet-owners/medication-page/page'));
const NotificationPage = lazy(() => import('./app/(liff)/pet-owners/notification-page/page'));
const HelpCenterPage = lazy(() => import('./app/(liff)/pet-owners/help-center-page/page'));

// ── Owner Info ───────────────────────────────────────────────────────────────
const OwnerInfoPage = lazy(() => import('./app/(liff)/pet-owners/owner-info-page/page'));
const EditOwnerInfoPage = lazy(() => import('./app/(liff)/pet-owners/owner-info-page/edit/page'));

// ── My Pets ──────────────────────────────────────────────────────────────────
const MyPetsPage = lazy(() => import('./app/(liff)/pet-owners/my-pets-page/page'));
const AddNewPetPage = lazy(() => import('./app/(liff)/pet-owners/my-pets-page/add-new-pet/page'));
const PetDetailPage = lazy(() => import('./app/(liff)/pet-owners/my-pets-page/[pet_id]/page'));
const EditPetPage = lazy(() => import('./app/(liff)/pet-owners/my-pets-page/[pet_id]/edit/page'));
const PetAppointmentsPage = lazy(() => import('./app/(liff)/pet-owners/my-pets-page/[pet_id]/appointments/page'));
const PetMedicationsPage = lazy(() => import('./app/(liff)/pet-owners/my-pets-page/[pet_id]/medications/page'));
const PetSymptomsPage = lazy(() => import('./app/(liff)/pet-owners/my-pets-page/[pet_id]/symptoms/page'));

// ── 404 fallback ─────────────────────────────────────────────────────────────
const NotFoundPage = lazy(() => import('./app/not-found/page'));

export default function App() {
    return (
        <Router>
            {/* Suspense wraps all routes — shows skeleton while any lazy chunk loads */}
            <Suspense fallback={<PageSkeleton />}>
                <Routes>
                    <Route path="/" element={<Navigate to="/pet-owners/login-page" replace />} />
                    <Route path="/login" element={<Navigate to="/pet-owners/login-page" replace />} />
                    <Route path="/auth/callback" element={<AuthCallbackPage />} />

                    <Route path="/pet-owners" element={<PetOwnersLayout><Outlet /></PetOwnersLayout>}>
                        <Route index element={<Navigate to="home-page" replace />} />

                        <Route path="login-page" element={<LoginPage />} />
                        <Route path="register-page" element={<RegisterPage />} />

                        <Route path="home-page" element={<HomePage />} />
                        <Route path="calendar-page" element={<CalendarPage />} />
                        <Route path="medication-page" element={<MedicationPage />} />
                        <Route path="notification-page" element={<NotificationPage />} />
                        <Route path="help-center-page" element={<HelpCenterPage />} />

                        <Route path="owner-info-page">
                            <Route index element={<OwnerInfoPage />} />
                            <Route path="edit" element={<EditOwnerInfoPage />} />
                        </Route>

                        <Route path="my-pets-page">
                            <Route index element={<MyPetsPage />} />
                            <Route path="add-new-pet" element={<AddNewPetPage />} />
                            <Route path=":pet_id">
                                <Route index element={<PetDetailPage />} />
                                <Route path="edit" element={<EditPetPage />} />
                                <Route path="appointments" element={<PetAppointmentsPage />} />
                                <Route path="medications" element={<PetMedicationsPage />} />
                                <Route path="symptoms" element={<PetSymptomsPage />} />
                            </Route>
                        </Route>
                    </Route>

                    {/* ── 404 catch-all ── */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>
        </Router>
    );
}
