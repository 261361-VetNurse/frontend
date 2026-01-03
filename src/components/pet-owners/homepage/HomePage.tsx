"use client";

import { HomePageStyled } from "@/styles/homepage.styled";
import PetProflie from "./pet-proflie";
import ReminderBox from "./reminder-box";
import AppointmentBox from "./appoint-box";
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
                <div className="head">My Pets</div>
                <div className="flex items-center gap-[4px]">
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
                <div className="head">Reminder</div>
                <div className="flex items-center gap-[4px]">
                    <div className="sub">show all</div>
                    <img src="/next-icon.svg" alt="next-icon" />
                </div>
            </div>
            <div className="flex flex-col rounded-[8px] gap-[2px] overflow-hidden">
                <ReminderBox/>
                <ReminderBox/>
                <ReminderBox/>
                <ReminderBox/>
                <ReminderBox/>
            </div>
            <div className="head-section">
                <div className="head">Upcoming appointments</div>
                <div className="flex items-center gap-[4px]">
                    <div className="sub">show all</div>
                    <img src="/next-icon.svg" alt="next-icon" />
                </div>
            </div>
            <div className="flex flex-col gap-[8px]">
                <AppointmentBox/>
                <AppointmentBox/>
            </div>
        </HomePageStyled>
    );
}
