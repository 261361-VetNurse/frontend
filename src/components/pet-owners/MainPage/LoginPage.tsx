// 'use client';

// import { PrimaryButton } from '@/components/pet-owners/shared/form/PrimaryButton';
// import {
//   RegisterContainer,
//   RegisterCard,
//   Header,
//   Title,
//   Subtitle,
// } from '@/styles/register.styled';

// export default function LoginPage() {
//   const handleLoginClick = () => {
//     const clientId = process.env.NEXT_PUBLIC_LINE_CHANNEL_ID!;
//     const redirectUri = encodeURIComponent(
//       `${window.location.origin}/auth/callback`
//     );
//     const state = crypto.randomUUID();

//     const url =
//       `https://access.line.me/oauth2/v2.1/authorize` +
//       `?response_type=code` +
//       `&client_id=${clientId}` +
//       `&redirect_uri=${redirectUri}` +
//       `&scope=profile%20openid` +
//       `&state=${state}`;

//     window.location.href = url;
//   };

//   return (
//     <RegisterContainer>
//       <RegisterCard>
//         <Header>
//           <Title>Login</Title>
//           <Subtitle>Welcome!</Subtitle>
//         </Header>

//         <PrimaryButton size="md" type="button" onClick={handleLoginClick}>
//           Login With LINE
//         </PrimaryButton>
//       </RegisterCard>
//     </RegisterContainer>
//   );
// }


"use client";

import { useState } from "react";
import { PrimaryButton } from '@/components/pet-owners/shared/form/PrimaryButton';
import {
  RegisterContainer,
  RegisterCard,
  Header,
  Title,
  Subtitle,
} from '@/styles/register.styled';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginClick = () => {
    if (isLoading) return;
    setIsLoading(true);
    
    const clientId = process.env.NEXT_PUBLIC_LINE_CHANNEL_ID;
    
    // สำคัญ: ให้ใช้ URL ของ localhost เพื่อให้ LINE วิ่งกลับมาที่ Frontend ของเราโดยตรง
    const redirectUri = encodeURIComponent(
    "https://unmaimable-overpopulous-deane.ngrok-free.dev/auth/callback"
    );
    
    const state = crypto.randomUUID();

    if (!clientId) {
      alert("Missing Client ID");
      setIsLoading(false);
      return;
    }

    const url =
      `https://access.line.me/oauth2/v2.1/authorize` +
      `?response_type=code` +
      `&client_id=${clientId}` +
      `&redirect_uri=${redirectUri}` +
      `&scope=profile%20openid` +
      `&state=${state}`;

    window.location.href = url;
  };

  return (
    <RegisterContainer>
      <RegisterCard>
        <Header>
          <Title>Login</Title>
          <Subtitle>Welcome to VetNurse!</Subtitle>
        </Header>

        <PrimaryButton 
          size="md" 
          type="button" 
          onClick={handleLoginClick}
          disabled={isLoading}
        >
          {isLoading ? "Connecting to LINE..." : "Login With LINE"}
        </PrimaryButton>
      </RegisterCard>
    </RegisterContainer>
  );
}