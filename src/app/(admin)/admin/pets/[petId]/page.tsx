"use client";

import { useParams } from "next/navigation";

export default function PetDetailPage() {
  const { petId } = useParams<{ petId: string }>();

  return (
    <div>
      <h1>Pet Detail</h1>
      <p>Pet ID: {petId}</p>
    </div>
  );
}