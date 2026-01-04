"use client";

import { HomePageStyled } from "@/styles/homepage.styled";
import PetProflie from "./PetProfile";
import ReminderBox from "./ReminderBox";
import AppointmentBox from "./AppointBox";
import { useRouter } from "next/dist/client/components/navigation";


export default function HomePage({username}: {username: string}) {
    const router = useRouter();

    return(
        <HomePageStyled>
            <div className="header-box">
                <img src="/Ava.svg" alt="Ava" />
                <span>Hi! {username}</span>
                <img src="/help.svg" alt="help" className="ml-auto" onClick={() => router.push('/pet-owners/help-center-page')} style={{ cursor: "pointer" }} />
            </div>
            <div className="head-section">
                <div className="head-right">My Pets</div>
                <div 
                    className="head-left"
                    onClick={() => router.push('/pet-owners/my-pets-page')}>
                    <div className="sub">show all</div>
                    <img src="/next-icon.svg" alt="next-icon" />
                </div>
            </div>
            <div className="pet-list" >
                <PetProflie petName="Lee" petImage="/pets-example/pet-ex1.svg"/>
                <PetProflie petName="Lee" petImage="/pets-example/pet-ex1.svg"/>
                <PetProflie petName="Lee" petImage="/pets-example/pet-ex1.svg"/>
                <PetProflie petName="Lee" petImage="/pets-example/pet-ex1.svg"/>
                <PetProflie petName="New Pet"/>
            </div>
            <div className="head-section">
                <div className="head-right">Reminder</div>
                <div 
                    className="head-left"
                    onClick={() => router.push('/pet-owners/calendar-page?tab=record')}>
                    <div className="sub">show all</div>
                    <img src="/next-icon.svg" alt="next-icon" />
                </div>
            </div>
            <div className="reminder-box">
                <ReminderBox/>
                <ReminderBox/>
                <ReminderBox/>
                <ReminderBox/>
                <ReminderBox/>
            </div>
            <div className="head-section">
                <div className="head-right">Upcoming appointments</div>
                <div 
                    className="head-left"
                    onClick={() => router.push('/pet-owners/calendar-page?tab=appointment')}>
                    <div className="sub">show all</div>
                    <img src="/next-icon.svg" alt="next-icon" />
                </div>
            </div>
            <div className="appoint-box">
                <AppointmentBox/>
                <AppointmentBox/>
            </div>
        </HomePageStyled>
    );
}
