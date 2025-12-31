"use client"

import React from "react"
import { ChevronDownIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import styled from "styled-components"


type PopUpProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PopUpStyle = styled.div`
  .box-choose{
    display: flex;
    gap: 16px;
    ;
  }
  .box-choosetext{
    color: #000;
    font-size: 16px;
    font-weight: 400;
  }
`;

export function PopUp({ open, onOpenChange }: PopUpProps) {
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(undefined)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Appointment</DialogTitle>
            <DialogDescription className="flex items-center gap-4">
              <span className="inline-flex h-[60px] w-[60px] items-center justify-center rounded-full bg-black/30 mt-[12px]">
                <img src="/pet-paw.svg" alt="pet-paw" />
                <div className="box-choose">
                  <div className="box-choosetext">Pet</div>
                  <div></div>
                </div>
              </span>
            </DialogDescription>
          </DialogHeader>
            <div className="flex gap-4">
                <div className="flex flex-col gap-3">
                    <Label htmlFor="date-picker" className="px-1">
                        Date
                    </Label>
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                id="date-picker"
                                className="w-32 justify-between font-normal"
                            >
                                {date ? date.toLocaleDateString() : "Select date"}
                                <ChevronDownIcon />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={date}
                                captionLayout="dropdown"
                                onSelect={(date) => {
                                    setDate(date)
                                    setIsCalendarOpen(false)
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="flex flex-col gap-3">
                    <Label htmlFor="time-picker" className="px-1">
                        Time
                    </Label>
                    <Input
                        type="time"
                        id="time-picker"
                        step="1"
                        defaultValue="10:30:00"
                        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    />
                </div>
            </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
