"use client"

import styled from "styled-components";

const AppointWrap = styled.div`
    display: flex;
    padding: 8px 24px;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    background-color: red;

    .button-box{
        padding: 4px 8px;
        justify-content: center;
        gap: 10px;
        flex: 1 0 0;
        display: flex;
        align-items: center;
        gap: 8px;
        align-self: stretch;
        border-radius: 50px;
        background: var(--Theme, #09BFF8);
    }
`;

export default function AppointmentPage() {
    return(
        <AppointWrap>
            <div className="button-box">
                <div className="button">Appointment</div>
            </div>
        </AppointWrap>
    );
}