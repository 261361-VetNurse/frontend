import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay , PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";
import styled from "styled-components";

const CalenderStyle = styled.div`
    border-radius: 8px;
    background: #FFF;

    .MuiDateCalendar-root {
        width: 100%;
        max-width: none;
    }
    .MuiYearCalendar-root {
        width: 100%;
    }
`;

const DotRow = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    pointer-events: none;
`;

const Dot = styled.span<{ $color: string }>`
    height: 6px;
    width: 6px;
    border-radius: 9999px;
    background-color: ${({ $color }) => $color};
`;

type CalendarProps = {
  appointmentPetsByDate?: Record<string, string[]>;
};

const PET_DOT_COLORS: Record<string, string> = {
  dog: "#09BFF8",
  cat: "#F472B6",
};
const DEFAULT_DOT_COLOR = "#9CA3AF";

export default function Calendar({ appointmentPetsByDate = {} }: CalendarProps) {
  const [value, setValue] = useState<Dayjs | null>(dayjs());
  const AppointmentDay = (props: PickersDayProps) => {
    const { day, outsideCurrentMonth, ...other } = props;
    const dateKey = day.format("YYYY-MM-DD");
    const pets = appointmentPetsByDate[dateKey] ?? [];
    const dotColors = pets.map((pet) => PET_DOT_COLORS[pet] ?? DEFAULT_DOT_COLOR);
    const showDots = !outsideCurrentMonth && dotColors.length > 0;

    return (
      <span className="relative inline-flex">
        <PickersDay day={day} outsideCurrentMonth={outsideCurrentMonth} {...other} />
        {showDots ? (
          <span className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2">
            <DotRow>
              {dotColors.map((color, index) => (
                <Dot key={`${dateKey}-${color}-${index}`} $color={color} />
              ))}
            </DotRow>
          </span>
        ) : null}
      </span>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <CalenderStyle>
        <DateCalendar
          value={value}
          onChange={(newValue) => setValue(newValue)}
          slots={{ day: AppointmentDay }}
        />
      </CalenderStyle>
    </LocalizationProvider>
  );
}
