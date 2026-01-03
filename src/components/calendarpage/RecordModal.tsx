"use client";

import styled from "styled-components";

const RecordCard = styled.div`
    width: 100%;
    border-radius: 18px;
    background: #fff;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .time{
        align-self: flex-end;
        color: #000;
        font-size: 16px;
        font-weight: 500;
        letter-spacing: 0.2px;
    }

    .divider{
        width: 100%;
        height: 1px;
        background: rgba(0, 0, 0, 0.2);
    }

    .content{
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .avatar{
        width: 64px;
        height: 64px;
        border-radius: 50%;
        object-fit: cover;
        background: #f1f1f1;
        flex: 0 0 auto;
    }

    .details{
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 0;
    }

    .name{
        font-size: 20px;
        font-weight: 600;
        color: #000;
    }

    .note{
        font-size: 14px;
        font-weight: 400;
        color: #4a4a4a;
        line-height: 1.35;
        white-space: pre-line;
    }

    .attachment{
        width: 76px;
        height: 76px;
        border-radius: 16px;
        background: #cfcfcf;
        position: relative;
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    }

    .attachment-dot{
        position: absolute;
        top: 12px;
        left: 12px;
        width: 12px;
        height: 12px;
        border-radius: 999px;
        background: #fff;
    }

    .attachment-icon{
        position: absolute;
        bottom: 8px;
        right: 8px;
        width: 44px;
        height: 44px;
        opacity: 0.65;
    }

    .attachment-count{
        font-size: 22px;
        font-weight: 500;
        color: #5f5f5f;
    }
`;

type RecordModalProps = {
    timeText?: string;
    petName?: string;
    noteText?: string;
    noteLines?: string[];
    petImage?: string;
    attachmentCount?: number;
};

export default function RecordModal({
    timeText = "11.00 A.M.",
    petName = "Lee",
    noteText,
    noteLines = ["มีอาการซึมไม่อยากอาหาร", "มีอาเจียนเล็กน้อย"],
    petImage = "/pets-example/pet-ex1.svg",
    attachmentCount = 3,
}: RecordModalProps) {
    const detailText = noteText ?? noteLines.join("\n");

    return (
        <RecordCard>
            <div className="time">{timeText}</div>
            <div className="divider" />
            <div className="content">
                <img
                    className="avatar"
                    src={petImage}
                    alt={`${petName} avatar`}
                    onError={(event) => {
                        event.currentTarget.src = "/pets-example/pet-ex1.svg";
                    }}
                />
                <div className="details">
                    <div className="name">{petName}</div>
                    <div className="note">{detailText}</div>
                </div>
                <div className="attachment" aria-label={`+${attachmentCount} attachments`}>
                    <span className="attachment-dot" aria-hidden="true" />
                    <img className="attachment-icon" src="/window.svg" alt="" aria-hidden="true" />
                    <span className="attachment-count">+{attachmentCount}</span>
                </div>
            </div>
        </RecordCard>
    );
}
