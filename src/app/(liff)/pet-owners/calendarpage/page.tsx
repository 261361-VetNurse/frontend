 "use client"

import {AppointmentPage} from "@/components/calendarpage/AppointmentPage";
import PetList from "@/components/calendarpage/PetList";
import Calendar from "@/components/calendarpage/Calendar"
import "react-day-picker/dist/style.css";
import styled from "styled-components";
import ReminderBox from "@/components/pet-owners/homepage/reminder-box";
import AppointmentBox from "@/components/pet-owners/homepage/appoint-box";

const BoxBody = styled.div`
    width: 100%;
    background: red;
    padding: 8px 24px;
    flex-direction: column;
    align-items: center;

    .head {
        color: #000;
        font-size: 18px;
        font-weight: 500;
        margin-top: 10px;
    }
`;
export default function Page() {
    return(
        <BoxBody>
            <AppointmentPage/>
            <PetList/>
            <Calendar/>
            <div className="head">Upcoming appointments</div>
           <AppointmentBox/>
        </BoxBody>
    );
}
