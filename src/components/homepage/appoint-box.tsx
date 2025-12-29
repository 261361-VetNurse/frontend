import styled from "styled-components";
import ProflieCom from "@/components/homepage/pet-proflie";

const AppointBox = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 18px 20px;
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);

    .top-row{
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .name{
        color: #000;
        font-size: 16px;
        font-weight: 500;
    }
    .name-location{
        display: flex;
        flex-direction: column;
        gap: 3px;
    }
    .location-row{
        display: flex;
        align-items: center;
        gap: 4px;
        color: #666;
        font-size: 16px;
    }
    .location-icon{
        width: 16px;
        height: 16px;
    }
    .location-text{
        color: #3C3C3C;
        font-size: 13px;
        font-weight: 275;
    }
    .meta-row{
        display: flex;
        align-items: center;
        color: #666;
    }
    .meta-item{
        display: flex;
        align-items: center;
        gap: 8px;
        padding-left: 16px;
        padding-right: 16px;
    }
    .meta-icon{
        width: 24px;
        height: 24px;
    }
    .meta-text{
        color: #797979;
        font-size: 14px;
        font-weight: 500;
    }
`;

export default function AppointmentBox() {
    return(
        <AppointBox>
            <div className="top-row">
                <ProflieCom showName={false} size={56}/>
                <div className="name-location">
                    <div className="name">Lee</div>
                    <div className="location-row">
                        <img className="location-icon" src="/location.svg" alt="location" />
                        <span className="location-text">ห้องอัลตร้าซาวด์</span>
                    </div>
                </div>
            </div>
            <div className="meta-row">
                <div className="meta-item">
                    <img className="meta-icon" src="/calendar.svg" alt="calendar" />
                    <div className="meta-text">17/12/2025</div>
                </div>
                <div className="meta-item">
                    <img className="meta-icon" src="/clock.svg" alt="time" />
                    <div className="meta-text">11.00 - 12.00 น.</div>
                </div>
            </div>
        </AppointBox>
    )
}
