import styled from "styled-components";
import ProflieCom from "@/components/homepage/pet-proflie";

const ReminBox = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    border-radius: 12px;
    background-color: #FFF;
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);
    margin-bottom: 3px;
`;

const ReminderText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;

    .title{
        color: rgba(0, 0, 0, 0.90);
        font-size: 16px;
        font-weight: 400;
    }
    .time-text{
        color: rgba(0, 0, 0, 0.70);
        font-size: 12px;
        font-weight: 300;
    }
    .time-row{
        display: inline-flex;
        align-items: center;
        gap: 4px;
    }
`;

export default function ReminderBox() {
    return(
        <ReminBox>
            <ProflieCom showName={false} size={48} />
            <ReminderText>
                <div className="title">Lee อย่าลืมทานยา ABO 250 mg</div>
                <div className="time-row time-text">
                    <img src="/clock.svg" alt="clock" />
                    <span>Today,</span>
                    <span>9:45 AM.</span>
                </div>
            </ReminderText>
        </ReminBox>
    );
}