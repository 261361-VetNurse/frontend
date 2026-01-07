'use client';

import Button from "@/components/admin/shared/Button";
import NavigationTab from "@/components/admin/shared/NavigationTab";
import AddIcon from '@mui/icons-material/Add'
import { useState } from "react";

function AllPetOwners() {
  return (
    <div>
      <h3>🐶 All Pet Owners</h3>
      <ul>
        <li>John Doe</li>
        <li>Jane Smith</li>
        <li>Alex Johnson</li>
      </ul>
    </div>
  );
}

function WaitingApproval() {
  return (
    <div>
      <h3>⏳ Waiting for Approval</h3>
      <p>There are 13 pet owners waiting for approval.</p>
    </div>
  );
}


export default function AdminPage() {

  const [tab, setTab] = useState('all');

  const tabContent: Record<string, React.ReactNode> = {
    all: <AllPetOwners />,
    wait: <WaitingApproval />,
  };

  return (
    <div>
      <Button icon="left">
        <AddIcon></AddIcon>
        Add
      </Button>

      <NavigationTab
        style="underline"
        size="md"
        orientation="horizontal"
        value={tab}
        onChange={setTab}
        items={[
          { key: 'all', label: 'All Pet Owners', count: 17 },
          { key: 'wait', label: 'Wait for Approve', count: 13 },
        ]}
      />

      <div style={{ marginTop: 24 }}>
        {tabContent[tab]}
      </div>
    </div>
  );
}
