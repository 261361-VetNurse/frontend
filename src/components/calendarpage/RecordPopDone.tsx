"use client"
import React from "react"
import dayjs from "dayjs"
import styled from "styled-components"

const DATE_FORMAT = "DD/MM/YYYY"

type RecordDetail = {
  dateKey: string
  pet: string
  time: string
  note: string
  petImage?: string
  pid?: string
  images?: string[]
}

type RecordPopDoneProps = {
  open: boolean
  record?: RecordDetail
  onClose: () => void
  onEdit?: (record: RecordDetail) => void
  onDelete?: (record: RecordDetail) => void
}

const formatTime = (value: string) => {
  const match = value.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) {
    return value
  }
  const rawHour = Number(match[1])
  const minute = match[2]
  const period = rawHour >= 12 ? "P.M." : "A.M."
  const hour = rawHour % 12 || 12
  return `${String(hour).padStart(2, "0")}.${minute} ${period}`
}

export default class RecordPopDone extends React.Component<RecordPopDoneProps> {
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
    width: min(400px, calc(100% - 32px));
    background: #fff;
    border-radius: 18px;
    padding: 16px 18px 18px;
    box-shadow: 0 10px 28px rgba(0,0,0,0.18);
    position: relative;
    display: grid;
    gap: 16px;
  `
  static Title = styled.div`
    font-size: 18px;
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
    gap: 16px;
    align-items: center;
  `
  static Avatar = styled.img`
    width: 68px;
    height: 68px;
    border-radius: 60px;
    object-fit: cover;
    background: #f1f1f1;
  `
  static Name = styled.div`
    font-size: 18px;
    font-weight: 500;
    text-transform: capitalize;
  `
  static Sub = styled.div`
    font-size: 12px;
    color: rgba(0, 0, 0, 0.7);
    font-weight: 300;
    margin-top: 4px;
  `
  static TwoCol = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
  `
  static Label = styled.div`
    font-size: 16px;
    font-weight: 600;
  `
  static Value = styled.div`
    font-size: 14px;
    color: rgba(0, 0, 0, 0.7);
    font-weight: 500;
    margin-top: 6px;
  `
  static NoteText = styled.div`
    font-size: 14px;
    color: #3c3c3c;
    font-weight: 400;
    margin-top: 6px;
    white-space: pre-wrap;
    line-height: 1.45;
  `
  static ImageGrid = styled.div`
    display: grid;
    grid-template-columns: 1.35fr 1fr;
    gap: 14px;
    margin-top: 8px;
  `
  static ImageCard = styled.div`
    height: 150px;
    border-radius: 16px;
    background: #cfcfcf;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    img.placeholder {
      width: 68px;
      height: 68px;
      object-fit: contain;
      opacity: 0.6;
    }
  `
  static BtnRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  `
  static ActionButton = styled.button<{ $variant: "edit" | "delete" }>`
    border: none;
    color: #fff;
    height: 42px;
    border-radius: 50px;
    font-size: 18px;
    font-weight: 500;
    cursor: pointer;
    background: ${({ $variant }) => ($variant === "edit" ? "#09BFF8" : "#EC221F")};
    box-shadow: 0 6px 12px rgba(0,0,0,0.12);
  `

  handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      this.props.onClose()
    }
  }

  render() {
    if (!this.props.open || !this.props.record) {
      return null
    }

    const record = this.props.record
    const pidText = record.pid ? record.pid : "098765345"
    const displayImages = [
      record.images?.[0] ?? "",
      record.images?.[1] ?? "",
    ]

    return (
      <RecordPopDone.Overlay onClick={this.handleOverlayClick}>
        <RecordPopDone.Card>
          <RecordPopDone.Close onClick={() => this.props.onClose()} aria-label="Close">
            ×
          </RecordPopDone.Close>
          <RecordPopDone.Title>Record</RecordPopDone.Title>
          <RecordPopDone.Row>
            <RecordPopDone.Avatar
              src={record.petImage ? record.petImage : "/pets-example/pet-ex1.svg"}
              alt={record.pet}
              onError={(event) => {
                event.currentTarget.src = "/pets-example/pet-ex1.svg"
              }}
            />
            <div>
              <RecordPopDone.Name>{record.pet}</RecordPopDone.Name>
              <RecordPopDone.Sub>PID: {pidText}</RecordPopDone.Sub>
            </div>
          </RecordPopDone.Row>
          <RecordPopDone.TwoCol>
            <div>
              <RecordPopDone.Label>Date</RecordPopDone.Label>
              <RecordPopDone.Value>
                {dayjs(record.dateKey).format(DATE_FORMAT)}
              </RecordPopDone.Value>
            </div>
            <div>
              <RecordPopDone.Label>Time</RecordPopDone.Label>
              <RecordPopDone.Value>{formatTime(record.time)}</RecordPopDone.Value>
            </div>
          </RecordPopDone.TwoCol>
          <div>
            <RecordPopDone.Label>Note</RecordPopDone.Label>
            <RecordPopDone.NoteText>{record.note}</RecordPopDone.NoteText>
          </div>
          <div>
            <RecordPopDone.Label>Image</RecordPopDone.Label>
            <RecordPopDone.ImageGrid>
              {displayImages.map((imageSrc, index) => (
                <RecordPopDone.ImageCard key={`record-image-${index}`}>
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={`record attachment ${index + 1}`}
                      onError={(event) => {
                        event.currentTarget.src = "/record-example.svg"
                        event.currentTarget.classList.add("placeholder")
                      }}
                    />
                  ) : (
                    <img
                      className="placeholder"
                      src="/record-example.svg"
                      alt="record placeholder"
                    />
                  )}
                </RecordPopDone.ImageCard>
              ))}
            </RecordPopDone.ImageGrid>
          </div>
          <RecordPopDone.BtnRow>
            <RecordPopDone.ActionButton
              $variant="edit"
              type="button"
              onClick={() => {
                if (this.props.onEdit) {
                  this.props.onEdit(record)
                }
              }}
            >
              Edit
            </RecordPopDone.ActionButton>
            <RecordPopDone.ActionButton
              $variant="delete"
              type="button"
              onClick={() => {
                if (this.props.onDelete) {
                  this.props.onDelete(record)
                }
              }}
            >
              Delete
            </RecordPopDone.ActionButton>
          </RecordPopDone.BtnRow>
        </RecordPopDone.Card>
      </RecordPopDone.Overlay>
    )
  }
}
