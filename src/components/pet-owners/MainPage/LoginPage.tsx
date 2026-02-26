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
            handleTokenCallback(token, isNew);
        }
        if (token && !authLoading) {
            handleTokenCallback(token, isNew);
        }
    }, [router, user, authLoading]);

    const handleTokenCallback = async (
        token: string,
        isNew: boolean
    ) => {
        setPageLoading(true);
        try {
            await login(token);

            // Clean up URL
            window.history.replaceState({}, '', window.location.pathname);

            // Redirect based on user registration status
            router.push(`/pet-owners/home-page?code=${token}`);
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

    const [devCode, setDevCode] = useState('');

    const handleDevLogin = () => {
        if (!devCode) return;
        // Redirect to home page with code, letting HomePage handle the exchange
        router.push(`/pet-owners/home-page?code=${encodeURIComponent(devCode)}`);
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
                    data-cy="login-line-submit"
                    size="md"
                    type="button"
                    onClick={handleLoginClick}
                    disabled={loading}
                >
                    {loading ? 'Loading...' : 'Login With Line'}
                </PrimaryButton>

                {/* --- Dev Login Section --- */}
                <div className="mt-6 pt-6 border-t border-zinc-100">
                    <div className="text-xs text-center text-zinc-400 mb-3 uppercase tracking-wider font-medium">
                        Developer Access
                    </div>
                    <div className="flex gap-2">
                        <input
                            data-cy="dev-access-input"
                            type="text"
                            placeholder="Enter Code / Token ex.DEV_TEST_CODE"
                            className="flex-1 h-10 px-3 rounded-lg border border-zinc-200 text-sm outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                            value={devCode}
                            onChange={(e) => setDevCode(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && devCode) {
                                    handleDevLogin();
                                }
                            }}
                        />
                        <button
                            data-cy="dev-access-submit"
                            type="button"
                            onClick={handleDevLogin}
                            disabled={loading || !devCode}
                            className="h-10 px-4 rounded-lg bg-zinc-800 text-white text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Enter
                        </button>
                    </div>
                </div>
            </RegisterCard>
        </RegisterContainer >
    );
}
