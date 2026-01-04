"use client";

import styled from "styled-components";

const RecordCard = styled.div`
    width: 345px;
    min-height: 126px;
    border-radius: 18px;
    background: #fff;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
    padding: 18px 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;

    .time{
        align-self: flex-end;
        color: #2b2b2b;
        font-size: 14px;
        font-weight: 275;
    }

    .divider{
        width: 313px;
        height: 1px;
        background: rgba(0, 0, 0, 0.20);
    }

    .content{
        display: flex;
        align-items: center;
        gap: 18px;
    }

    .avatar{
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
        background: #f1f1f1;
        flex: 0 0 auto;
    }

    .details{
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
    }

    .name{
        font-size: 16px;
        font-weight: 500;
        color: #000;
    }

    .note{
        font-size: 14px;
        font-weight: 275;
        color: #3C3C3C;
    }

    .attachment{
        width: 72px;
        height: 72px;
        border-radius: 14px;
        background: #c9c9c9;
        position: relative;
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    }

    .attachment-dot{
        position: absolute;
        top: 10px;
        left: 10px;
        width: 12px;
        height: 12px;
        border-radius: 999px;
        background: #fff;
    }

    .attachment-icon{
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0.85;
        z-index: 0;
    }

    .attachment-count{
        font-size: 24px;
        font-weight: 500;
        color: #4d4d4d;
        position: relative;
        z-index: 1;
    }
`;

type RecordModalProps = {
    timeText?: string;
    petName?: string;
    noteText?: string;
    noteLines?: string[];
    petImage?: string;
    attachmentImage?: string;
    attachmentCount?: number;
};

export default function RecordModal({
    timeText = "11.00 A.M.",
    petName = "Lee",
    noteText,
    noteLines = ["มีอาการซึมไม่อยากอาหาร", "มีอาเจียนเล็กน้อย"],
    petImage = "/pets-example/pet-ex1.svg",
    attachmentImage,
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
                
                    <img
                        className="attachment-icon"
                        src={attachmentImage || "/record-example.svg"}
                        alt="record-example"
                        aria-hidden="true"
                        onError={(event) => {
                            event.currentTarget.src = "/record-example.svg";
                        }}
                    />
                    <span className="attachment-count">+{attachmentCount}</span>
                </div>
            </div>
        </RecordCard>
    );
}
