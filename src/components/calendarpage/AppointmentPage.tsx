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
import AppointmentPopDone from "@/components/calendarpage/AppointmentPopDone";

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
    .appointment-card{
        border: none;
        background: transparent;
        padding: 0;
        text-align: left;
        cursor: pointer;
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
    const [selectedAppointment, setSelectedAppointment] = useState<{
        dateKey: string;
        pet: string;
        time: string;
        location: string;
    } | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const isRecordTab = activeParam === 'record';
    const isAppointmentTab = !isRecordTab;
    const today = dayjs();
    const todayKey = today.format("YYYY-MM-DD");

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
    const handleOpenAppointment = (appointment: {
        dateKey: string;
        pet: string;
        time: string;
        location: string;
    }) => {
        setSelectedAppointment(appointment);
        setIsDetailOpen(true);
    }
    const handleDeleteAppointment = (appointment: {
        dateKey: string;
        pet: string;
        time: string;
        location: string;
    }) => {
        setAppointments((prev) => prev.filter((item) => item !== appointment));
        setIsDetailOpen(false);
        setSelectedAppointment(null);
    }
    const upcomingAppointments = React.useMemo(() => {
        return appointments
            .filter((appointment) => appointment.dateKey >= todayKey)
            .sort((a, b) => {
                if (a.dateKey === b.dateKey) {
                    return a.time.localeCompare(b.time);
                }
                return a.dateKey.localeCompare(b.dateKey);
            });
    }, [appointments, todayKey]);
    const upcomingAppointmentsByDate = React.useMemo(() => {
        const map: Record<string, typeof appointments> = {};
        upcomingAppointments.forEach((appointment) => {
            if (!map[appointment.dateKey]) {
                map[appointment.dateKey] = [];
            }
            map[appointment.dateKey].push(appointment);
        });
        return Object.entries(map)
            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
            .map(([dateKey, items]) => ({
                dateKey,
                items,
            }));
    }, [upcomingAppointments]);
    const appointmentPetsByDate = React.useMemo(() => {
        const map: Record<string, string[]> = {};
        upcomingAppointments.forEach(({ dateKey, pet }) => {
            if (!map[dateKey]) {
                map[dateKey] = [pet];
                return;
            }
            if (!map[dateKey].includes(pet)) {
                map[dateKey].push(pet);
            }
        });
        return map;
    }, [upcomingAppointments]);
    return (
        <AppointmentPageStyled>
            {isAppointmentTab && (
                <>
                    <PopUp
                        open={isPopUpOpen}
                        onOpenChange={setIsPopUpOpen}
                        onCreateAppointment={handleCreateAppointment}
                    />
                    <AppointmentPopDone
                        open={isDetailOpen}
                        appointment={selectedAppointment || undefined}
                        onClose={() => setIsDetailOpen(false)}
                        onDelete={handleDeleteAppointment}
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
                        {upcomingAppointmentsByDate.map(({ dateKey, items }) => (
                            <React.Fragment key={dateKey}>
                                <div className="date-text">
                                    {dayjs(dateKey).format("ddd, DD/MM/YYYY")}
                                </div>
                                <div className="line"> .</div>
                                {items.map((appointment, index) => (
                                    <button
                                        key={`${appointment.dateKey}-${appointment.pet}-${index}`}
                                        type="button"
                                        className="appointment-card"
                                        onClick={() => handleOpenAppointment(appointment)}
                                    >
                                        <AppointmentBox
                                            petName={appointment.pet}
                                            locationText={appointment.location}
                                            dateText={dayjs(appointment.dateKey).format("DD/MM/YYYY")}
                                            timeText={appointment.time}
                                        />
                                    </button>
                                ))}
                            </React.Fragment>
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
