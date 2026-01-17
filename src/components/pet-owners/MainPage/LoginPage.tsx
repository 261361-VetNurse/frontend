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
} from '@/styles/register.styled';

import { authStorage } from '@/lib/api-client';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        // Check if user is already logged in
        const existingToken = authStorage.getToken();
        if (existingToken) {
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

        if (token && !isProcessing) {
            setIsProcessing(true);
            handleTokenCallback(token, isNew, userId, displayName);
        }
    }, [router, isProcessing]);

    const handleTokenCallback = (
        token: string,
        isNew: boolean,
        userId: string | null,
        displayName: string | null
    ) => {
        setLoading(true);
        try {
            // // Store authentication data
            // authStorage.setToken(token);

            // // Store user info if available
            // if (userId && displayName) {
            //     authStorage.setUser({
            //         id: userId,
            //         display_name: displayName,
            //         picture_url: '',
            //         line_id: ''
            //     });
            // }

            // Clean up URL
            window.history.replaceState({}, '', window.location.pathname);

            // Redirect based on user registration status
            if (isNew) {
                // New user - redirect to registration page
                router.push('/pet-owners/register-page');
            } else {
                // Existing user - redirect to home page
                router.push('/pet-owners/home-page');
            }
        } catch (err) {
            console.error('Token handling error:', err);
            setError('Failed to process login. Please try again.');
            setIsProcessing(false);
        } finally {
            setLoading(false);
        }
    };

    const handleLoginClick = () => {
        setError(null);
        setLoading(true);

        // Mock Login
        setTimeout(() => {
            // Use specific long-lived token as requested
            authStorage.setToken("mock_token_user_1_long_live");
            authStorage.setUser({
                id: "mock-user-id",
                display_name: "Mock User",
                picture_url: "",
                line_id: "mock-line-id"
            });
            setLoading(false);
            router.push('/pet-owners/home-page');
        }, 1000);
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
        </RegisterContainer>
    );
}