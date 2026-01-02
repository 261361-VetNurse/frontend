import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { useState } from "react";

export default function Calendar() {
  const [selected, setSelected] = useState<Date>();

  return (
    <DayPicker
      animate
      mode="single"
      selected={selected}
      onSelect={setSelected}
      footer={
        selected ? `Selected: ${selected.toLocaleDateString()}` : "Pick a day."
      }
    />
  );
}
