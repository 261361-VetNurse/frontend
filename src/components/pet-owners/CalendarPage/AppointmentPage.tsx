"use client";
import React from 'react';
import styled from "styled-components";
import {TabItem, Tabs} from "@/components/pet-owners/common/Tabs";
import {usePathname, useRouter, useSearchParams} from "next/navigation";


const AppointmentPageStyled = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
    margin-bottom: 10px;
`;

export const AppointmentPage = () => {
    const searchParams = useSearchParams();
    const activeParam = searchParams.get('tab');

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
    return (
        <AppointmentPageStyled>
        <Tabs data={appointmentTabs} queryKey={'tab'} onChangeAction={handleChangeTab}/>
            {/* {activeParam === null || activeParam === 'appointment' ? <div>appointment</div> : <div>record</div>} */}
        </AppointmentPageStyled>
    );
};
