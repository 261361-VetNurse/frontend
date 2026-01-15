"use client";

import React from "react";
import dayjs from "dayjs";
import styled from "styled-components";
import { Card } from "@/components/ui/card";

const DATE_FORMAT = "DD/MM/YYYY";

type AppointmentDetail = {
  dateKey: string;
  pet: string;
  time: string;
  location: string;
  petImage?: string;
  pid?: string;
  status?: string;
};

type AppointmentPopDoneProps = {
  open: boolean;
  appointment?: AppointmentDetail;
  onClose: () => void;
  onEdit?: (appointment: AppointmentDetail) => void;
  onDelete?: (appointment: AppointmentDetail) => void;
};

export default class AppointmentPopDone extends React.Component<AppointmentPopDoneProps> {
  handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      this.props.onClose();
    }
  };

  render() {
    const { open, appointment, onClose, onEdit, onDelete } = this.props;

    if (!open || !appointment) return null;

    const statusText = appointment.status ?? "Canceled";
    const pidText = appointment.pid ?? "098765345";

    return (
      <Overlay onClick={this.handleOverlayClick}>
        {/* 👉 ใช้ ui Card จริง */}
        <CardWrap>
          <Close onClick={onClose} aria-label="Close">
            ×
          </Close>

          {/* Header (pattern เดียวกับ record) */}
          <div className="px-4 pt-3">
            <div className="text-center text-sm font-semibold">
              Appointment
            </div>
            <div className="mt-2 h-px w-full bg-zinc-200" />
          </div>

          {/* Body */}
          <div className="px-4 pb-4 pt-3 space-y-4">
            <Row>
              <Avatar
                src={
                  appointment.petImage ??
                  "/pets-example/pet-ex1.svg"
                }
                alt={appointment.pet}
              />
              <div>
                <Name>{appointment.pet}</Name>
                <Sub>PID: {pidText}</Sub>
              </div>
            </Row>

            <TwoCol>
              <div>
                <Label>Date</Label>
                <Value>
                  {dayjs(appointment.dateKey).format(DATE_FORMAT)}
                </Value>
              </div>
              <div>
                <Label>Time</Label>
                <Value>{appointment.time}</Value>
              </div>
            </TwoCol>

            <div>
              <Label>Location</Label>
              <Value>{appointment.location}</Value>
            </div>

            <div>
              <Label>Status</Label>
              <Value>{statusText}</Value>
            </div>

            <BtnRow>
              <ActionButton
                $variant="edit"
                type="button"
                onClick={() => onEdit?.(appointment)}
              >
                Edit
              </ActionButton>

              <ActionButton
                $variant="delete"
                type="button"
                onClick={() => onDelete?.(appointment)}
              >
                Delete
              </ActionButton>
            </BtnRow>
          </div>
        </CardWrap>
      </Overlay>
    );
  }
}

/* ================= styles ================= */

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

/**
 * สำคัญมาก:
 * - CardWrap = extend จาก ui Card
 * - radius / border / base shadow มาจาก Card กลาง
 */
const CardWrap = styled(Card)`
  width: min(380px, calc(100% - 32px));
  padding: 0;
  position: relative;

  /* modal elevation (ทับของเดิม) */
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.18);
`;

const Close = styled.button`
  position: absolute;
  top: 10px;
  right: 12px;
  border: none;
  background: transparent;
  font-size: 22px;
  cursor: pointer;
`;

const Row = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const Avatar = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 60px;
  object-fit: cover;
`;

const Name = styled.div`
  font-size: 16px;
  font-weight: 500;
`;

const Sub = styled.div`
  font-size: 12px;
  color: #000;
  font-weight: 275;
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const Label = styled.div`
  font-size: 14px;
  font-weight: 600;
`;

const Value = styled.div`
  font-size: 13px;
  color: rgba(0, 0, 0, 0.7);
  font-weight: 500;
  margin-top: 4px;
`;

const BtnRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const ActionButton = styled.button<{ $variant: "edit" | "delete" }>`
  border: none;
  color: #fff;
  height: 40px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  background: ${({ $variant }) =>
    $variant === "edit" ? "#09BFF8" : "#EC221F"};
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
`;
