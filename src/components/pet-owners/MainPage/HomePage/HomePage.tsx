"use client";

import { HomePageStyled } from "@/styles/homepage.styled";
import ReminderBox from "./ReminderBox";
import AppointmentBox from "./AppointBox";
import { useRouter } from "next/dist/client/components/navigation";
import NewPetButton from "@/components/pet-owners/MainPage/MyPetsPage/NewPet";
import Profile from "@/components/pet-owners/shared/Profile";
import { mockPets } from "@/mocks/pets.mock"
import { Pet } from "@/types/pet";
import { mockMedicineReminders } from "@/mocks/medicine-reminders.mock";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { theme } from "@/styles/theme";
import {MedicineReminderVM} from "@/types/medicine-reminder";

export default function HomePage({username}: {username: string}) {
    const router = useRouter();

    return(
        <HomePageStyled>
            <div className="header-box">
                <Profile imageUrl={'/images/profile-test.png'} size={50} href={'/pet-owners/owner-info-page'} />
                <span>Hi! {username}</span>
                <HelpOutlineIcon
                    sx={{
                        ml: 'auto',
                        fontSize: 22,
                        color: theme.colors.textSecondary,
                        cursor: 'pointer',
                    }}
                    onClick={() => router.push('/pet-owners/help-center-page')}
                />
            </div>
            <div className="head-section">
                <div className="head-right">My Pets</div>
                <div 
                    className="head-left"
                    onClick={() => router.push('/pet-owners/my-pets-page')}>
                        <div className="sub">show all</div>
                        <ArrowForwardIosIcon
                            sx={{
                                ml: 'auto',
                                fontSize: 16,
                                color: theme.colors.textSecondary,
                                cursor: 'pointer',
                            }}
                            onClick={() => router.push('/pet-owners/help-center-page')}
                        />
                </div>
            </div>
            <div className="mypet-section">
                <div className="pet-list">
                    {mockPets.map((pet:Pet,index: number) => (
                        <Profile key={index} imageUrl={pet.image_url} size={60} label={pet.name} showLabel={true} />
                    ))}
                </div>
                <NewPetButton />
            </div>
            <div className="head-section">
                <div className="head-right">Reminder</div>
                <div 
                    className="head-left"
                    onClick={() => router.push('/pet-owners/medication-page')}>
                        <div className="sub">show all</div>
                        <ArrowForwardIosIcon
                            sx={{
                                ml: 'auto',
                                fontSize: 16,
                                color: theme.colors.textSecondary,
                                cursor: 'pointer',
                            }}
                            onClick={() => router.push('/pet-owners/help-center-page')}
                        />
                </div>
            </div>
            <div className="reminder-box">
                {mockMedicineReminders.map((mockMedicineReminder:MedicineReminderVM, index: number) => (
                    <div key={index} onClick={() => router.push('/pet-owners/medication-page')}>
                        <ReminderBox
                            petImageUrl={mockMedicineReminder.pet.image_url}
                            petImageSize={40} medicineName={mockMedicineReminder.medicine.name}
                            petName={mockMedicineReminder.pet.name}
                            timeLabel={mockMedicineReminder.schedule.time}
                            dateLabel={mockMedicineReminder.schedule.date} />
                    </div>
                ))}
            </div>
            <div className="head-section">
                <div className="head-right">Upcoming appointments</div>
                <div 
                    className="head-left"
                    onClick={() => router.push('/pet-owners/calendar-page?tab=appointment')}>
                        <div className="sub">show all</div>
                        <ArrowForwardIosIcon
                            sx={{
                                ml: 'auto',
                                fontSize: 16,
                                color: theme.colors.textSecondary,
                                cursor: 'pointer',
                            }}
                            onClick={() => router.push('/pet-owners/help-center-page')}
                        />
                </div>
            </div>
            <div className="appoint-box">
                <AppointmentBox/>
                <AppointmentBox/>
            </div>
        </HomePageStyled>
    );
}
