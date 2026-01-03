"use client";
import React, { useState } from "react";
import dayjs from "dayjs";
import styled from "styled-components";
import { Tabs } from "@/components/common/Tabs";
import PetList from "@/components/calendarpage/PetList";
import Calendar from "@/components/calendarpage/Calendar";
import RecordModal from "@/components/calendarpage/RecordModal";
import RecordPopUp from "@/components/calendarpage/RecordPopUp";
import { QuickDialButton } from "../common/QuickDialButton";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

const RecordPageStyled = styled.div`
    width: 100%;
    height: calc(100vh - 60px);
    overflow: hidden;
    position: relative;

    .scroll-area {
        height: 100%;
        overflow: auto;
        display: flex;
        flex-direction: column;
        row-gap: 10px;
        padding: 16px;
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
    .record-card{
        border: none;
        background: transparent;
        padding: 0;
        text-align: left;
        cursor: pointer;
    }
`;

const recordTabs = [
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

type RecordEntry = {
    id: string;
    dateKey: string;
    pet: string;
    time: string;
    note: string;
    petImage?: string;
    pid?: string;
    attachmentCount?: number;
};

const PET_META: Record<string, { pid?: string; image?: string }> = {
    cat: { pid: "098765345", image: "/pets-example/pet-ex1.svg" },
    dog: { image: "/pets-example/pet-ex1.svg" },
};

const recordSamples: RecordEntry[] = [
    {
        id: "record-1",
        dateKey: "2026-01-03",
        time: "11:00",
        pet: "Lee",
        note: "มีอาการซึมไม่อยากอาหาร\nมีอาเจียนเล็กน้อย",
        petImage: "/pets-example/pet-ex1.svg",
        attachmentCount: 3,
    },
];

export const RecordPage = () => {
    const [records, setRecords] = useState<RecordEntry[]>(recordSamples);
    const [selectedPetId, setSelectedPetId] = useState("all");
    const [isRecordPopUpOpen, setIsRecordPopUpOpen] = useState(false);
    const handleClick = () => {
        setIsRecordPopUpOpen(true);
    };
    const handleCreateRecord = ({
        date,
        pet,
        time,
        note,
    }: {
        date: Date;
        pet: string;
        time: string;
        note: string;
    }) => {
        const normalizedPet = pet.trim().toLowerCase();
        const dateKey = dayjs(date).format("YYYY-MM-DD");
        const petMeta = PET_META[normalizedPet];
        setRecords((prev) => {
            const hasSameSlot = prev.some(
                (item) =>
                    item.pet.trim().toLowerCase() === normalizedPet &&
                    item.dateKey === dateKey &&
                    item.time === time
            );
            if (hasSameSlot) {
                return prev;
            }
            return [
                ...prev,
                {
                    id: `record-${Date.now()}`,
                    dateKey,
                    pet: normalizedPet,
                    time,
                    note: note.trim(),
                    petImage: petMeta?.image,
                    pid: petMeta?.pid,
                },
            ];
        });
    };
    const petOptions = React.useMemo(() => {
        const map = new Map<string, { id: string; name: string; image?: string; pid?: string }>();
        records.forEach((record) => {
            if (!map.has(record.pet)) {
                const petMeta = PET_META[record.pet];
                map.set(record.pet, {
                    id: record.pet,
                    name: record.pet,
                    image: record.petImage ?? petMeta?.image,
                    pid: record.pid ?? petMeta?.pid,
                });
            }
        });
        return Array.from(map.values());
    }, [records]);
    React.useEffect(() => {
        if (selectedPetId !== "all" && !petOptions.some((pet) => pet.id === selectedPetId)) {
            setSelectedPetId("all");
        }
    }, [petOptions, selectedPetId]);
    const filteredRecords = React.useMemo(() => {
        return records.filter(
            (record) => selectedPetId === "all" || record.pet === selectedPetId
        );
    }, [records, selectedPetId]);
    const sortedRecords = React.useMemo(() => {
        return [...filteredRecords].sort((a, b) => {
            if (a.dateKey === b.dateKey) {
                return a.time.localeCompare(b.time);
            }
            return a.dateKey.localeCompare(b.dateKey);
        });
    }, [filteredRecords]);
    const recordsByDate = React.useMemo(() => {
        const map: Record<string, RecordEntry[]> = {};
        sortedRecords.forEach((record) => {
            if (!map[record.dateKey]) {
                map[record.dateKey] = [];
            }
            map[record.dateKey].push(record);
        });
        return Object.entries(map)
            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
            .map(([dateKey, items]) => ({
                dateKey,
                items,
            }));
    }, [sortedRecords]);
    const recordPetsByDate = React.useMemo(() => {
        const map: Record<string, string[]> = {};
        filteredRecords.forEach(({ dateKey, pet }) => {
            if (!map[dateKey]) {
                map[dateKey] = [pet];
                return;
            }
            if (!map[dateKey].includes(pet)) {
                map[dateKey].push(pet);
            }
        });
        return map;
    }, [filteredRecords]);

    return (
        <RecordPageStyled>
            <div className="scroll-area">
                <Tabs data={recordTabs} queryKey="tab" />
                <PetList
                    pets={petOptions}
                    selectedPetId={selectedPetId}
                    onSelectPet={setSelectedPetId}
                />
                <Calendar appointmentPetsByDate={recordPetsByDate} />
                <div className="head-text">Records</div>
                {recordsByDate.map(({ dateKey, items }) => (
                    <React.Fragment key={dateKey}>
                        <div className="date-text">
                            {dayjs(dateKey).format("ddd, DD/MM/YYYY")}
                        </div>
                        <div className="line"> </div>
                        {items.map((record) => (
                            <button key={record.id} type="button" className="record-card">
                                <RecordModal
                                    timeText={record.time}
                                    petName={record.pet}
                                    noteText={record.note}
                                    petImage={record.petImage}
                                    attachmentCount={record.attachmentCount}
                                />
                            </button>
                        ))}
                    </React.Fragment>
                ))}
            </div>
            <QuickDialButton
                iconColor="#fff"
                position="bottom-right"
                icon={<AddRoundedIcon />}
                color="#09BFF8"
                onClickAction={handleClick}
            />
            <RecordPopUp
                open={isRecordPopUpOpen}
                onOpenChange={setIsRecordPopUpOpen}
                onCreateRecord={handleCreateRecord}
            />
        </RecordPageStyled>
    );
};
