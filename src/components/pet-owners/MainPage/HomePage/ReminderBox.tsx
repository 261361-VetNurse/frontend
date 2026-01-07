import styled from "styled-components";

const ReminBox = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background-color: #fff;
    cursor: pointer;

    &:active {
        background-color: #f0f0f0;
    }
`;

const PetImg = styled.img<{ $size: number }>`
    width: ${({ $size }) => $size}px;
    height: ${({ $size }) => $size}px;
    border-radius: 9999px;
    object-fit: cover;
    flex: 0 0 auto;
`;

const ReminderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;

  .title {
    color: rgba(0, 0, 0, 0.9);
    font-size: 16px;
    font-weight: 400;
    line-height: 1.25;
  }

  .time-text {
    color: rgba(0, 0, 0, 0.7);
    font-size: 12px;
    font-weight: 300;
  }

  .time-row {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .icon {
    width: 16px;
    height: 16px;
  }
`;

const StatusIcon = styled.img`
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
`;

export type ReminderBoxProps = {
    petName: string;
    petImageUrl: string; // เช่น "/pets-example/pet-ex1.svg" หรือ url จริง
    medicineName: string;

    // เลือกได้ 2 แบบ:
    dateLabel: string; // เช่น "Today," / "Mon," / "12 Jan,"
    timeLabel: string; // เช่น "9:45 AM."

    // สถานะการทานยา
    is_taken: boolean;

    // optional
    petImageSize?: number; // default 40
    onClick?: () => void;
};

export default function ReminderBox({
                                        petName,
                                        petImageUrl,
                                        medicineName,
                                        dateLabel,
                                        timeLabel,
                                        is_taken,
                                        petImageSize = 40,
                                        onClick,
                                    }: ReminderBoxProps) {
    return (
        <ReminBox onClick={onClick} role={onClick ? "button" : undefined}>
            <PetImg src={petImageUrl} alt={petName} $size={petImageSize} />
            <ReminderText>
                <div className="title">
                    {petName} อย่าลืมทานยา {medicineName}
                </div>

                <div className="time-row time-text">
                    <img className="icon" src="/clock.svg" alt="clock" />
                    <span>{dateLabel}</span>
                    <span>{timeLabel}</span>
                </div>
            </ReminderText>
            
            {is_taken && (
                <StatusIcon src="/complete.svg" alt="completed" />
            )}
        </ReminBox>
    );
}
