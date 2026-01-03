import styled from "styled-components";
import ProflieCom from "./pet-profile";

const AppointBox = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 16px;
    padding: 16px;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25);

    &:active {
        background-color: #F0F0F0;
    }
    
    .name-location{
        display: flex;
        flex-direction: column;
        gap: 3px;
        .name{
            color: #000;
            font-size: 16px;
            font-weight: 500;
        }

        .data-row{
            display: flex;
            align-items: center;
            gap: 4px;
            color: #666;
            font-size: 16px;

           .data-icon{
                width: 16px;
                height: 16px;
            }
            .data-text{
                color: #3C3C3C;
                font-size: 13px;
                font-weight: 275;
            }
        }
    }
    
`;

type AppointmentBoxProps = {
    petName?: string;
    petImage?: string;
    locationText?: string;
    dateText?: string;
    timeText?: string;
};

export default function AppointmentBox({
    petName = "Lee",
    petImage = "/pets-example/pet-ex1.svg",
    locationText = "ห้องอัลตร้าซาวด์",
    dateText = "1/01/2026",
    timeText = "11.00 - 12.00 น.",
}: AppointmentBoxProps) {
    return(
        <AppointBox>
                <ProflieCom petImage={petImage} showName={false} size={40}/>
                <div className="name-location">
                    <div className="name">{petName}</div>
                    <div className="data-row">
                        <img className="data-icon" src="/location.svg" alt="location" />
                        <span className="data-text">{locationText}</span>
                    </div>
                    <div className="data-row">
                        <img className="data-icon" src="/calendar.svg" alt="calendar" />
                        <div className="data-text">{dateText}</div>
                    </div>
                    <div className="data-row">
                        <img className="data-icon" src="/clock.svg" alt="time" />
                        <div className="data-text">{timeText}</div>
                    </div>
                </div>
                
        </AppointBox>
    )
}
