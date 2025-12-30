import styled from "styled-components";
import ProflieCom from "@/components/pet-owners/homepage/pet-proflie";

const ReminBox = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background-color: #FFF;
    cursor: pointer;
    border-radius: 8px;

    &:active{
        background-color: #F0F0F0;
    }
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
            <ProflieCom petImage="/pets-example/pet-ex1.svg" showName={false} size={40} />
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
