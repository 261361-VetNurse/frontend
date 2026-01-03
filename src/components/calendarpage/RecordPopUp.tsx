"use client";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { ChevronDownIcon } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type RecordPopUpProps = {
  open?: boolean;
  onClose?: () => void;
  onCreateRecord?: (record: { date: Date; pet: string; time: string; note: string }) => void;
};

export default function RecordPopUp({
  open = false,
  onClose,
  onCreateRecord,
}: RecordPopUpProps) {
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  const [pet, setPet] = React.useState("");
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [time, setTime] = React.useState("00:00");
  const [note, setNote] = React.useState("");
  const [errors, setErrors] = React.useState<{
    pet?: string;
    date?: string;
    time?: string;
  }>({});
  const currentYear = new Date().getFullYear();
  const fromYear = currentYear - 100;
  const toYear = currentYear + 100;
  const dateTextClass = date ? "text-foreground" : "text-muted-foreground";

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!pet) {
      newErrors.pet = "Please select a pet";
    }

    if (!date) {
      newErrors.date = "Please select a date";
    }

    if (!time) {
      newErrors.time = "Please select a time";
    } else if (time < "00:00" || time > "23:59") {
      newErrors.time = "Time must be between 00:00 and 23:59";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (date) {
      if (onCreateRecord) {
        onCreateRecord({ date, pet, time, note });
      }
      if (onClose) {
        onClose();
      }
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && onClose) {
          onClose();
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[420px] rounded-2xl border border-black/10 p-6 shadow-[0_8px_20px_rgba(0,0,0,0.2)]"
      >
        <form onSubmit={handleSubmit} className="grid gap-5">
          <DialogHeader className="text-center">
            <DialogTitle className="text-lg font-semibold">Create Record</DialogTitle>
            <div className="flex items-center gap-4 text-foreground">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/20">
                <img src="/pet-paw.svg" alt="pet-paw" className="h-7 w-7" />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="pet" className="text-[16px] font-[400] text-black">
                  Pet
                </Label>
                <Select
                  value={pet}
                  onValueChange={(value) => {
                    setPet(value);
                    if (errors.pet) {
                      setErrors((prev) => ({ ...prev, pet: "" }));
                    }
                  }}
                >
                  <SelectTrigger
                    id="pet"
                    type="button"
                    aria-invalid={Boolean(errors.pet)}
                    className="h-10 w-full justify-between text-sm cursor-pointer"
                  >
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
                {errors.pet ? <p className="text-xs text-destructive">{errors.pet}</p> : null}
              </div>
            </div>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-picker" className="text-[16px] font-[600]">
                  Date
                </Label>
                <div className="relative">
                  <CalendarMonthIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="date-picker"
                        type="button"
                        aria-invalid={Boolean(errors.date)}
                        className={`h-10 w-full justify-between text-sm font-medium ${dateTextClass} !py-[8px] !px-[12px] !pl-[42px] cursor-pointer`}
                      >
                        {date ? new Intl.DateTimeFormat("en-GB").format(date) : "Select date"}
                        <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="z-[60] w-auto overflow-hidden p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        captionLayout="dropdown"
                        fromYear={fromYear}
                        toYear={toYear}
                        onSelect={(selectedDate) => {
                          setDate(selectedDate);
                          if (errors.date) {
                            setErrors((prev) => ({ ...prev, date: "" }));
                          }
                          setIsCalendarOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {errors.date ? <p className="text-xs text-destructive">{errors.date}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="time-picker" className="text-[16px] font-[600]">
                  Time
                </Label>
                <div className="relative">
                  <AccessTimeIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="time"
                    id="time-picker"
                    min="00:00"
                    max="23:59"
                    value={time}
                    onChange={(event) => {
                      setTime(event.target.value);
                      if (errors.time) {
                        setErrors((prev) => ({ ...prev, time: "" }));
                      }
                    }}
                    onClick={(event) => {
                      if (event.isTrusted) {
                        event.currentTarget.showPicker?.();
                      }
                    }}
                    aria-invalid={Boolean(errors.time)}
                    className="h-10 w-full pl-[42px] text-sm font-medium cursor-pointer appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute"
                  />
                </div>
                {errors.time ? <p className="text-xs text-destructive">{errors.time}</p> : null}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note" className="text-[16px] font-[600]">
                Note
              </Label>
              <textarea
                id="note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="min-h-[110px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm font-medium shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="record-image" className="text-[16px] font-[600]">
                Image
              </Label>
              <div
                id="record-image"
                className="flex h-[180px] w-[180px] items-center justify-center rounded-xl border border-black/10 bg-white"
                aria-label="Upload image"
              >
                <span className="text-4xl font-light text-muted-foreground">+</span>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-1">
            <Button
              type="submit"
              className="h-11 w-full rounded-full bg-[#09BFF8] text-base font-semibold text-white shadow-md hover:bg-sky-600 cursor-pointer"
            >
              Add New Record
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
