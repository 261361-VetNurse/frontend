"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import TopBar from "@/components/pet-owners/layout/TopBar";
import PetSelectorCard from "@/components/pet-owners/MainPage/MyPetsPage/PetSelectorCard";
import AddMedicationPopupV2, { type AddMedicationPayloadV2 } from "./AddMedicationPopupV2";
import EditMedicationPopupV2, {type EditMedicationPayload,} from "./EditMedicationPopupV2";
import MedicationDetailPopupV2 from "./MedicationDetailPopupV2";
import { mockPetInformationById } from "@/mocks/petInformation";
import {
  TabsWrap,
  TabButton,
  Header,
  CardList,
  FabButton,
} from "../../../../../styles/medication.styled";

import { Add } from "@mui/icons-material";

type TabType = "today" | "tomorrow" | "other";

export type MedicationRecordV2 = {
  id: string;
  petId: string;
  petName: string;
  medicationName: string;
  dose: string;  
  times: string; 
  note?: string;
  avatarUrl?: string;
  recordDate?: string; 
};

type PetOption = {
  id: string;
  name: string;
  pid: string;
  imageUrl?: string;
};

type PetLite = {
  id: string;
  name: string;
  pid: string;
  avatarUrl?: string;
};

const getMockRecords = (): Record<TabType, MedicationRecordV2[]> => {
  const today = new Date();
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(today.getDate() + 2);

  const thirdDay = new Date(today);
  thirdDay.setDate(today.getDate() + 3);

  const fmtISO = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  return {
    today: [
      {
        id: "1",
        petId: "4302459",
        petName: "Luna",
        medicationName: "Prednisolone 5mg",
        dose: "ครั้งละ 2 เม็ด",
        times: "วันละสองครั้ง",
        note: "Note : Morning and evening",
        avatarUrl: "/pets-example/pet-ex1.svg",
      },
    ],
    tomorrow: [],
    other: [
      {
        id: "4",
        petId: "4302459",
        petName: "Luna",
        medicationName: "Samylin Medium Breed",
        dose: "ครั้งละ 1 ซอง",
        times: "วันละครั้ง",
        note: "Note : กินผสมอาหาร, ช่วยบำรุงตับ",
        avatarUrl: "/pets-example/pet-ex1.svg",
        recordDate: fmtISO(dayAfterTomorrow),
      },
      {
        id: "6",
        petId: "4302459",
        petName: "Luna",
        medicationName: "Samylin Medium Breed",
        dose: "ครั้งละ 1 ซอง",
        times: "วันละครั้ง",
        note: "Note : กินผสมอาหาร, ช่วยบำรุงตับ",
        avatarUrl: "/pets-example/pet-ex1.svg",
        recordDate: fmtISO(thirdDay),
      },
    ],
  };
};

function formatHeaderDate(tab: Exclude<TabType, "other">) {
  const today = new Date();
  const d = new Date(today);
  if (tab === "tomorrow") d.setDate(today.getDate() + 1);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayName = days[d.getDay()];
  return `${dayName}, ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function formatGroupDate(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;

  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${weekday}, ${dd}/${mm}/${yyyy}`;
}

function groupByDate(items: MedicationRecordV2[]) {
  const map = new Map<string, MedicationRecordV2[]>();
  for (const r of items) {
    const key = r.recordDate ?? "Unknown date";
    map.set(key, [...(map.get(key) ?? []), r]);
  }

  return Array.from(map.entries()).sort((a, b) => {
    if (a[0] === "Unknown date") return 1;
    if (b[0] === "Unknown date") return -1;
    return a[0].localeCompare(b[0]);
  });
}

function getHeaderTitle(tab: TabType) {
  if (tab === "today") return "Today record";
  if (tab === "tomorrow") return "Tomorrow record";
  return "Other record";
}

export default function MedicationPageV2() {
  const router = useRouter();
  const { petId } = useParams<{ petId: string }>();

  const petOptions: PetOption[] = useMemo(() => {
    return Object.values(mockPetInformationById).map((p) => ({
      id: String(p.header.id),
      name: p.header.name,
      pid: p.header.pid,
      imageUrl: p.header.avatarUrl,
    }));
  }, []);

  const [selectedPetId, setSelectedPetId] = useState<string>(
    String(petId ?? petOptions[0]?.id ?? "")
  );

  useEffect(() => {
    if (!petId) return;
    const idFromUrl = String(petId);
    const exists = petOptions.some((p) => p.id === idFromUrl);
    if (exists) setSelectedPetId(idFromUrl);
  }, [petId, petOptions]);

  const selectedPet = useMemo(() => {
    return petOptions.find((p) => p.id === selectedPetId) ?? petOptions[0];
  }, [petOptions, selectedPetId]);

  const lockedPet: PetLite = useMemo(
    () => ({
      id: selectedPet?.id ?? "",
      name: selectedPet?.name ?? "-",
      pid: selectedPet?.pid ?? "-",
      avatarUrl: selectedPet?.imageUrl,
    }),
    [selectedPet]
  );

  const [tab, setTab] = useState<TabType>("today");

  const [recordsByTab, setRecordsByTab] = useState<Record<TabType, MedicationRecordV2[]>>(
    getMockRecords()
  );

  const filteredRecords = useMemo(() => {
    const list = recordsByTab[tab] ?? [];
    return list.filter((r) => String(r.petId) === String(selectedPetId));
  }, [recordsByTab, tab, selectedPetId]);

  const [showAdd, setShowAdd] = useState(false);
  const [detailRecord, setDetailRecord] = useState<MedicationRecordV2 | null>(null);
  const [editRecord, setEditRecord] = useState<MedicationRecordV2 | null>(null);

  return (
    <>
      <TopBar title="Medication" onBack={() => router.push(`/pet-owners/my-pets-page/${selectedPet?.id}`)} />

      <div style={{ marginTop: 8 }}>
        <PetSelectorCard
          name={selectedPet?.name ?? "-"}
          pid={selectedPet?.pid ?? "-"}
          imageUrl={selectedPet?.imageUrl}
          options={petOptions}
          selectedId={selectedPetId}
          onSelect={(id) => {
            setSelectedPetId(id);
            router.push(`/pet-owners/my-pets-page/${id}/medications`);
          }}
        />
      </div>

      <div style={{ marginTop: 8 }}>
        <TabsWrap>
          <TabButton $active={tab === "today"} onClick={() => setTab("today")}>
            Today
          </TabButton>
          <TabButton $active={tab === "tomorrow"} onClick={() => setTab("tomorrow")}>
            Tomorrow
          </TabButton>
          <TabButton $active={tab === "other"} onClick={() => setTab("other")}>
            Other
          </TabButton>
        </TabsWrap>
      </div>

      <div style={{ marginTop: 8 }}>
        {tab === "other" ? (
          <Header>
            <div className="Title">{getHeaderTitle(tab)}</div>
          </Header>
        ) : (
          <Header>
            <div className="Title">{getHeaderTitle(tab)}</div>
            <div className="DateText">{formatHeaderDate(tab)}</div>
          </Header>
        )}
      </div>

      <div style={{ marginTop: 8 }}>
        <CardList>
          {filteredRecords.length === 0 ? (
            <div style={{ fontSize: 14, color: "#71717a" }}>No records</div>
          ) : tab === "other" ? (
            groupByDate(filteredRecords).map(([dateKey, items]) => (
              <div className="DateGroup" key={dateKey}>
                <div className="GroupHeader">
                  {dateKey === "Unknown date" ? "Unknown date" : formatGroupDate(dateKey)}
                </div>

                {items.map((record) => (
                  <div
                    className="Card"
                    key={record.id}
                    onClick={() => setDetailRecord(record)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="CardTopRow">
                      <div className="ScheduleText">{`${record.dose} ${record.times}`}</div>
                    </div>

                    <div className="CardBody">
                      <div className="AvatarWrap">
                        {record.avatarUrl ? (
                          <Image src={record.avatarUrl} alt={record.petName} width={40} height={40} />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              backgroundColor: "#E5E7EB",
                              borderRadius: "50%",
                            }}
                          />
                        )}
                      </div>

                      <div className="TextCol">
                        <div className="PetName">{record.petName}</div>
                        <div className="MedName">{record.medicationName}</div>
                        {record.note && <div className="Note">{record.note}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          ) : (
            filteredRecords.map((record) => (
              <div
                className="Card"
                key={record.id}
                onClick={() => setDetailRecord(record)}
                style={{ cursor: "pointer" }}
              >
                <div className="CardTopRow">
                  <div className="ScheduleText">{`${record.dose} ${record.times}`}</div>
                </div>

                <div className="CardBody">
                  <div className="AvatarWrap">
                    {record.avatarUrl ? (
                      <Image src={record.avatarUrl} alt={record.petName} width={40} height={40} />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          backgroundColor: "#E5E7EB",
                          borderRadius: "50%",
                        }}
                      />
                    )}
                  </div>

                  <div className="TextCol">
                    <div className="PetName">{record.petName}</div>
                    <div className="MedName">{record.medicationName}</div>
                    {record.note && <div className="Note">{record.note}</div>}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardList>
      </div>

      <FabButton onClick={() => setShowAdd(true)}>
        <Add />
      </FabButton>

      <AddMedicationPopupV2
        open={showAdd}
        onClose={() => setShowAdd(false)}
        pet={lockedPet}
        onSubmit={(data: AddMedicationPayloadV2) => {
          console.log("add medication", data);

          const newItem: MedicationRecordV2 = {
            id: crypto.randomUUID(),
            petId: lockedPet.id,
            petName: lockedPet.name,
            medicationName: data.medicationName,
            dose: data.dose,
            times: data.times,
            note: data.note,
            avatarUrl: lockedPet.avatarUrl,
          };

          setRecordsByTab((prev) => ({
            ...prev,
            today: [newItem, ...(prev.today ?? [])],
          }));

          setShowAdd(false);
        }}
      />

      <MedicationDetailPopupV2
        open={!!detailRecord}
        onClose={() => setDetailRecord(null)}
        pet={lockedPet}
        record={detailRecord}
        onEdit={() => {
          if (!detailRecord) return;
          setEditRecord(detailRecord);
          setDetailRecord(null);
        }}
        onDelete={() => {
          if (!detailRecord) return;
          const id = detailRecord.id;

          setRecordsByTab((prev) => ({
            today: prev.today.filter((x) => x.id !== id),
            tomorrow: prev.tomorrow.filter((x) => x.id !== id),
            other: prev.other.filter((x) => x.id !== id),
          }));

          setDetailRecord(null);
        }}
      />

      <EditMedicationPopupV2
        open={!!editRecord}
        onClose={() => setEditRecord(null)}
        pet={lockedPet}
        record={
          editRecord
            ? {
                id: editRecord.id,
                medicationName: editRecord.medicationName,
                dose: editRecord.dose,
                times: editRecord.times,
                note: editRecord.note,
              }
            : null
        }
        onSave={(data: EditMedicationPayload) => {
          console.log("save medication", data);

          setRecordsByTab((prev) => {
            const patch = (arr: MedicationRecordV2[]) =>
              arr.map((x) =>
                x.id === data.id
                  ? {
                      ...x,
                      medicationName: data.medicationName,
                      dose: data.dose,
                      times: data.times,
                      note: data.note,
                    }
                  : x
              );

            return {
              today: patch(prev.today ?? []),
              tomorrow: patch(prev.tomorrow ?? []),
              other: patch(prev.other ?? []),
            };
          });

          setEditRecord(null);
        }}
      />
    </>
  );
}
