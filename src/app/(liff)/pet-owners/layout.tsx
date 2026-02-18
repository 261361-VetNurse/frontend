"use client";

import { usePathname } from "next/navigation";
import Container from "@/components/pet-owners/layout/Container";
import NavBar from "@/components/pet-owners/layout/NavBar";

export default function PetOwnersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Determine if navbar should be shown
  // Show navbar for: home, calendar, medication, notification, my-pets list
  // Hide navbar for: help-center, owner-info, pet detail pages
  const shouldShowNavbar =
    pathname?.includes("/home-page") ||
    pathname?.includes("/calendar-page") ||
    pathname?.includes("/medication-page") ||
    pathname?.includes("/notification-page") ||
    pathname === "/pet-owners/my-pets-page";

  return (
    <div className="w-full" style={{ backgroundColor: "#F7F7F7" }}>
      <main
        style={{
          display: "flex",
          minHeight: "100vh",
          justifyContent: "center",
        }}
      >
        <Container>
          <div style={{ width: "100%" }}>{children}</div>
        </Container>
      </main>
      {shouldShowNavbar && <NavBar />}
    </div>
  );
}
