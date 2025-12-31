"use client"
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import React from "react"
import { ChevronDownIcon } from "lucide-react"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type PopUpProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PopUp({ open, onOpenChange }: PopUpProps) {
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(undefined)
  const dateTextClass = date ? "text-foreground" : "text-muted-foreground"
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-[420px] gap-5 rounded-2xl border border-black/10 p-6 shadow-[0_8px_20px_rgba(0,0,0,0.2)]"
        >
          <DialogHeader className="text-center">
            <DialogTitle className="text-lg font-semibold">Create Appointment</DialogTitle>
            <DialogDescription asChild>
              <div className="flex items-center gap-4 text-foreground">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/20">
                  <img src="/pet-paw.svg" alt="pet-paw" className="h-7 w-7" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="pet" className="text-[16px] font-[400] text-black">
                    Pet
                  </Label>
                  <Select>
                    <SelectTrigger id="pet" className="h-10 w-full justify-between text-sm cursor-pointer">
                      <SelectValue
                        placeholder="Select your pet"
                        className="text-sm font-medium text-muted-foreground"
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">Dog</SelectItem>
                      <SelectItem value="cat">Cat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-picker" className="text-[16px] font-[600]">
                  Date
                </Label>
                <div className="relative">
                  <CalendarMonthIcon 
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground " />
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="date-picker"
                        className={`h-10 w-full justify-between text-sm font-medium ${dateTextClass} !py-[8px] !px-[12px] !pl-[42px] cursor-pointer`}
                      >
                        {date ? date.toLocaleDateString() : "Select date"}
                        <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="time-picker" className="text-[16px] font-[600]">
                  Time
                </Label>
                <div className="relative ">
                  <AccessTimeIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="time"
                    id="time-picker"
                    min="09:00"
                    max="18:00"
                    defaultValue="09:00"
                    onClick={(event) => event.currentTarget.showPicker?.()}
                    onFocus={(event) => event.currentTarget.showPicker?.()}
                    className="h-10 w-full pl-[42px] text-sm font-medium cursor-pointer appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-[16px] font-[600]">
                Location
              </Label>
              <div className="relative cursor-pointer">
              <LocationOnIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="Enter location"
                  className="h-10 pl-10 text-sm font-medium cursor-pointer"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="pt-1">
            <Button className="h-11 w-full rounded-full bg-[#09BFF8] text-base font-semibold text-white shadow-md hover:bg-sky-600 cursor-pointer">
              Add New Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
