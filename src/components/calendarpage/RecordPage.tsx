"use client";
import { useState } from "react";
import dayjs from "dayjs";
import styled from "styled-components";
import { Tabs } from "@/components/common/Tabs";
import PetList from "@/components/calendarpage/PetList";
import Calendar from "@/components/calendarpage/Calendar";
import { QuickDialButton } from "../common/QuickDialButton";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

const RecordPageStyled = styled.div`
    width: 100%;
    height: calc(100vh - 60px);
    overflow: hidden;
    position: relative;

    .scroll-area {
        height: 100%;
        overflow: auto;
        display: flex;
        flex-direction: column;
        row-gap: 10px;
        padding: 16px;
    }
    .head-text{
        color: #000;
        font-size: 18px;
        font-weight: 500;
    }
    .date-text{
        color: #000;
        font-size: 14px;
        font-weight: 500;
    }
    .line{
        width: 345px;
        height: 1px;
        background: rgba(0, 0, 0, 0.20);
    }
    .record-card{
        border: none;
        background: transparent;
        padding: 0;
        text-align: left;
        cursor: pointer;
    }
`;

const recordTabs = [
    {
        name: "Appointment",
        path: "/appointment",
        params: "appointment",
    },
    {
        name: "Record",
        path: "/record",
        params: "record",
    },
];

export const RecordPage = () => {
    const [selectedPetId, setSelectedPetId] = useState("all");
    const handleClick = () => {
        console.log("handleClick");
    };

    return (
        <RecordPageStyled>
            <div className="scroll-area">
                <Tabs data={recordTabs} queryKey="tab" />
                <PetList
                    pets={[]}
                    selectedPetId={selectedPetId}
                    onSelectPet={setSelectedPetId}
                />
                <Calendar appointmentPetsByDate={{}} />
                <div className="head-text">Today record</div>
                <div className="date-text">
                    {dayjs("2026-01-03").format("ddd, DD/MM/YYYY")}
                </div>
                <div className="line"> .</div>
            </div>
            <QuickDialButton iconColor='#fff' position={'bottom-right'} icon={<AddRoundedIcon/>} color={'#09BFF8'} onClickAction={handleClick}/>
        </RecordPageStyled>
    );
};
