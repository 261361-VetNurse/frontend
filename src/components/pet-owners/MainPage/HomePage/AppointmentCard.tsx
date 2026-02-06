import styled from "styled-components";
import Profile from "@/components/pet-owners/shared/Profile";
import { DashboardAppointmentNotification } from "@/types";

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
    datas: DashboardAppointmentNotification;
    petImageSize?: number;
    onClick?: () => void;
};

export default function AppointmentCard({
    datas,
    petImageSize = 40,
    onClick
}: AppointmentCardProps & { onClick?: () => void }) {
    const dateObj = new Date(datas.appointment_date);
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    return (
        <CardContainer onClick={onClick}>
            <Profile imageUrl={datas.pet_image} size={petImageSize} />
            <div className="name-location">
                <div className="name">{datas.pet_name}</div>
                <div className="data-row">
                    <img className="data-icon" src="/location.svg" alt="location" />
                    <span className="data-text">{datas.location}</span>
                </div>
                <div className="data-row">
                    <img className="data-icon" src="/calendar.svg" alt="calendar" />
                    <div className="data-text">{dateObj.toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    })}</div>
                </div>
                <div className="data-row">
                    <img className="data-icon" src="/clock.svg" alt="time" />
                    <div className="data-text">{timeStr}</div>
                </div>
            </div>

        </CardContainer>
    )
}
