 "use client"

import {AppointmentPage} from "@/components/calendarpage/AppointmentPage";
import PetList from "@/components/calendarpage/PetList";
import Calendar from "@/components/calendarpage/Calendar"
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
