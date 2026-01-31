import styled from "styled-components";
import { Appointment } from "@/types/domain/appointment";
import Profile from "@/components/pet-owners/shared/Profile";

const CardContainer = styled.div`
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
        min-width: 0;
        .name{
            color: #000;
            font-size: 16px;
            font-weight: 500;
            overflow-wrap: anywhere;
            word-break: break-word;
        }

        .data-row{
            display: flex;
            align-items: center;
            gap: 4px;
            color: #666;
            font-size: 16px;
            min-width: 0;

           .data-icon{
                width: 16px;
                height: 16px;
            }
            .data-text{
                color: #3C3C3C;
                font-size: 13px;
                font-weight: 275;
                flex: 1;
                min-width: 0;
                overflow-wrap: anywhere;
                word-break: break-word;
            }
        }
    }
    
`;

type AppointmentCardProps = {
    appointment: Appointment;
    petImageUrl?: string;
};

export default function AppointmentCard({
    appointment,
    petImageUrl = "/pets-example/pet-ex1.svg"
}: AppointmentCardProps) {
    return (
        <CardContainer>
            <Profile imageUrl={petImageUrl} size={40} />
            <div className="name-location">
                <div className="name">{appointment.petName}</div>
                <div className="data-row">
                    <img className="data-icon" src="/location.svg" alt="location" />
                    <span className="data-text">{appointment.location}</span>
                </div>
                <div className="data-row">
                    <img className="data-icon" src="/calendar.svg" alt="calendar" />
                    <div className="data-text">{appointment.date}</div>
                </div>
                <div className="data-row">
                    <img className="data-icon" src="/clock.svg" alt="time" />
                    <div className="data-text">{appointment.time}</div>
                </div>
            </div>

        </CardContainer>
    )
}
