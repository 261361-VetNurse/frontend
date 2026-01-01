"use client";
import React, { useState } from 'react';
import dayjs from "dayjs";
import styled from "styled-components";
import {TabItem, Tabs} from "@/components/common/Tabs";
import {useSearchParams} from "next/navigation";
import PetList from "@/components/calendarpage/PetList";
import Calendar from "@/components/calendarpage/Calendar";
import AppointmentBox from "@/components/pet-owners/homepage/appoint-box";
import {QuickDialButton} from "@/components/common/QuickDialButton";
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { PopUp } from "@/components/calendarpage/AppointmentPopUp";

const AppointmentPageStyled = styled.div`
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
`;

export const AppointmentPage = () => {
    const searchParams = useSearchParams();
    const activeParam = searchParams.get('tab');
    const [isPopUpOpen, setIsPopUpOpen] = useState(false);
    const [appointments, setAppointments] = useState<{
        dateKey: string;
        pet: string;
        time: string;
        location: string;
    }[]>([]);
    const isRecordTab = activeParam === 'record';
    const isAppointmentTab = !isRecordTab;
    const today = dayjs();
    const todayKey = today.format("YYYY-MM-DD");
    const todayLabel = today.format("ddd, DD/MM/YYYY");

    const appointmentTabs = [{
        name: "Appointment",
        path: "/appointment",
        params: 'appointment'
    },{
        name: "Record",
        path: "/record",
        params: 'record'
    }]
    const handleChangeTab = (tab:TabItem,index:number) => {
        console.log('handleChangeTab',tab,index);
    }
    console.log('activeParam',activeParam);
    const handleClick = () => {
        console.log('handleClick');
        setIsPopUpOpen(true);
    }
    const handleCreateAppointment = ({
        date,
        pet,
        time,
        location,
    }: {
        date: Date;
        pet: string;
        time: string;
        location: string;
    }) => {
        const dateKey = dayjs(date).format("YYYY-MM-DD");
        setAppointments((prev) => ([...prev, { dateKey, pet, time, location }]));
    }
    const futureAppointments = React.useMemo(() => {
        return appointments
            .filter((appointment) => appointment.dateKey > todayKey)
            .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
    }, [appointments, todayKey]);
    const appointmentPetsByDate = React.useMemo(() => {
        const map: Record<string, string[]> = {};
        futureAppointments.forEach(({ dateKey, pet }) => {
            if (!map[dateKey]) {
                map[dateKey] = [pet];
                return;
            }
            if (!map[dateKey].includes(pet)) {
                map[dateKey].push(pet);
            }
        });
        return map;
    }, [futureAppointments]);
    return (
        <AppointmentPageStyled>
            {isAppointmentTab && (
                <>
                    <PopUp
                        open={isPopUpOpen}
                        onOpenChange={setIsPopUpOpen}
                        onCreateAppointment={handleCreateAppointment}
                    />
                    <QuickDialButton iconColor='#fff' position={'bottom-right'} icon={<AddRoundedIcon/>} color={'#09BFF8'} onClickAction={handleClick}/>
                </>
            )}
            <div className="scroll-area">
                <Tabs data={appointmentTabs} queryKey={'tab'} onChangeAction={handleChangeTab}/>
                {isAppointmentTab ? (
                    <>
                        <PetList/>
                        <Calendar appointmentPetsByDate={appointmentPetsByDate}/>
                        <div className="head-text">Upcoming appointments</div>
                        <div className="date-text">{todayLabel}</div>
                        <div className="line">-</div>
                        {futureAppointments.map((appointment, index) => (
                            <AppointmentBox
                                key={`${appointment.dateKey}-${appointment.pet}-${index}`}
                                petName={appointment.pet}
                                locationText={appointment.location}
                                dateText={dayjs(appointment.dateKey).format("DD/MM/YYYY")}
                                timeText={appointment.time}
                            />
                        ))}
                    </>
                ) : (
                    <div className="head-text">No records yet</div>
                )}
            </div>

                {/* {activeParam === null || activeParam === 'appointment' ? <div>appointment</div> : <div>record</div>} */}
        </AppointmentPageStyled>
    );
};
