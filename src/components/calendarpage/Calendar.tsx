import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from "dayjs";

import { useState } from "react";
import styled from "styled-components";
import { log } from 'console';

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

export default function Calendar() {
  const [value,setValue] = useState<any>(dayjs());
  console.log(value);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
        <CalenderStyle>
             <DateCalendar value={value} onChange={(newValue) => setValue(newValue)}/>
        </CalenderStyle>
    </LocalizationProvider>
    
    
  );
}
