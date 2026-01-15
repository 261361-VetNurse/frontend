// "use client";

// import { useEffect } from "react";
// import { useSearchParams, useRouter } from "next/navigation";

// export default function LineCallbackPage() {
//   const params = useSearchParams();
//   const router = useRouter();

//   useEffect(() => {
//     const code = params.get("code");

//     if (!code) {
//       alert("No LINE code");
//       return;
//     }

//     async function exchange() {
//       try {
//         const res = await fetch("/api/auth/line/exchange", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ code }),
//         });

//         if (!res.ok) throw new Error("Exchange failed");

//         const { access_token, is_new_user } = await res.json();

//         localStorage.setItem("access_token", access_token);

//         if (is_new_user) {
//           router.replace("/pet-owners/register-page");
//         } else {
//           router.replace("/pet-owners/mypets");
//         }
//       } catch (err) {
//         alert("Login failed");
//         router.replace("/pet-owners/login-page");
//       }
//     }

//     exchange();
//   }, [params, router]);

//   return <p style={{ textAlign: "center" }}>Logging in with LINE...</p>;
// }


"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function LineCallbackPage() {
  const params = useSearchParams();
  const router = useRouter();
  const isExchanging = useRef(false);

  useEffect(() => {
    const code = params.get("code");
    if (!code || isExchanging.current) return;
    isExchanging.current = true;

    async function exchange() {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL; // https://...ngrok-free.dev
        
        const res = await fetch(`${apiBaseUrl}/auth/line/exchange`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }), 
        });

        if (!res.ok) throw new Error("Exchange failed");

        const data = await res.json();
        localStorage.setItem("access_token", data.access_token);

        // ถ้าเป็นผู้ใช้ใหม่ (is_new_user: true) ให้ไปหน้า Register
        if (data.is_new_user) {
          router.replace("/pet-owners/register-page");
        } else {
          router.replace("/pet-owners/home-page");
        }
      } catch (err: any) {
        alert("Login failed");
        router.replace("/pet-owners/login-page");
      }
    }
    exchange();
  }, [params, router]);

  return <p className="text-center mt-10">Logging in with LINE...</p>;
}