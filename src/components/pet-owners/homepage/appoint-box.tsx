import styled from "styled-components";
import ProflieCom from "./pet-proflie";

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

export default function AppointmentBox() {
    return(
        <AppointBox>
                <ProflieCom petImage="/pets-example/pet-ex1.svg" showName={false} size={40}/>
                <div className="name-location">
                    <div className="name">Lee</div>
                    <div className="data-row">
                        <img className="data-icon" src="/location.svg" alt="location" />
                        <span className="data-text">ห้องอัลตร้าซาวด์</span>
                    </div>
                    <div className="data-row">
                        <img className="data-icon" src="/calendar.svg" alt="calendar" />
                        <div className="data-text">17/12/2025</div>
                    </div>
                    <div className="data-row">
                        <img className="data-icon" src="/clock.svg" alt="time" />
                        <div className="data-text">11.00 - 12.00 น.</div>
                    </div>
                </div>
                
        </AppointBox>
    )
}
