"use client";
import React, { useState } from 'react';
import styled from "styled-components";
import {TabItem, Tabs} from "@/components/common/Tabs";
import {useSearchParams} from "next/navigation";
import PetList from "@/components/calendarpage/PetList";
import Calendar from "@/components/calendarpage/Calendar";
import AppointmentBox from "@/components/pet-owners/homepage/appoint-box";
import {QuickDialButton} from "@/components/common/QuickDialButton";
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { PopUp } from "@/components/calendarpage/PopUp";

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
        row-gap: 16px;
        padding: 16px;
    }
`;

export const AppointmentPage = () => {
    const searchParams = useSearchParams();
    const activeParam = searchParams.get('tab');
    const [isPopUpOpen, setIsPopUpOpen] = useState(false);
    const isRecordTab = activeParam === 'record';
    const isAppointmentTab = !isRecordTab;

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
    return (
        <AppointmentPageStyled>
            {isAppointmentTab && (
                <>
                    <PopUp open={isPopUpOpen} onOpenChange={setIsPopUpOpen} />
                    <QuickDialButton iconColor='#fff' position={'bottom-right'} icon={<AddRoundedIcon/>} color={'#09BFF8'} onClickAction={handleClick}/>
                </>
            )}
            <div className="scroll-area">
                <Tabs data={appointmentTabs} queryKey={'tab'} onChangeAction={handleChangeTab}/>
                {isAppointmentTab ? (
                    <>
                        <PetList/>
                        <Calendar/>
                        <div className="head">Upcoming appointments</div>
                        <AppointmentBox/>
                        <AppointmentBox/>
                        <AppointmentBox/>
                    </>
                ) : (
                    <div className="head">No records yet</div>
                )}
            </div>

                {/* {activeParam === null || activeParam === 'appointment' ? <div>appointment</div> : <div>record</div>} */}
        </AppointmentPageStyled>
    );
};
