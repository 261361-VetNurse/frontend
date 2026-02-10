'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PrimaryButton } from '@/components/pet-owners/shared/form/PrimaryButton';
import {
    RegisterContainer,
    RegisterCard,
    Header,
    Title,
    Subtitle,
} from '@/styles/components/register.styled';

import { useAuth } from '@/contexts/AuthContext';
import { redirectToLineLogin } from '@/services/line-liff';

export default function LoginPage() {
    const { login, user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [pageLoading, setPageLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Combined loading state
    const loading = pageLoading || authLoading;

    useEffect(() => {
        // Check if user is already logged in
        if (user) {
            router.push('/pet-owners/home-page');
            return;
        }

        // Handle callback from Backend (after Line OAuth)
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const isNew = params.get('is_new') === 'true';
        const userId = params.get('user_id');
        const displayName = params.get('display_name');
        const authError = params.get('error');

        if (authError) {
            let errorMsg = 'Login failed. Please try again.';
            switch (authError) {
                case 'token_exchange_failed':
                    errorMsg = 'Failed to authenticate with LINE. Please try again.';
                    break;
                case 'profile_failed':
                    errorMsg = 'Failed to get your LINE profile. Please try again.';
                    break;
                case 'server_error':
                    errorMsg = 'Server error occurred. Please try again later.';
                    break;
            }
            setError(errorMsg);
            // Clean up URL
            window.history.replaceState({}, '', window.location.pathname);
            return;
        }

        if (token) {
            handleTokenCallback(token, isNew, userId, displayName);
        }
        if (token && !authLoading) {
            handleTokenCallback(token, isNew, userId, displayName);
        }
    }, [router, user, authLoading]);

    const handleTokenCallback = async (
        token: string,
        isNew: boolean,
        userId: string | null,
        displayName: string | null
    ) => {
        setPageLoading(true);
        try {
            await login(token);

            // Clean up URL
            window.history.replaceState({}, '', window.location.pathname);

            // Redirect based on user registration status
            if (isNew) {
                router.push('/pet-owners/register-page');
            } else {
                router.push('/pet-owners/home-page');
            }
        } catch (err) {
            console.error('Token handling error:', err);
            setError('Failed to process login. Please try again.');
        } finally {
            setPageLoading(false);
        }
    };

    const handleLoginClick = () => {
        setError(null);
        setPageLoading(true);
        redirectToLineLogin();
    };

    return (
        <RegisterContainer>
            <RegisterCard>
                <Header>
                    <Title>Login</Title>
                    <Subtitle>
                        {loading ? 'Processing...' : error ? 'Error' : 'Welcome!'}
                    </Subtitle>
                </Header>

                {error && (
                    <div style={{
                        color: '#dc2626',
                        padding: '12px',
                        borderRadius: '8px',
                        backgroundColor: '#fee2e2',
                        marginBottom: '16px',
                        textAlign: 'center',
                        fontSize: '14px'
                    }}>
                        {error}
                    </div>
                )}

                <PrimaryButton
                    size="md"
                    type="button"
                    onClick={handleLoginClick}
                    disabled={loading}
                >
                    {loading ? 'Loading...' : 'Login With Line'}
                </PrimaryButton>

                {loading && (
                    <div style={{
                        marginTop: '16px',
                        textAlign: 'center',
                        color: '#6b7280',
                        fontSize: '14px'
                    }}>
                        Please wait while we log you in...
                    </div>
                )}
            </RegisterCard>
        </RegisterContainer >
    );
}