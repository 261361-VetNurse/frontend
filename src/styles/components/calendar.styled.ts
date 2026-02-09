import type { MarkerColorKey } from "@/components/pet-owners/shared/CalendarModule";
import { styled } from "styled-components";

export const CALENDAR_MARKER_PALETTE: Record<MarkerColorKey, string> = {
  appointment: "bg-sky-600",
  medication: "bg-emerald-500",
  record: "bg-pink-500",
};

export const Page = styled.div`
  width: 100%;

  .scroll-area {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-bottom: 80px;
  }

  .head-text {
    font-size: 18px;
    font-weight: 500;
  }

  .date-text {
    font-size: 14px;
    font-weight: 500;
  }

  .line {
    width: 100%;
    height: 1px;
    background: rgba(0, 0, 0, 0.15);
  }
`;
