"use client";

import styled from "styled-components";
import PetProflie from "./pet-proflie";
import ReminderBox from "./reminder-box";
import AppointmentBox from "./appoint-box";

const HomePageStyled = styled.div `
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    width: 100%;

    .header-box{
        width: 100%;
        height: 50px;
        gap: 10px;
        display: flex;
        align-items: center;
        span {
            font-size: 18px;
            color: #000;
        }
    }
    .head-section{
        width: 100%;
        background-color: #F7F7F7;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: #000;

        .head {
            color: #000;
            font-size: 18px;
            font-weight: 500;
        }

        .sub {
            color: #000000ae;
            font-size: 14px;
            font-weight: 500;
        }
    }
    .pet-list{
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: #F7F7F7;
    }
`;

export default function HomePage({username}: {username: string}) {
    return(
        <HomePageStyled>
            <div className="header-box">
                <img src="/Ava.svg" alt="Ava" />
                <span>Hi! {username}</span>
                <img src="/help.svg" alt="help" className="ml-auto" />
            </div>
            <div className="head-section">
                <div className="head">My Pets</div>
                <div className="flex items-center gap-[4px]">
                    <div className="sub">show all</div>
                    <img src="/next-icon.svg" alt="next-icon" />
                </div>
            </div>
            <div className="pet-list" >
                <PetProflie petName="Lee" petImage="/pet-ex1.svg"/>
                <PetProflie petName="Lee" petImage="/pet-ex1.svg"/>
                <PetProflie petName="Lee" petImage="/pet-ex1.svg"/>
                <PetProflie petName="Lee" petImage="/pet-ex1.svg"/>
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
