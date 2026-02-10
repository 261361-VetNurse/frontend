import { Suspense } from "react";
import NotificationsPage from "@/components/pet-owners/MainPage/NotificationPage/NotificationPage";

export default function NotificationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotificationsPage />
    </Suspense>
  );
}