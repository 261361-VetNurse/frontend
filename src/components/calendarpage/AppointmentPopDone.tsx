"use client"
import React from "react"
import dayjs from "dayjs"
import styled from "styled-components"

const DATE_FORMAT = "DD/MM/YYYY"

type AppointmentDetail = {
  dateKey: string
  pet: string
  time: string
  location: string
  petImage?: string
  pid?: string
  status?: string
}

type AppointmentPopDoneProps = {
  open: boolean
  appointment?: AppointmentDetail
  onClose: () => void
  onEdit?: (appointment: AppointmentDetail) => void
  onDelete?: (appointment: AppointmentDetail) => void
}

type AppointmentPopDoneState = {
  isEditingStatus: boolean
  statusDraft: boolean
}

export default class AppointmentPopDone extends React.Component<AppointmentPopDoneProps, AppointmentPopDoneState> {
  static Overlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `
  static Card = styled.div`
    width: min(380px, calc(100% - 32px));
    background: #fff;
    border-radius: 18px;
    padding: 16px;
    box-shadow: 0 10px 28px rgba(0,0,0,0.18);
    position: relative;
    display: grid;
    gap: 16px;
  `
  static Title = styled.div`
    font-size: 16px;
    font-weight: 700;
    text-align: center;
  `
  static Close = styled.button`
    position: absolute;
    top: 10px;
    right: 12px;
    border: none;
    background: transparent;
    font-size: 22px;
    cursor: pointer;
  `
  static Row = styled.div`
    display: flex;
    gap: 14px;
    align-items: center;
  `
  static Avatar = styled.img`
    width: 60px;
    height: 60px;
    border-radius: 60px;
    object-fit: cover;
  `
  static Name = styled.div`
    font-size: 16px;
    font-weight: 400;
  `
  static Sub = styled.div`
    font-size: 12px;
    color: #000;
    font-weight: 275;
  `
  static TwoCol = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  `
  static Label = styled.div`
    font-size: 16px;
    font-weight: 600;
  `
  static Value = styled.div`
    font-size: 15px;
    color: #444;
    margin-top: 4px;
  `
  static StatusRow = styled.label<{ $disabled: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: 12px;
    margin-top: 6px;
    cursor: ${({ $disabled }) => ($disabled ? "default" : "pointer")};
    opacity: ${({ $disabled }) => ($disabled ? 0.85 : 1)};
  `
  static StatusCheckbox = styled.input`
    width: 24px;
    height: 24px;
    accent-color: #4d4d4d;
  `
  static StatusText = styled.span`
    font-size: 16px;
    font-weight: 600;
    color: #111;
  `
  static BtnRow = styled.div<{ $single?: boolean }>`
    display: grid;
    grid-template-columns: ${({ $single }) => ($single ? "1fr" : "1fr 1fr")};
    gap: 16px;
  `
  static ActionButton = styled.button<{ $variant: "edit" | "delete" }>`
    border: none;
    color: #fff;
    height: 44px;
    border-radius: 22px;
    font-weight: 600;
    cursor: pointer;
    background: ${({ $variant }) => ($variant === "edit" ? "#09BFF8" : "#EC221F")};
    box-shadow: 0 6px 12px rgba(0,0,0,0.12);
  `

  state: AppointmentPopDoneState = {
    isEditingStatus: false,
    statusDraft: false,
  }

  componentDidUpdate(prevProps: AppointmentPopDoneProps) {
    const opened = !prevProps.open && this.props.open
    const appointmentChanged = prevProps.appointment !== this.props.appointment
    if (this.props.appointment && (opened || appointmentChanged)) {
      const statusText = this.props.appointment.status ? this.props.appointment.status : "Active"
      const isCanceled = statusText.toLowerCase() === "canceled" || statusText.toLowerCase() === "cancelled"
      if (isCanceled !== this.state.statusDraft || this.state.isEditingStatus) {
        this.setState({ statusDraft: isCanceled, isEditingStatus: false })
      }
    }
  }

  handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      this.props.onClose()
    }
  }

  handleSaveStatus = () => {
    const appointment = this.props.appointment
    if (!appointment) {
      return
    }
    const updatedAppointment = {
      ...appointment,
      status: this.state.statusDraft ? "Canceled" : "Active",
    }
    if (this.props.onEdit) {
      this.props.onEdit(updatedAppointment)
    }
    this.setState({ isEditingStatus: false })
  }

  render() {
    if (!this.props.open || !this.props.appointment) {
      return null
    }

    let appointment = this.props.appointment
    let statusText = appointment.status ? appointment.status : "Active"
    let isCanceled = statusText.toLowerCase() === "canceled" || statusText.toLowerCase() === "cancelled"
    let pidText = appointment.pid ? appointment.pid : "-"

    return (
      <AppointmentPopDone.Overlay onClick={this.handleOverlayClick}>
        <AppointmentPopDone.Card>
          <AppointmentPopDone.Close onClick={() => this.props.onClose()} aria-label="Close" className="pr-4 py-1.5">
            ×
          </AppointmentPopDone.Close>
          <AppointmentPopDone.Title>Appointment</AppointmentPopDone.Title>
          <AppointmentPopDone.Row>
            <AppointmentPopDone.Avatar
              src={appointment.petImage ? appointment.petImage : "/pets-example/pet-ex1.svg"}
              alt={appointment.pet}
            />
            <div>
              <AppointmentPopDone.Name>{appointment.pet}</AppointmentPopDone.Name>
              <AppointmentPopDone.Sub>PID: {pidText}</AppointmentPopDone.Sub>
            </div>
          </AppointmentPopDone.Row>
          <AppointmentPopDone.TwoCol>
            <div>
              <AppointmentPopDone.Label>Date</AppointmentPopDone.Label>
              <AppointmentPopDone.Value>
                {dayjs(appointment.dateKey).format(DATE_FORMAT)}
              </AppointmentPopDone.Value>
            </div>
            <div>
              <AppointmentPopDone.Label>Time</AppointmentPopDone.Label>
              <AppointmentPopDone.Value>{appointment.time}</AppointmentPopDone.Value>
            </div>
          </AppointmentPopDone.TwoCol>
          <div>
            <AppointmentPopDone.Label>Location</AppointmentPopDone.Label>
            <AppointmentPopDone.Value>{appointment.location}</AppointmentPopDone.Value>
          </div>
          <div>
            <AppointmentPopDone.Label>Status</AppointmentPopDone.Label>
            {this.state.isEditingStatus ? (
              <AppointmentPopDone.StatusRow $disabled={false}>
                <AppointmentPopDone.StatusCheckbox
                  type="checkbox"
                  checked={this.state.statusDraft}
                  onChange={(event) => this.setState({ statusDraft: event.target.checked })}
                  aria-label="Canceled"
                />
                <AppointmentPopDone.StatusText>Canceled</AppointmentPopDone.StatusText>
              </AppointmentPopDone.StatusRow>
            ) : (
              <AppointmentPopDone.Value>{statusText}</AppointmentPopDone.Value>
            )}
          </div>
          <AppointmentPopDone.BtnRow $single={this.state.isEditingStatus}>
            <AppointmentPopDone.ActionButton
              $variant="edit"
              type="button"
              onClick={() => {
                if (this.state.isEditingStatus) {
                  this.handleSaveStatus()
                  return
                }
                this.setState({
                  isEditingStatus: true,
                  statusDraft: isCanceled,
                })
              }}
            >
              {this.state.isEditingStatus ? "Save" : "Edit"}
            </AppointmentPopDone.ActionButton>
            {!this.state.isEditingStatus ? (
              <AppointmentPopDone.ActionButton
                $variant="delete"
                type="button"
                onClick={() => {
                  if (this.props.onDelete) {
                    this.props.onDelete(appointment)
                  }
                }}
              >
                Delete
              </AppointmentPopDone.ActionButton>
            ) : null}
          </AppointmentPopDone.BtnRow>
        </AppointmentPopDone.Card>
      </AppointmentPopDone.Overlay>
    )
  }
}
