 "use client"

import {AppointmentPage} from "@/components/pet-owners/CalendarPage/AppointmentPage";
import PetList from "@/components/pet-owners/CalendarPage/PetList";
import Calendar from "@/components/pet-owners/CalendarPage/Calendar"
import "react-day-picker/dist/style.css";
import styled from "styled-components";

const BoxBody = styled.div`
    width: 100%;
    background: red;
    padding: 8px 24px;
    flex-direction: column;
    align-items: center;
`;

export default function Page() {
    return(
        <BoxBody>
            <AppointmentPage/>
            <PetList/>
            <Calendar/>
        </BoxBody>
    );
}
