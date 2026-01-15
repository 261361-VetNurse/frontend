"use client";

import { Card } from "@/components/ui/card";
import {
  LocationOn,
  CalendarToday,
  AccessTime,
} from "@mui/icons-material";

type Props = {
  petName: string;
  date: string;
  time: string;
  location: string;
  onClick?: () => void;
};

export default function AppointmentCard({
  petName,
  date,
  time,
  location,
  onClick,
}: Props) {
  return (
    <Card headerRight={date} onClick={onClick}>
      <div className="space-y-2">
        <div className="text-sm font-semibold text-zinc-900">
          {petName}
        </div>

        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <LocationOn fontSize="small" />
          {location}
        </div>

        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <AccessTime fontSize="small" />
          {time}
        </div>
      </div>
    </Card>
  );
}
