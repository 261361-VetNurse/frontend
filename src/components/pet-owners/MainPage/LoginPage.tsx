'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PrimaryButton } from '@/components/pet-owners/shared/form/PrimaryButton';
import {
    RegisterContainer,
    RegisterCard,
    Header,
    Title,
    Subtitle,
} from '@/styles/register.styled';

export default function LoginPage() {
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.push('/pet-owners/home-page');
    };

    return (
        <RegisterContainer>
            <RegisterCard>
                <Header>
                    <Title>Login</Title>
                    <Subtitle>Welcome!</Subtitle>
                </Header>

                <PrimaryButton size="md" type="submit" onClick={handleSubmit}>
                    Login With Line
                </PrimaryButton>
            </RegisterCard>
        </RegisterContainer>
    );
}