import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Layout
import PetOwnersLayout from './app/(liff)/pet-owners/layout';

// Auth Pages
import AuthCallbackPage from './app/auth/callback/page';
import LoginPage from './app/(liff)/pet-owners/(authen)/login-page/page';
import RegisterPage from './app/(liff)/pet-owners/(authen)/register-page/page';

// Main Pages
import HomePage from './app/(liff)/pet-owners/home-page/page';
import CalendarPage from './app/(liff)/pet-owners/calendar-page/page';
import MedicationPage from './app/(liff)/pet-owners/medication-page/page';
import NotificationPage from './app/(liff)/pet-owners/notification-page/page';
import HelpCenterPage from './app/(liff)/pet-owners/help-center-page/page';

// Owner Info
import OwnerInfoPage from './app/(liff)/pet-owners/owner-info-page/page';
import EditOwnerInfoPage from './app/(liff)/pet-owners/owner-info-page/edit/page';

// My Pets
import MyPetsPage from './app/(liff)/pet-owners/my-pets-page/page';
import AddNewPetPage from './app/(liff)/pet-owners/my-pets-page/add-new-pet/page';
import PetDetailPage from './app/(liff)/pet-owners/my-pets-page/[pet_id]/page';
import EditPetPage from './app/(liff)/pet-owners/my-pets-page/[pet_id]/edit/page';
import PetAppointmentsPage from './app/(liff)/pet-owners/my-pets-page/[pet_id]/appointments/page';
import PetMedicationsPage from './app/(liff)/pet-owners/my-pets-page/[pet_id]/medications/page';
import PetSymptomsPage from './app/(liff)/pet-owners/my-pets-page/[pet_id]/symptoms/page';

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/pet-owners/login-page" replace />} />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />

                <Route path="/login" element={<Navigate to="/pet-owners/login-page" replace />} />

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
            </Routes>
        </Router>
    );
}
