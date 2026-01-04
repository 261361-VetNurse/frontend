"use client";
import React, { useState } from 'react';
import dayjs from "dayjs";
import styled from "styled-components";
import { Tabs } from "@/components/pet-owners/common/Tabs";
import PetList from "@/components/pet-owners/CalendarPage/PetList";
import Calendar from "@/components/pet-owners/CalendarPage/Calendar";
import AppointmentBox from "@/components/pet-owners/HomePage/appoint-box";
import {QuickDialButton} from "@/components/pet-owners/common/QuickDialButton";
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { PopUp } from "@/components/pet-owners/CalendarPage/AppointmentPopUp";
import AppointmentPopDone from "@/components/pet-owners/CalendarPage/AppointmentPopDone";

type Appointment = {
    dateKey: string;
    pet: string;
    time: string;
    location: string;
    status?: string;
    petImage?: string;
    pid?: string;
};

const PET_META: Record<string, { pid?: string; image?: string }> = {
    cat: { pid: "098765345", image: "/pets-example/pet-ex1.svg" },
    dog: { image: "/pets-example/pet-ex1.svg" },
};

const appointmentTabs = [
    {
        name: "Appointment",
        path: "/appointment",
        params: "appointment",
    },
    {
        name: "Record",
        path: "/record",
        params: "record",
    },
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
        padding: 8px 24px 96px;
    }
    .head-text{
        color: #000;
        font-size: 18px;
        font-weight: 500;
    }
    .date-text{
        color: #000;
        font-size: 14px;
        font-weight: 500;
    }
    .line{
        width: 345px;
        height: 1px;
        background: rgba(0, 0, 0, 0.20);
    }
    .appointment-card{
        border: none;
        background: transparent;
        padding: 0;
        text-align: left;
        cursor: pointer;
    }
`;

export const AppointmentPage = () => {
    const [isPopUpOpen, setIsPopUpOpen] = useState(false);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [selectedPetId, setSelectedPetId] = useState("all");
    const today = dayjs();
    const todayKey = today.format("YYYY-MM-DD");
    const editInitialValues = React.useMemo(() => {
        if (!editingAppointment) {
            return undefined;
        }
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
        console.log('handleClick');
        setEditingAppointment(null);
        setIsPopUpOpen(true);
    }
    const handlePopUpChange = (open: boolean) => {
        setIsPopUpOpen(open);
        if (!open) {
            setEditingAppointment(null);
        }
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
        const normalizedPet = pet.trim().toLowerCase();
        const dateKey = dayjs(date).format("YYYY-MM-DD");
        const petMeta = PET_META[normalizedPet];
        const nextAppointment: Appointment = {
            ...(editingAppointment ?? {}),
            dateKey,
            pet: normalizedPet,
            time,
            location,
            status: status ?? editingAppointment?.status,
            petImage: petMeta?.image ?? editingAppointment?.petImage,
            pid: petMeta?.pid ?? editingAppointment?.pid,
        };
        setAppointments((prev) => {
            if (editingAppointment) {
                const hasSameSlot = prev.some(
                    (item) =>
                        item !== editingAppointment &&
                        item.pet.trim().toLowerCase() === normalizedPet &&
                        item.dateKey === dateKey &&
                        item.time === time
                );
                if (hasSameSlot) {
                    return prev;
                }
                return prev.map((item) =>
                    item === editingAppointment ? nextAppointment : item
                );
            }
            const hasSameSlot = prev.some(
                (item) =>
                    item.pet.trim().toLowerCase() === normalizedPet &&
                    item.dateKey === dateKey &&
                    item.time === time
            );
            if (hasSameSlot) {
                return prev;
            }
            return [...prev, nextAppointment];
        });
        if (editingAppointment) {
            setSelectedAppointment(nextAppointment);
        }
    }
    const handleOpenAppointment = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setIsDetailOpen(true);
    }
    const handleDeleteAppointment = (appointment: Appointment) => {
        setAppointments((prev) => prev.filter((item) => item !== appointment));
        setIsDetailOpen(false);
        setSelectedAppointment(null);
    }
    const handleEditAppointment = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setEditingAppointment(appointment);
        setIsDetailOpen(false);
        setIsPopUpOpen(true);
    }
    const petOptions = React.useMemo(() => {
        const map = new Map<string, { id: string; name: string; image?: string; pid?: string }>();
        appointments.forEach((appointment) => {
            if (!map.has(appointment.pet)) {
                const petMeta = PET_META[appointment.pet];
                map.set(appointment.pet, {
                    id: appointment.pet,
                    name: appointment.pet,
                    image: appointment.petImage ?? petMeta?.image,
                    pid: appointment.pid ?? petMeta?.pid,
                });
            }
        });
        return Array.from(map.values());
    }, [appointments]);
    React.useEffect(() => {
        if (selectedPetId !== "all" && !petOptions.some((pet) => pet.id === selectedPetId)) {
            setSelectedPetId("all");
        }
    }, [petOptions, selectedPetId]);
    const filteredAppointments = React.useMemo(() => {
        return appointments.filter(
            (appointment) => selectedPetId === "all" || appointment.pet === selectedPetId
        );
    }, [appointments, selectedPetId]);
    const upcomingAppointments = React.useMemo(() => {
        return filteredAppointments
            .filter((appointment) => appointment.dateKey >= todayKey)
            .sort((a, b) => {
                if (a.dateKey === b.dateKey) {
                    return a.time.localeCompare(b.time);
                }
                return a.dateKey.localeCompare(b.dateKey);
            });
    }, [filteredAppointments, todayKey]);
    const upcomingAppointmentsByDate = React.useMemo(() => {
        const map: Record<string, typeof appointments> = {};
        upcomingAppointments.forEach((appointment) => {
            if (!map[appointment.dateKey]) {
                map[appointment.dateKey] = [];
            }
            map[appointment.dateKey].push(appointment);
        });
        return Object.entries(map)
            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
            .map(([dateKey, items]) => ({
                dateKey,
                items,
            }));
    }, [upcomingAppointments]);
    const appointmentPetsByDate = React.useMemo(() => {
        const map: Record<string, string[]> = {};
        upcomingAppointments.forEach(({ dateKey, pet }) => {
            if (!map[dateKey]) {
                map[dateKey] = [pet];
                return;
            }
            if (!map[dateKey].includes(pet)) {
                map[dateKey].push(pet);
            }
        });
        return map;
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
                <QuickDialButton iconColor='#fff' position={'bottom-right'} icon={<AddRoundedIcon/>} color={'#09BFF8'} onClickAction={handleClick}/>
            </>
            <div className="scroll-area">
                <Tabs data={appointmentTabs} queryKey="tab" />
                <PetList
                    pets={petOptions}
                    selectedPetId={selectedPetId}
                    onSelectPet={setSelectedPetId}
                />
                <Calendar appointmentPetsByDate={appointmentPetsByDate}/>
                <div className="head-text">Upcoming appointments</div>
                {upcomingAppointmentsByDate.map(({ dateKey, items }) => (
                    <React.Fragment key={dateKey}>
                        <div className="date-text">
                            {dayjs(dateKey).format("ddd, DD/MM/YYYY")}
                        </div>
                        <div className="line"> .</div>
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
                ))}
            </div>
        </AppointmentPageStyled>
    );
};
