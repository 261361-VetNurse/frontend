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

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"];
const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const MAX_IMAGE_COUNT = 5;
const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });

type PetOption = {
  id: string;
  name: string;
  image?: string;
  pid?: string;
};

const DEFAULT_PET_OPTIONS: PetOption[] = [
  { id: "dog", name: "Dog" },
  { id: "cat", name: "Cat" },
];

type RecordPopUpProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateRecord: (record: {
    date: Date;
    pet: string;
    time: string;
    note: string;
    images: string[];
  }) => void;
  initialValues?: {
    date?: Date;
    pet?: string;
    time?: string;
    note?: string;
    images?: string[];
    petImage?: string;
  };
  isEditing?: boolean;
  petOptions?: PetOption[];
};

export default function RecordPopUp({
  open,
  onOpenChange,
  onCreateRecord,
  initialValues,
  isEditing = false,
  petOptions,
}: RecordPopUpProps) {
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  const [pet, setPet] = React.useState("");
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [time, setTime] = React.useState("00:00");
  const [note, setNote] = React.useState("");
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([]);
  const [imageError, setImageError] = React.useState("");
  const imageInputRef = React.useRef<HTMLInputElement | null>(null);
  const [errors, setErrors] = React.useState<{
    pet?: string;
    date?: string;
    time?: string;
    note?: string;
  }>({});
  const currentYear = new Date().getFullYear();
  const fromYear = currentYear - 100;
  const toYear = currentYear + 100;
  const dateTextClass = date ? "text-foreground" : "text-muted-foreground";
  const isTimeValid = Boolean(time) && time >= "00:00" && time <= "23:59";
  const isFormComplete = Boolean(pet && date && note.trim()) && isTimeValid;
  const hasErrors = Object.values(errors).some(Boolean);
  const titleText = isEditing ? "Edit Record" : "Create Record";
  const submitText = isEditing ? "Save" : "Add New Record";
  const editAvatarSrc = initialValues?.petImage ?? "/pets-example/pet-ex1.svg";
  const availablePets = React.useMemo(() => {
    const baseOptions =
      petOptions && petOptions.length ? petOptions : DEFAULT_PET_OPTIONS;
    if (!pet) {
      return baseOptions;
    }
    const hasPet = baseOptions.some(
      (option) => option.id.toLowerCase() === pet.toLowerCase()
    );
    if (hasPet) {
      return baseOptions;
    }
    return [...baseOptions, { id: pet, name: pet }];
  }, [petOptions, pet]);

  const resetForm = React.useCallback(() => {
    setPet("");
    setDate(undefined);
    setTime("00:00");
    setNote("");
    setImagePreviews([]);
    setImageError("");
    setErrors({});
    setIsCalendarOpen(false);
  }, []);

  React.useEffect(() => {
    if (!open) {
      return;
    }
    if (initialValues) {
      setPet(initialValues.pet ?? "");
      setDate(initialValues.date);
      setTime(initialValues.time ?? "00:00");
      setNote(initialValues.note ?? "");
      setImagePreviews(initialValues.images ?? []);
      setImageError("");
      setErrors({});
      setIsCalendarOpen(false);
      return;
    }
    resetForm();
  }, [open, initialValues, resetForm]);

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
    } else if (!isTimeValid) {
      newErrors.time = "Time must be between 00:00 and 23:59";
    }

    if (!note.trim()) {
      newErrors.note = "Please enter a note";
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
      onCreateRecord({ date, pet, time, note, images: imagePreviews });
      resetForm();
      onOpenChange(false);
    }
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const files = Array.from(input.files ?? []);

    if (!files.length) {
      return;
    }

    const validFiles: File[] = [];
    let hasInvalidType = false;
    let hasOversize = false;

    files.forEach((file) => {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        hasInvalidType = true;
        return;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        hasOversize = true;
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length) {
      const previews = (await Promise.all(validFiles.map(readFileAsDataUrl))).filter(Boolean);
      if (previews.length) {
        setImagePreviews((prev) => {
          const remainingSlots = Math.max(0, MAX_IMAGE_COUNT - prev.length);
          const nextPreviews = previews.slice(0, remainingSlots);
          if (previews.length > remainingSlots) {
            setImageError(`You can upload up to ${MAX_IMAGE_COUNT} images.`);
          }
          return [...prev, ...nextPreviews];
        });
      }
    }

    if (hasInvalidType || hasOversize) {
      const messages: string[] = [];
      if (hasInvalidType) {
        messages.push("Only JPG or PNG images are allowed.");
      }
      if (hasOversize) {
        messages.push(`Each image must be ${MAX_IMAGE_SIZE_MB}MB or smaller.`);
      }
      setImageError(messages.join(" "));
    } else {
      if (imagePreviews.length < MAX_IMAGE_COUNT) {
        setImageError("");
      }
    }

    input.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
    if (imageError) {
      setImageError("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="min-w-0 grid-cols-1 overflow-hidden sm:max-w-[420px] rounded-2xl border border-black/10 p-6 shadow-[0_8px_20px_rgba(0,0,0,0.2)]"
      >
        <form onSubmit={handleSubmit} className="grid w-full min-w-0 grid-cols-1 gap-5">
          <DialogHeader className="text-center">
            <DialogTitle className="text-lg font-semibold">{titleText}</DialogTitle>
            <div className="flex items-center gap-4 text-foreground">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-black/20">
                <img
                  src={isEditing ? editAvatarSrc : "/pet-paw.svg"}
                  alt={isEditing ? pet || "pet avatar" : "pet-paw"}
                  className={isEditing ? "h-full w-full object-cover" : "h-7 w-7"}
                  onError={(event) => {
                    event.currentTarget.src = "/pets-example/pet-ex1.svg";
                  }}
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="pet" className="text-[16px] font-[400] text-black">
                  Pet
                </Label>
                <Select
                  value={pet}
                  onValueChange={(value : any) => {
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
                    {availablePets.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
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
                        onSelect={(selectedDate : any) => {
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
                onChange={(event) => {
                  setNote(event.target.value);
                  if (errors.note) {
                    setErrors((prev) => ({ ...prev, note: "" }));
                  }
                }}
                aria-invalid={Boolean(errors.note)}
                className="min-h-[110px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm font-medium shadow-sm"
              />
              {errors.note ? <p className="text-xs text-destructive">{errors.note}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="record-image" className="text-[16px] font-[600]">
                Image
              </Label>
              <input
                ref={imageInputRef}
                id="record-image"
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                multiple
                onChange={handleImageChange}
                className="sr-only"
              />
              <div className="flex w-full max-w-full min-w-0 items-center gap-3 overflow-x-scroll overflow-y-hidden pb-2">
                {imagePreviews.map((preview, index) => (
                  <div
                    key={`record-preview-${index}`}
                    className="relative flex h-[180px] w-[180px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-black/10 bg-white"
                  >
                    <img
                      src={preview}
                      alt={`Uploaded image preview ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      aria-label={`Remove image ${index + 1}`}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-sm font-semibold text-black shadow-sm transition hover:bg-white"
                    >
                      <img src="/cross.svg" alt="cross" />
                    </button>
                  </div>
                ))}
                {imagePreviews.length < MAX_IMAGE_COUNT ? (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  aria-label={imagePreviews.length ? "Add another image" : "Upload images"}
                  aria-describedby={imageError ? "record-image-error" : undefined}
                  className="group flex h-[180px] w-[180px] shrink-0 items-center justify-center rounded-xl border border-black/10 bg-white text-left transition hover:border-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
                >
                  <span className="text-4xl font-light text-muted-foreground">+</span>
                </button>
                ) : null}
              </div>
              {imageError ? (
                <p id="record-image-error" className="text-xs text-destructive">
                  {imageError}
                </p>
              ) : null}
            </div>
          </div>
          {hasErrors && !isFormComplete ? (
            <p className="text-xs text-center text-destructive">
              Please complete all required fields before saving.
            </p>
          ) : null}
          <DialogFooter className="pt-1">
            <Button
              type="submit"
              aria-disabled={!isFormComplete}
              className={`h-11 w-full rounded-full bg-[#09BFF8] text-base font-semibold text-white shadow-md ${
                isFormComplete ? "hover:bg-sky-600" : "cursor-not-allowed opacity-60"
              }`}
            >
              {submitText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
