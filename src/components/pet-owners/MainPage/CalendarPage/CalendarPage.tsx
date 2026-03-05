"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import dayjs from "dayjs";

import { Page as CalendarPageLayout } from "@/styles/components/calendar.styled";

import CalendarModule, {
    type CalendarDayMeta,
    type DayMarker,
    isoToLocalDate,
    localDateToISO,
} from "@/components/pet-owners/shared/CalendarModule";

import PetFilterSelector from "@/components/pet-owners/shared/PetFilterSelector";
import type { Pet, PetLite } from "@/types/domain/pet";
import { usePets } from "@/hooks/usePets";
import { useAppointments } from "@/hooks/useAppointments";
import { useSymptomRecords } from "@/hooks/useSymptomRecords";

import AddAppointmentPopup from "@/components/pet-owners/shared/appointment/AddAppointmentPopup";
import AppointmentCard from "@/components/pet-owners/shared/appointment/AppointmentCard";
import AppointmentDetail from "@/components/pet-owners/shared/appointment/AppointmentDetail";
import EditAppointment from "@/components/pet-owners/shared/appointment/EditAppointment";

import AddSymptomPopup from "@/components/pet-owners/shared/records/AddRecordPopup";
import RecordCard from "@/components/pet-owners/shared/records/RecordCard";
import EditRecordPopup, {
    type EditRecordFormState,
} from "@/components/pet-owners/shared/records/EditRecordPopup";
import RecordDetailPopup from "@/components/pet-owners/shared/records/RecordDetailPopup";

import SectionError from "@/components/pet-owners/shared/SectionError";

import {
    createAppointment,
    editAppointment,
    cancelAppointment,
    deleteAppointment,
    authStorage,
    getAppointmentDetail,
    createSymptomRecord,
    editSymptomRecord,
    deleteSymptomRecord,
} from "@/services/api/client";

import { Appointment } from "@/types/domain/appointment";
import { SymptomRecord } from "@/types/domain/symptom";
import { AddAppointmentPayload } from "@/types/api/appointment.dto";
import { AddSymptomPayload as AddSymptomPayloadDTO } from "@/types/api/record.dto";
import { exportICS } from "@/utils/exportICS";

const AddIcon = () => <Image width={24} height={24} src="/add-new.svg" alt="add" style={{ width: 24, height: 24, filter: 'brightness(0) invert(1)' }} />;
const EventNoteIcon = ({ sx }: { sx?: { color?: string; fontSize?: number } }) => (
    <Image width={24} height={24} src="/note.svg" alt="note" style={{ width: sx?.fontSize || 20, height: sx?.fontSize || 20, filter: sx?.color === '#fff' ? 'brightness(0) invert(1)' : undefined }} />
);
const AssignmentIcon = ({ sx }: { sx?: { color?: string; fontSize?: number } }) => (
    <Image width={24} height={24} src="/record.svg" alt="record" style={{ width: sx?.fontSize || 20, height: sx?.fontSize || 20, filter: sx?.color === '#fff' ? 'brightness(0) invert(1)' : undefined }} />
);
import { theme } from "@/styles/tokens/theme";

import Image from 'next/image';
/* ─────────────── helpers ─────────────── */
function pad2(n: number) {
    return String(n).padStart(2, "0");
}
function formatHeaderDate(isoDate: string) {
    const d = new Date(`${isoDate}T00:00:00`);
    if (isNaN(d.getTime())) return isoDate;
    const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
    return `${weekday}, ${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}
function formatTime(t: string) {
    if (!t) return "";
    const [h, m] = t.split(":");
    return `${h}:${m}`;
}

/* ─────────────── unified item type ─────────────── */
type UnifiedItem =
    | { kind: "appointment"; data: Appointment; sortTime: string }
    | { kind: "record"; data: SymptomRecord; sortTime: string; petName: string; avatarUrl?: string };

/* ─────────────── Speed Dial FAB ─────────────── */
function SpeedDial({
    onAddAppointment,
    onAddRecord,
}: {
    onAddAppointment: () => void;
    onAddRecord: () => void;
}) {
    const [open, setOpen] = useState(false);

    const handleAppt = () => {
        setOpen(false);
        onAddAppointment();
    };
    const handleRecord = () => {
        setOpen(false);
        onAddRecord();
    };

    return (
        <div
            style={{
                position: "fixed",
                bottom: 80,
                right: 10,
                zIndex: 50,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 10,
            }}
        >
            {/* Sub-options */}
            {open && (
                <>
                    {/* Appointment */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            animation: "speedDialIn 0.18s ease both",
                        }}
                    >
                        <span
                            style={{
                                background: "white",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                borderRadius: 20,
                                padding: "3px 10px",
                                fontSize: 12,
                                fontWeight: 600,
                                color: theme.colors.appoint,
                                whiteSpace: "nowrap",
                            }}
                        >
                            Appointment
                        </span>
                        <button
                            onClick={handleAppt}
                            aria-label="Add appointment"
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: "50%",
                                background: theme.colors.appoint,
                                border: "none",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 3px 10px rgba(14,165,233,0.45)",
                                flexShrink: 0,
                                transition: "transform 0.15s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                        >
                            <EventNoteIcon sx={{ color: "#fff", fontSize: 20 }} />
                        </button>
                    </div>

                    {/* Record */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            animation: "speedDialIn 0.22s ease both",
                        }}
                    >
                        <span
                            style={{
                                background: "white",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                borderRadius: 20,
                                padding: "3px 10px",
                                fontSize: 12,
                                fontWeight: 600,
                                color: theme.colors.record,
                                whiteSpace: "nowrap",
                            }}
                        >
                            Record
                        </span>
                        <button
                            onClick={handleRecord}
                            aria-label="Add record"
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: "50%",
                                background: theme.colors.record,
                                border: "none",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: `0 3px 10px ${theme.colors.record}70`,
                                flexShrink: 0,
                                transition: "transform 0.15s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                        >
                            <AssignmentIcon sx={{ color: "#fff", fontSize: 20 }} />
                        </button>
                    </div>
                </>
            )}

            {/* Main FAB */}
            <button
                onClick={() => setOpen((v) => !v)}
                aria-label={open ? "Close menu" : "Add new"}
                style={{
                    width: 46,
                    height: 46,
                    borderRadius: "50%",
                    background: theme.colors.primary,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 4px 12px ${theme.colors.primary}80`,
                    transition: "transform 0.2s ease, filter 0.2s ease",
                    flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.filter = "brightness(90%)";
                    e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.filter = "brightness(100%)";
                    e.currentTarget.style.transform = "scale(1)";
                }}
            >
                <span
                    style={{
                        color: "white",
                        display: "flex",
                        transition: "transform 0.25s ease",
                        transform: open ? "rotate(45deg)" : "rotate(0deg)",
                    }}
                >
                    <AddIcon />
                </span>
            </button>
        </div>
    );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE CONTENT
═══════════════════════════════════════════════ */
function UnifiedCalendarPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const popupParam = searchParams.get("popup");
    const appointmentIdParam = searchParams.get("appointment_id");
    const recordIdParam = searchParams.get("record_id");

    /* ── pets ── */
    const { pets } = usePets();
    const petOptions: PetLite[] = useMemo(
        () => pets.map((p: Pet) => ({ pet_id: p.pet_id, name: p.name, profile_image: p.profile_image })),
        [pets]
    );
    const [selectedPetId, setSelectedPetId] = useState<number>(0);

    /* ── calendar ── */
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [monthCursor, setMonthCursor] = useState<Date>(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    );
    const selectedIso = useMemo(() => localDateToISO(selectedDate), [selectedDate]);

    /* ── appointment data ── */
    const {
        appointments: apiAppointments,
        loading: apptError,
        refetch: refetchAppts,
    } = useAppointments();

    const filteredAppts = useMemo(() => {
        if (selectedPetId === 0) return apiAppointments;
        return apiAppointments.filter((a) => a.pet_id === selectedPetId);
    }, [apiAppointments, selectedPetId]);

    /* ── record data ── */
    const { records, error: recError, refetch: refetchRecs } = useSymptomRecords(selectedPetId || null);

    const filteredRecs = useMemo(() => {
        return records.filter((r) => selectedPetId === 0 || r.pet_id === selectedPetId);
    }, [records, selectedPetId]);

    const petById = useMemo(() => {
        const m = new Map<number, PetLite>();
        petOptions.forEach((p) => m.set(p.pet_id, p));
        return m;
    }, [petOptions]);

    /* ── dayMeta (markers) ── */
    const dayMeta: CalendarDayMeta[] = useMemo(() => {
        const map = new Map<string, DayMarker[]>();

        filteredAppts.forEach((a) => {
            const key = dayjs(a.appointment_date).format("YYYY-MM-DD");
            const arr = map.get(key) ?? [];
            // Only add appointment dot once per day
            if (!arr.some((m) => m.colorKey === "appointment")) {
                arr.push({ type: "dot", colorKey: "appointment" });
            }
            map.set(key, arr);
        });

        filteredRecs.forEach((r) => {
            if (!r.date_added) return;
            const arr = map.get(r.date_added) ?? [];
            // Only add record dot once per day
            if (!arr.some((m) => m.colorKey === "record")) {
                arr.push({ type: "dot", colorKey: "record" });
            }
            map.set(r.date_added, arr);
        });

        return Array.from(map.entries()).map(([iso, markers]) => ({
            date: isoToLocalDate(iso),
            markers,
        }));
    }, [filteredAppts, filteredRecs]);

    /* ── combined items on selected date ── */
    const itemsOnSelectedDate: UnifiedItem[] = useMemo(() => {
        const items: UnifiedItem[] = [];

        filteredAppts
            .filter((a) => dayjs(a.appointment_date).format("YYYY-MM-DD") === selectedIso)
            .forEach((a) => {
                const t = a.appointment_time || dayjs(a.appointment_date).format("HH:mm");
                items.push({ kind: "appointment", data: a, sortTime: t });
            });

        filteredRecs
            .filter((r) => r.date_added === selectedIso)
            .forEach((r) => {
                const pet = petById.get(r.pet_id);
                items.push({
                    kind: "record",
                    data: r,
                    sortTime: r.time_added || "00:00",
                    petName: pet?.name ?? "-",
                    avatarUrl: pet?.profile_image ?? undefined,
                });
            });

        return items.sort((a, b) => a.sortTime.localeCompare(b.sortTime));
    }, [filteredAppts, filteredRecs, selectedIso, petById]);

    /* ── popup state ── */
    const [openAddAppt, setOpenAddAppt] = useState(false);
    const [openAddRec, setOpenAddRec] = useState(false);
    const [apptDetail, setApptDetail] = useState<Appointment | null>(null);
    const [apptEditing, setApptEditing] = useState<Appointment | null>(null);
    const [recDetail, setRecDetail] = useState<SymptomRecord | null>(null);
    const [recEditing, setRecEditing] = useState<SymptomRecord | null>(null);

    /* ── deep-link effect ── */
    useEffect(() => {
        const run = async () => {
            const token = authStorage.getToken() || "";
            if (popupParam === "add-appointment") {
                setOpenAddAppt(true);
            } else if (popupParam === "add-record") {
                setOpenAddRec(true);
            } else if (popupParam === "view-appointment" && appointmentIdParam) {
                try {
                    const data = await getAppointmentDetail(token, Number(appointmentIdParam));
                    setApptDetail(data);
                } catch (err) {
                    console.error("Failed to fetch appointment detail:", err);
                }
            } else if (popupParam === "edit-appointment" && appointmentIdParam) {
                try {
                    const data = await getAppointmentDetail(token, Number(appointmentIdParam));
                    setApptEditing(data);
                } catch (err) {
                    console.error("Failed to fetch appointment for edit:", err);
                }
            } else if (popupParam === "view-record" && recordIdParam) {
                const target = records.find((r) => String(r.record_id) === recordIdParam);
                if (target) setRecDetail(target);
            } else if (popupParam === "edit-record" && recordIdParam) {
                const target = records.find((r) => String(r.record_id) === recordIdParam);
                if (target) setRecEditing(target);
            }
        };
        if (popupParam) run();
    }, [popupParam, appointmentIdParam, recordIdParam, records]);

    /* ── URL helpers ── */
    function pushParams(extra: Record<string, string>) {
        const p = new URLSearchParams(searchParams.toString());
        Object.entries(extra).forEach(([k, v]) => p.set(k, v));
        router.push(`${pathname}?${p.toString()}`);
    }
    function clearPopupParams() {
        const p = new URLSearchParams(searchParams.toString());
        p.delete("popup");
        p.delete("appointment_id");
        p.delete("record_id");
        router.replace(`${pathname}?${p.toString()}`);
    }

    /* ── open actions ── */
    const openAddAppointment = () => {
        setOpenAddAppt(true);
        pushParams({ popup: "add-appointment" });
    };
    const openAddRecord = () => {
        setOpenAddRec(true);
        pushParams({ popup: "add-record" });
    };
    const openViewAppt = (a: Appointment) =>
        pushParams({ popup: "view-appointment", appointment_id: String(a.appointment_id) });

    const openEditAppt = (a: Appointment) =>
        pushParams({ popup: "edit-appointment", appointment_id: String(a.appointment_id) });

    const openViewRec = (r: SymptomRecord) => {
        setRecDetail(r);
        pushParams({ popup: "view-record", record_id: String(r.record_id) });
    };
    const openEditRec = (r: SymptomRecord) => {
        setRecEditing(r);
        pushParams({ popup: "edit-record", record_id: String(r.record_id) });
    };

    /* ── close ── */
    const closeAll = () => {
        setOpenAddAppt(false);
        setOpenAddRec(false);
        setApptDetail(null);
        setApptEditing(null);
        setRecDetail(null);
        setRecEditing(null);
        clearPopupParams();
    };

    /* ── appointment handlers ── */
    const handleCreateAppt = async (data: AddAppointmentPayload) => {
        try {
            const token = authStorage.getToken();
            if (!token) throw new Error("No token");
            await createAppointment(token, data);
            await refetchAppts();
            closeAll();
        } catch (err) {
            console.error("Failed to create appointment:", err);
        }
    };

    const handleEditAppt = async (data: Appointment) => {
        try {
            const token = authStorage.getToken();
            if (!token) throw new Error("No token");
            if (data.status === "Canceled") {
                await cancelAppointment(token, data.appointment_id);
            } else {
                await editAppointment(token, data.appointment_id, {
                    appointment_date: data.appointment_date,
                    location: data.location,
                    status: data.status,
                    note: data.note,
                });
            }
            await refetchAppts();
            closeAll();
        } catch (err) {
            console.error("Failed to edit appointment:", err);
        }
    };

    const handleCancelAppt = async (id: number) => {
        try {
            const token = authStorage.getToken();
            if (!token) throw new Error("No token");
            await cancelAppointment(token, id);
            await refetchAppts();
            closeAll();
        } catch (err) {
            console.error("Failed to cancel appointment:", err);
        }
    };

    const handleDeleteAppt = async (id: number) => {
        if (!confirm("Are you sure you want to delete this appointment?")) return;
        try {
            const token = authStorage.getToken();
            if (!token) throw new Error("No token");
            await deleteAppointment(token, id);
            await refetchAppts();
            setApptDetail(null);
        } catch (err) {
            console.error("Failed to delete appointment:", err);
        }
    };

    /* ── record handlers ── */
    const handleCreateRec = async (data: AddSymptomPayloadDTO) => {
        try {
            const token = authStorage.getToken();
            if (!token) throw new Error("No token");
            await createSymptomRecord(token, data);
            await refetchRecs();
            closeAll();
        } catch (err) {
            console.error("Failed to create record:", err);
        }
    };

    const handleEditRec = async (record_id: number, payload: EditRecordFormState) => {
        try {
            const token = authStorage.getToken();
            if (!token) throw new Error("No token");
            await editSymptomRecord(token, record_id, {
                note: payload.note,
                note_image: [...payload.existingImages, ...payload.newImages],
                date_added: payload.date,
                time_added: payload.time,
            });
            await refetchRecs();
            closeAll();
        } catch (err) {
            console.error("Failed to edit record:", err);
        }
    };

    const handleDeleteRec = async (id: number) => {
        try {
            if (!confirm("Are you sure?")) return;
            const token = authStorage.getToken();
            if (!token) throw new Error("No token");
            await deleteSymptomRecord(token, id);
            await refetchRecs();
            setRecDetail(null);
            closeAll();
        } catch (err) {
            console.error("Failed to delete record:", err);
        }
    };

    const hasError = apptError || recError;

    return (
        <CalendarPageLayout>
            {/* ── Popups ── */}
            <AddAppointmentPopup
                allPets={petOptions}
                open={openAddAppt}
                onClose={closeAll}
                initialDate={selectedIso}
                initialPetId={selectedPetId !== 0 ? selectedPetId : undefined}
                onSubmit={handleCreateAppt}
            />
            <AddSymptomPopup
                open={openAddRec}
                onClose={closeAll}
                allPets={petOptions}
                initialPetId={selectedPetId || null}
                onSubmit={handleCreateRec}
            />
            <AppointmentDetail
                open={!!apptDetail}
                appointment={apptDetail}
                onClose={closeAll}
                onEdit={(a) => { setApptDetail(null); openEditAppt(a); }}
                onDelete={handleDeleteAppt}
                onAddToCalendar={(a) => {
                    const start = dayjs(`${a.appointment_date} ${a.appointment_time}`).toDate();
                    const end = dayjs(start).add(1, "hour").toDate();
                    exportICS({ title: `${a.pet_name} Appointment`, description: `Pet ID: ${a.pet_id}`, location: a.location, start, end });
                }}
            />
            <EditAppointment
                open={!!apptEditing}
                appointment={apptEditing}
                onClose={closeAll}
                onSave={handleEditAppt}
                onCancelAppointment={handleCancelAppt}
            />
            <EditRecordPopup
                open={!!recEditing}
                record={recEditing}
                onClose={closeAll}
                onSave={handleEditRec}
                maxImages={4}
            />
            <RecordDetailPopup
                open={!!recDetail}
                record={recDetail}
                onClose={closeAll}
                onEdit={(rec) => { setRecDetail(null); openEditRec(rec); }}
                onDelete={handleDeleteRec}
                formatTime={formatTime}
            />

            {/* ── Speed Dial ── */}
            <SpeedDial onAddAppointment={openAddAppointment} onAddRecord={openAddRecord} />

            {/* ── Sticky header: pet filter ── */}
            <div className="sticky top-0 z-40 bg-gray-50 pt-2 pb-1">
                <PetFilterSelector
                    mode="filter"
                    allowAllPets
                    pets={petOptions}
                    value={selectedPetId}
                    onChange={(id) => setSelectedPetId(id || 0)}
                />
            </div>

            <div className="scroll-area">
                {/* ── Calendar ── */}
                <CalendarModule
                    size="standard"
                    weekStart="sun"
                    showOutsideDays
                    showMarkers
                    selectedDate={selectedDate}
                    month={monthCursor}
                    dayMeta={dayMeta}
                    maxMarkersPerDay={2}
                    onSelectDate={setSelectedDate}
                    onMonthChange={setMonthCursor}
                    variant="card"
                />

                {/* ── Legend ── */}
                <div className="flex justify-end items-center gap-4 px-1">
                    <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full inline-block" style={{ background: theme.colors.appoint }} />
                        <span className="text-xs text-zinc-500">Appointment</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full inline-block" style={{ background: theme.colors.record }} />
                        <span className="text-xs text-zinc-500">Record</span>
                    </div>
                </div>

                {/* ── Section heading ── */}
                <div className="head-text">Schedule</div>

                {/* ── Error ── */}
                {hasError ? (
                    <SectionError
                        message="Failed to load data"
                        onRetry={() => { refetchAppts(); refetchRecs(); }}
                    />
                ) : itemsOnSelectedDate.length === 0 ? (
                    <div className="mt-8 text-center text-gray-400 text-sm">
                        No appointments or records on this date
                    </div>
                ) : (
                    <>
                        <div className="date-text">{formatHeaderDate(selectedIso)}</div>
                        <div className="line" />
                        {itemsOnSelectedDate.map((item) => {
                            if (item.kind === "appointment") {
                                return (
                                    <AppointmentCard
                                        key={`appt-${item.data.appointment_id}`}
                                        appointment={item.data}
                                        onClick={() => openViewAppt(item.data)}
                                    />
                                );
                            }
                            return (
                                <RecordCard
                                    key={`rec-${item.data.record_id}`}
                                    petName={item.petName}
                                    time={formatTime(item.data.time_added)}
                                    note={item.data.note}
                                    avatarUrl={item.avatarUrl}
                                    imageUrls={item.data.note_image ?? []}
                                    onClick={() => openViewRec(item.data)}
                                />
                            );
                        })}
                    </>
                )}
            </div>

            {/* Speed-dial animation keyframes */}
            <style>{`
        @keyframes speedDialIn {
          from { opacity: 0; transform: translateY(12px) scale(0.9); }
          to   { opacity: 1; transform: translateY(0)    scale(1);   }
        }
      `}</style>
        </CalendarPageLayout>
    );
}

/* ─────────────── Export ─────────────── */
export default function Page() {
    return (
        <Suspense fallback={<div className="p-4 text-center text-gray-500">Loading...</div>}>
            <UnifiedCalendarPageContent />
        </Suspense>
    );
}