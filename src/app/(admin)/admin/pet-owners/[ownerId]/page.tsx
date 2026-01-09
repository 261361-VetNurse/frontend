"use client";

import { useParams } from "next/navigation";

export default function PetOwnerDetailPage() {
  const params = useParams();
  const ownerId = params.ownerId;

  return (
    <div>
      <h1>Pet Owner Detail</h1>
      <p>Owner ID: {ownerId}</p>
    </div>
  );
}