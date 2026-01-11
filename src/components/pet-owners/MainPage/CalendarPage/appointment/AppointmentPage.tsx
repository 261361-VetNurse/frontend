"use client";

import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import styled from "styled-components";

import { Tabs } from "@/components/pet-owners/shared/Tabs";
import PetFilterSelector, {
  type PetLite,
  type PetSelectorValue,
} from "@/components/pet-owners/shared/PetFilterSelector";

import CalendarModule, {
  type CalendarDayMeta,
  type DayMarker,
} from "@/components/pet-owners/shared/CalendarModule";

import AppointmentBox from "@/components/pet-owners/MainPage/HomePage/AppointBox";
import { QuickDialButton } from "@/components/pet-owners/shared/QuickDialButton";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { PopUp } from "@/components/pet-owners/MainPage/CalendarPage/appointment/AppointmentPopup";
import AppointmentPopDone from "@/components/pet-owners/MainPage/CalendarPage/appointment/AppointmentPopDone";

import { mockPets } from "@/mocks/pets.mock"; 
import { mockAppointmentsByPetId } from "@/mocks/appointments";
import { Pet } from "@/types/pet"; 

type Appointment = {
  dateKey: string; 
  pet: string; 
  petId?: string; 
  time: string;
  location: string;
  status?: string;
  petImage?: string;
  pid?: string;
};

const appointmentTabs = [
  { name: "Appointment", path: "/appointment", params: "appointment" },
  { name: "Record", path: "/record", params: "record" },
];

const AppointmentPageStyled = styled.div`
  width: 100%;
  height: 100%;
  min-height: 100vh;
  overflow: hidden;
  position: relative;

  .scroll-area {
    height: 100%;
    overflow: auto;
    display: flex;
    flex-direction: column;
    row-gap: 10px;
    padding-bottom: 80px; /* กัน FAB บัง */
  }
  .head-text {
    color: #000;
    font-size: 18px;
    font-weight: 500;
  }
  .date-text {
    color: #000;
    font-size: 14px;
    font-weight: 500;
  }
  .line {
    width: 345px;
    height: 1px;
    background: rgba(0, 0, 0, 0.2);
  }
  .appointment-card {
    border: none;
    background: transparent;
    padding: 0;
    text-align: left;
    cursor: pointer;
  }
`;

/** util: YYYY-MM-DD */
function toISODate(d: Date) {
  return dayjs(d).format("YYYY-MM-DD");
}

export const AppointmentPage = () => {
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const allMockApps = Object.values(mockAppointmentsByPetId).flat();

    return allMockApps.map((item) => {
      const ownerPet = mockPets.find((p) => String(p._id) === String(item.petId));
      return {
        dateKey: item.date, // Map date -> dateKey
        pet: item.petName, 
        petId: item.petId,
        time: item.time,
        location: item.location,
        status: item.status,
        petImage: ownerPet?.profile_image,
        pid: ownerPet ? String(ownerPet._id) : undefined,
      };
    });
  });

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);

  const [selectedPetId, setSelectedPetId] = useState<PetSelectorValue>("all");

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [monthCursor, setMonthCursor] = useState<Date>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  const todayKey = dayjs().format("YYYY-MM-DD");

  const petOptions: PetLite[] = useMemo(() => {
    return mockPets.map((p: Pet) => ({
      id: String(p._id),   
      name: p.name,
      pid: String(p._id),
      avatarUrl: p.profile_image, 
    }));
  }, []);

  const editInitialValues = useMemo(() => {
    if (!editingAppointment) return undefined;
    return {
      date: dayjs(editingAppointment.dateKey).toDate(),
      pet: editingAppointment.pet,
      time: editingAppointment.time,
      location: editingAppointment.location,
      status: editingAppointment.status,
      petImage: editingAppointment.petImage,
    };
  }, [editingAppointment]);

  const handleClick = () => {
    setEditingAppointment(null);
    setIsPopUpOpen(true);
  };

  const handlePopUpChange = (open: boolean) => {
    setIsPopUpOpen(open);
    if (!open) setEditingAppointment(null);
  };

  const handleSaveAppointment = ({
    date,
    pet,
    time,
    location,
    status,
  }: {
    date: Date;
    pet: string;
    time: string;
    location: string;
    status?: string;
  }) => {
    const normalizedPetName = pet.trim();
    const dateKey = dayjs(date).format("YYYY-MM-DD");

    const foundPet = mockPets.find(
      (p) => String(p._id) === normalizedPetName || p.name === normalizedPetName
    );

    const nextAppointment: Appointment = {
      ...(editingAppointment ?? {}),
      dateKey,
      pet: foundPet ? foundPet.name : normalizedPetName,
      petId: foundPet ? String(foundPet._id) : undefined, 
      time,
      location,
      status: status ?? editingAppointment?.status,
      petImage: foundPet?.profile_image ?? editingAppointment?.petImage,
      pid: foundPet ? String(foundPet._id) : editingAppointment?.pid,
    };

    setAppointments((prev) => {
      const hasSameSlot = prev.some(
        (item) =>
          item !== editingAppointment &&
          item.pet === nextAppointment.pet &&
          item.dateKey === dateKey &&
          item.time === time
      );
      if (hasSameSlot) return prev;

      if (editingAppointment) {
        return prev.map((item) =>
          item === editingAppointment ? nextAppointment : item
        );
      }
      return [...prev, nextAppointment];
    });

    if (editingAppointment) setSelectedAppointment(nextAppointment);
  };

  const handleOpenAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailOpen(true);
  };

  const handleDeleteAppointment = (appointment: Appointment) => {
    setAppointments((prev) => prev.filter((item) => item !== appointment));
    setIsDetailOpen(false);
    setSelectedAppointment(null);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setEditingAppointment(appointment);
    setIsDetailOpen(false);
    setIsPopUpOpen(true);
  };

  const filteredAppointments = useMemo(() => {
    if (selectedPetId === "all") return appointments;
    return appointments.filter(
      (a) => a.petId === selectedPetId || a.pet === selectedPetId
    );
  }, [appointments, selectedPetId]);

  const upcomingAppointments = useMemo(() => {
    return filteredAppointments
      .filter((a) => a.dateKey >= todayKey)
      .sort((a, b) => {
        if (a.dateKey === b.dateKey) return a.time.localeCompare(b.time);
        return a.dateKey.localeCompare(b.dateKey);
      });
  }, [filteredAppointments, todayKey]);

  const upcomingAppointmentsByDate = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    upcomingAppointments.forEach((a) => {
      if (!map[a.dateKey]) map[a.dateKey] = [];
      map[a.dateKey].push(a);
    });

    return Object.entries(map)
      .sort(([da], [db]) => da.localeCompare(db))
      .map(([dateKey, items]) => ({ dateKey, items }));
  }, [upcomingAppointments]);

  const dayMeta: CalendarDayMeta[] = useMemo(() => {
    const map = new Map<string, DayMarker[]>();

    upcomingAppointments.forEach((a) => {
      const arr = map.get(a.dateKey) ?? [];
      arr.push({ type: "dot", colorKey: "appointment" });
      map.set(a.dateKey, arr);
    });

    return Array.from(map.entries()).map(([iso, markers]) => ({
      date: dayjs(iso).toDate(),
      markers,
    }));
  }, [upcomingAppointments]);

  return (
    <AppointmentPageStyled>
      <>
        <PopUp
          open={isPopUpOpen}
          onOpenChange={handlePopUpChange}
          onCreateAppointment={handleSaveAppointment}
          initialValues={editInitialValues}
          isEditing={Boolean(editingAppointment)}
        />

        <AppointmentPopDone
          open={isDetailOpen}
          appointment={selectedAppointment || undefined}
          onClose={() => setIsDetailOpen(false)}
          onDelete={handleDeleteAppointment}
          onEdit={handleEditAppointment}
        />

        <QuickDialButton
          iconColor="#fff"
          position={"bottom-right"}
          icon={<AddRoundedIcon />}
          color={"#09BFF8"}
          onClickAction={handleClick}
        />
      </>

      <div className="scroll-area">
        <Tabs data={appointmentTabs} queryKey="tab" />

        <PetFilterSelector
          mode="filter"
          allowAllPets
          pets={petOptions}
          value={selectedPetId}
          onChange={setSelectedPetId}
          placeholder="Select your pet"
        />

        {/* shared calendar module */}
        <CalendarModule
          size="standard"
          weekStart="sun"
          showOutsideDays
          showMarkers
          selectedDate={selectedDate}
          month={monthCursor}
          dayMeta={dayMeta}
          maxMarkersPerDay={3}
          onSelectDate={(d) => setSelectedDate(d)}
          onMonthChange={(m) => setMonthCursor(m)}
        />

        <div className="head-text">Upcoming appointments</div>

        {/* UI if no appointments */}
        {upcomingAppointmentsByDate.length === 0 ? (
          <div className="mt-8 text-center text-gray-400 text-sm">
            No upcoming appointments
          </div>
        ) : (
          upcomingAppointmentsByDate.map(({ dateKey, items }) => (
            <React.Fragment key={dateKey}>
              <div className="date-text">
                {dayjs(dateKey).format("ddd, DD/MM/YYYY")}
              </div>
              <div className="line" />

              {items.map((appointment, index) => (
                <button
                  key={`${appointment.dateKey}-${appointment.pet}-${index}`}
                  type="button"
                  className="appointment-card"
                  onClick={() => handleOpenAppointment(appointment)}
                >
                  <AppointmentBox
                    petName={appointment.pet}
                    locationText={appointment.location}
                    dateText={dayjs(appointment.dateKey).format("DD/MM/YYYY")}
                    timeText={appointment.time}
                  />
                </button>
              ))}
            </React.Fragment>
          ))
        )}
      </div>
    </AppointmentPageStyled>
  );
};