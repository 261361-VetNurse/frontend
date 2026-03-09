'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/hooks/use-next-routing';
import { PrimaryButton } from '@/components/pet-owners/shared/form/PrimaryButton';
import {
    RegisterContainer,
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
            const from = new URLSearchParams(window.location.search).get('from') || '/pet-owners/home-page';
            router.push(from);
            return;
        }

        // Handle callback from Backend (after Line OAuth)
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        // isNew was removed because it's unused
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
            window.history.replaceState({}, '', window.location.pathname);
            return;
        }

        if (token && !authLoading) {
            handleTokenCallback(token);
            return;
        }

        // Auto-login trigger
        if (!user && !token && !authError && !authLoading && !pageLoading) {
            setPageLoading(true);
            redirectToLineLogin();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, user, authLoading, pageLoading]);

    const handleTokenCallback = async (
        token: string,
    ) => {
        setPageLoading(true);
        try {
            await login(token);
            window.history.replaceState({}, '', window.location.pathname);
            // Redirect to the page the user originally tried to visit
            const from = new URLSearchParams(window.location.search).get('from') || '/pet-owners/home-page';
            router.push(from);
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
        // Route through /auth/callback — same path as real LINE login.
        // The backend's /auth/line/exchange handles DEV_TEST_CODE the same way as a real code.
        // This ensures the cookie is set correctly after exchange.
        router.push(`/auth/callback?code=${encodeURIComponent(devCode)}`);
    };

    return (
        <RegisterContainer>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '24px', gap: '16px' }}>
                {!error && (
                    <>
                        <style>{`
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                        `}</style>
                        <div style={{
                            width: '28px',
                            height: '28px',
                            border: '3px solid #e5e7eb',
                            borderTop: '3px solid #6b7280',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                        }} />
                    </>
                )}
                <Subtitle style={{ textAlign: 'center' }}>
                    {error ? 'Login failed' : 'Logging in...'}
                </Subtitle>

                {error && (
                    <div style={{
                        color: '#dc2626',
                        padding: '12px',
                        borderRadius: '8px',
                        backgroundColor: '#fee2e2',
                        textAlign: 'center',
                        fontSize: '14px',
                        width: '100%',
                        maxWidth: '400px'
                    }}>
                        {error}
                    </div>
                )}

                {error && (
                    <div style={{ width: '100%', maxWidth: '400px' }}>
                        <PrimaryButton
                            size="md"
                            type="button"
                            onClick={handleLoginClick}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Try Again'}
                        </PrimaryButton>
                    </div>
                )}
            </div>
        </RegisterContainer>
    );
}