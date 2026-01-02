'use client';

import { useState } from 'react';
import CreateMedicationPopup from './add-medication-popup';
import MedicationDetailPopup from './medication-detail-popup';
import EditMedicationPopup from './edit-medication-popup';
import Image from 'next/image';
import {
  Page,
  PetSelectButton,
  TabsWrap,
  TabButton,
  Header,
  CardList,
  FabButton,
} from '../../../styles/medication.styled';
import { Pets, ExpandMore, Add } from '@mui/icons-material';
import { theme } from '@/styles/theme';

// Types
type TabType = 'today' | 'tomorrow' | 'other';
type PetId = 'all' | string;

interface Pet {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface MedicationRecord {
  id: string;
  petId: string;
  petName: string;
  medicationName: string;
  schedule: string;
  note?: string;
  avatarUrl?: string;
  recordDate?: string; 
}

interface MedicationProps {
  records?: Record<TabType, MedicationRecord[]>;
  onAdd?: () => void;
  onSelectPet?: (petId: PetId) => void;
  onChangeTab?: (tab: TabType) => void;
}

// Mock data
const mockPets: Pet[] = [
  { id: '1', name: 'Max', avatarUrl: '/pets-example/pet-ex1.svg' },
  { id: '2', name: 'Luna', avatarUrl: '/pets-example/pet-ex1.svg' },
  { id: '3', name: 'Charlie', avatarUrl: '/pets-example/pet-ex1.svg' },
];

const getMockRecords = (): Record<TabType, MedicationRecord[]> => {
  const today = new Date();
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(today.getDate() + 2);
  
  const thirdDay = new Date(today);
  thirdDay.setDate(today.getDate() + 3);

  const formatDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return {
    today: [
      {
        id: '1',
        petId: '1',
        petName: 'Max',
        medicationName: 'Amoxicillin 250mg',
        schedule: 'ครั้งละ 1 ซอง วันละครั้ง',
        note: 'Note : Give after meal',
        avatarUrl: '/pets-example/pet-ex1.svg',
      },
      {
        id: '2',
        petId: '2',
        petName: 'Luna',
        medicationName: 'Prednisolone 5mg',
        schedule: 'ครั้งละ 2 เม็ด วันละสองครั้ง',
        note: 'Note : Morning and evening',
        avatarUrl: '/pets-example/pet-ex1.svg',
      },
    ],
    tomorrow: [
      {
        id: '3',
        petId: '3',
        petName: 'Charlie',
        medicationName: 'Metronidazole 500mg',
        schedule: 'ครั้งละ 1 เม็ด วันละครั้ง',
        note: 'Note : With food',
        avatarUrl: '/pets-example/pet-ex1.svg',
      },
    ],
    other: [
      {
          id: '4',
          petId: '1',
          petName: 'Lee',
          medicationName: 'Samylin Medium Breed',
          schedule: 'ครั้งละ 1 ซอง วันละครั้ง',
          note: 'Note : กินผสมอาหาร, ช่วยบำรุงตับ',
          avatarUrl: '/pets-example/pet-ex1.svg',
          recordDate: formatDateString(dayAfterTomorrow),
      },
      {
          id: '5',
          petId: '2',
          petName: 'Judy',
          medicationName: 'Samylin Medium Breed',
          schedule: 'ครั้งละ 1 ซอง วันละครั้ง',
          note: 'Note : กินผสมอาหาร, ช่วยบำรุงตับ',
          avatarUrl: '/pets-example/pet-ex1.svg',
          recordDate: formatDateString(dayAfterTomorrow),
      },
      {
          id: '6',
          petId: '2',
          petName: 'Judy',
          medicationName: 'Samylin Medium Breed',
          schedule: 'ครั้งละ 1 ซอง วันละครั้ง',
          note: 'Note : กินผสมอาหาร, ช่วยบำรุงตับ',
          avatarUrl: '/pets-example/pet-ex1.svg',
          recordDate: formatDateString(thirdDay),
      },
    ],
  };
};

const mockRecords = getMockRecords();

// Helper functions
const formatDate = (tab: TabType): string => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(today.getDate() + 2);
  
  const thirdDay = new Date(today);
  thirdDay.setDate(today.getDate() + 3);
  
  const fourthDay = new Date(today);
  fourthDay.setDate(today.getDate() + 4);

  const formatDateThai = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear(); // Buddhist year
    return `${dayName}, ${day}/${month}/${year}`;
  };

  switch (tab) {
    case 'today':
      return formatDateThai(today);
    case 'tomorrow':
      return formatDateThai(tomorrow);
    case 'other':
      return `${formatDateThai(dayAfterTomorrow)} ${formatDateThai(thirdDay)} ${formatDateThai(fourthDay)}`;
    default:
      return '';
  }
};

const formatGroupDate = (isoDate: string) => {
  const d = new Date(isoDate + 'T00:00:00'); // กัน timezone เพี้ยน
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${weekday}, ${dd}/${mm}/${yyyy}`;
};

const groupRecordsByDate = (items: MedicationRecord[]) => {
  const map = new Map<string, MedicationRecord[]>();
  for (const r of items) {
    const key = r.recordDate ?? 'Unknown date';
    const arr = map.get(key) ?? [];
    arr.push(r);
    map.set(key, arr);
  }

  // sort date ascending (Unknown date ไปท้าย)
  const entries = Array.from(map.entries()).sort((a, b) => {
    if (a[0] === 'Unknown date') return 1;
    if (b[0] === 'Unknown date') return -1;
    return a[0].localeCompare(b[0]);
  });

  return entries; // [ [dateKey, records[]], ... ]
};


const getHeaderTitle = (tab: TabType): string => {
  switch (tab) {
    case 'today':
      return 'Today record';
    case 'tomorrow':
      return 'Tomorrow record';
    case 'other':
      return 'Other record';
    default:
      return '';
  }
};

// Main component
export default function Medication({
  records = mockRecords,
  onAdd,
  onSelectPet,
  onChangeTab,
}: MedicationProps) {

  const [selectedTab, setSelectedTab] = useState<TabType>('today');
  const [selectedPetId, setSelectedPetId] = useState<PetId>('all');
  const [petDropdownOpen, setPetDropdownOpen] = useState(false);
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [detailRecord, setDetailRecord] = useState<MedicationRecord|null>(null);
  const [editRecord, setEditRecord] = useState<MedicationRecord|null>(null);

  const handleTabChange = (tab: TabType) => {
    setSelectedTab(tab);
    onChangeTab?.(tab);
  };

  const handlePetSelect = (petId: PetId) => {
    setSelectedPetId(petId);
    setPetDropdownOpen(false);
    onSelectPet?.(petId);
  };

  const handleAdd = () => {
    setShowCreatePopup(true);
    onAdd?.();
  };

  const handleClosePopup = () => setShowCreatePopup(false);
  const handleSubmitPopup = (data: any) => {
    // TODO: handle submit logic (e.g. call API or update state)
    setShowCreatePopup(false);
    // Optionally: show success message or refresh list
  };

  // Filter records based on selected pet
  const filteredRecords = records[selectedTab].filter((record: MedicationRecord) => 
    selectedPetId === 'all' || record.petId === selectedPetId
  );

  const handleCardClick = (record: MedicationRecord) => {
    setDetailRecord(record);
  };
  const handleCloseDetail = () => setDetailRecord(null);
  const handleEditDetail = (record: MedicationRecord | null) => {
    if (record) setEditRecord(record);
    setDetailRecord(null);
  };
  const handleCloseEdit = () => setEditRecord(null);
  const handleSaveEdit = (data: any) => {
    // TODO: update record logic
    setEditRecord(null);
    // Optionally: show success message or refresh list
  };
  const handleDeleteDetail = () => {
    // TODO: implement delete logic
    setDetailRecord(null);
  };

  return (
    <Page>
      {/* Pet selector */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <PetSelectButton onClick={() => setPetDropdownOpen((open) => !open)}>
          <div className='PetIcon'>
            {selectedPetId === 'all' ? (
              <Pets />
            ) : (
              <Image
                src={mockPets.find((p) => p.id === selectedPetId)?.avatarUrl || ''}
                alt={mockPets.find((p) => p.id === selectedPetId)?.name || ''}
                width={48}
                height={48}
                style={{ borderRadius: '50%', background: '#f1f2f4' }}
              />
            )}
          </div>
          <div className='PetSelectText'>
            {selectedPetId === 'all'
              ? 'All Pets'
              : mockPets.find((p) => p.id === selectedPetId)?.name || 'All Pets'}
          </div>
          <div className='ChevronIcon'>
            <ExpandMore />
          </div>
        </PetSelectButton>
        {petDropdownOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            background: `${theme.colors.white}`,
            color: `${theme.colors.textPrimary}`,
            border: '1px solid #eee',
            borderRadius: 8,
            zIndex: 10,
            width: '100%',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
            <div
              style={{ padding: 12, cursor: 'pointer', borderBottom: '1px solid #eee' }}
              onClick={() => handlePetSelect('all')}
            >
              All Pets
            </div>
            {mockPets.map((pet) => (
              <div
                key={pet.id}
                style={{
                  padding: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  color: '#000',
                  borderBottom: pet.id !== mockPets[mockPets.length - 1].id ? '1px solid #eee' : 'none'
                }}
                onClick={() => handlePetSelect(pet.id)}
              >
                <Image src={pet.avatarUrl || ''} alt={pet.name} width={24} height={24} style={{ borderRadius: '50%', marginRight: 8 }} />
                {pet.name}
              </div>
            ))}
          </div>
        )}
      </div>

        {/* Tabs */}
        <TabsWrap>
          <TabButton
            $active={selectedTab === 'today'}
            onClick={() => handleTabChange('today')}
          >
            Today
          </TabButton>
          <TabButton
            $active={selectedTab === 'tomorrow'}
            onClick={() => handleTabChange('tomorrow')}
          >
            Tomorrow
          </TabButton>
          <TabButton
            $active={selectedTab === 'other'}
            onClick={() => handleTabChange('other')}
          >
            Other
          </TabButton>
        </TabsWrap>

        {/* Header */}
        {selectedTab === 'other' ? (
        <Header>
            <div className='Title'>{getHeaderTitle(selectedTab)}</div>
        </Header>
            ) :     
        <Header>
            <div className='Title'>{getHeaderTitle(selectedTab)}</div>
            <div className='DateText'>{formatDate(selectedTab)}</div>
        </Header>
        }
        

        {/* Medication cards */}
        <CardList>
        {selectedTab === 'other' ? (
            groupRecordsByDate(filteredRecords).map(([dateKey, items]) => (
            <div className="DateGroup" key={dateKey}>
                <div className="GroupHeader">
                    {dateKey === 'Unknown date' ? 'Unknown date' : formatGroupDate(dateKey)}
                </div>

                {items.map((record) => (
                <div className="Card" key={record.id} onClick={() => handleCardClick(record)} style={{ cursor: 'pointer' }}>
                    <div className="CardTopRow">
                    <div className="ScheduleText">{record.schedule}</div>
                    </div>

                    <div className="CardBody">
                    <div className="AvatarWrap">
                        {record.avatarUrl ? (
                        <Image
                            src={record.avatarUrl}
                            alt={record.petName}
                            width={40}
                            height={40}
                        />
                        ) : (
                        <div
                            style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: '#E5E7EB',
                            borderRadius: '50%',
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
            <div className="Card" key={record.id} onClick={() => handleCardClick(record)} style={{ cursor: 'pointer' }}>
                <div className="CardTopRow">
                <div className="ScheduleText">{record.schedule}</div>
                </div>
                <div className="CardBody">
                <div className="AvatarWrap">
                    {record.avatarUrl ? (
                    <Image src={record.avatarUrl} alt={record.petName} width={40} height={40} />
                    ) : (
                    <div
                        style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#E5E7EB',
                        borderRadius: '50%',
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

      {/* Floating action button */}
      <FabButton onClick={handleAdd}>
        <Add />
      </FabButton>

      {/* Create Medication Popup */}
      <CreateMedicationPopup
        open={showCreatePopup}
        onClose={handleClosePopup}
        onSubmit={handleSubmitPopup}
        pets={mockPets}
      />

      {/* Medication Detail Popup */}
      <MedicationDetailPopup
        open={!!detailRecord}
        onClose={handleCloseDetail}
        record={detailRecord}
        onEdit={handleEditDetail}
        onDelete={handleDeleteDetail}
      />
      {/* Edit Medication Popup */}
      <EditMedicationPopup
        open={!!editRecord}
        onClose={handleCloseEdit}
        record={editRecord}
        pets={mockPets}
        onSave={handleSaveEdit}
      />
    </Page>
  );
}