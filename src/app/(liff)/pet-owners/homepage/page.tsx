"use client"
import styled from "styled-components";
import ProflieCom from "@/components/homepage/pet-proflie";
import AddProflie from "@/components/homepage/add-proflie";
import ReminderBox from "@/components/homepage/reminder-box";
import AppointmentBox from "@/components/homepage/appoint-box";
import NavBar from "@/components/common/NavBar";

const Box = styled.div `
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: 8px 24px;
    gap: 16px;

    .header-box{
        width: 100%;
        height: 50px;
        background-color: #F7F7F7;
        gap: 10px;
        display: flex;
        align-items: center;
    }
    .body-box{
        width: 100%;
        background-color: #F7F7F7;
        display: flex;
        align-items: center;
    }
    .text{
        color: #000;
        font-size: 18px;
        font-weight: 500;
    }
    .pet-list{
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: #F7F7F7;
    }
`;

export default function HomePage() {
    return(
        <>
            <Box>
                <div className="header-box">
                    <img src="/Ava.svg" alt="Ava" />
                    <span>Hi!</span>
                    <span>username</span>
                    <img src="/help.svg" alt="help" className="ml-auto" />
                </div>
                <div className="body-box">
                    <div className="text">My Pets</div>
                    <div className="ml-auto w-[64px]">show all</div>
                    <img src="/next-icon.svg" alt="next-icon" />
                </div>
                <div className="pet-list" >
                    <ProflieCom/>
                    <ProflieCom/>
                    <ProflieCom/>
                    <ProflieCom/>
                    <AddProflie/>
                </div>
                <div className="body-box">
                    <div className="text">Reminder</div>
                    <div className="ml-auto w-[64px]">show all</div>
                    <img src="/next-icon.svg" alt="next-icon" />
                </div>
                <div>
                    <ReminderBox/>
                    <ReminderBox/>
                </div>
                <div className="body-box">
                    <div className="text">Upcoming appointments</div>
                    <div className="ml-auto w-[64px]">show all</div>
                    <img src="/next-icon.svg" alt="next-icon" />
                </div>
                <div>
                    <AppointmentBox/>
                    <AppointmentBox/>
                </div>
            </Box>
            <NavBar/>
        </>
    );
}
