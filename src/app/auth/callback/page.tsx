'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from '@/hooks/use-next-routing';
import { exchangeLineToken, authStorage } from '@/services/api/client';
import { Suspense } from 'react';

function CallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const code = searchParams.get('code');
        const err = searchParams.get('error');

        if (err) {
            setError('LINE login was cancelled or failed. Please try again.');
            setTimeout(() => router.replace('/pet-owners/login-page'), 2000);
            return;
        }

        if (!code) {
            router.replace('/pet-owners/login-page');
            return;
        }

        const handleExchange = async () => {
            try {
                const response = await exchangeLineToken(code);

                if (!response.access_token) {
                    throw new Error('No token received');
                }

                // Store token in localStorage
                authStorage.setToken(response.access_token);

                // Set auth cookie so middleware lets subsequent requests through
                document.cookie = `auth-token=${response.access_token}; path=/; SameSite=Strict; max-age=${60 * 60 * 24 * 7}`;

                // Use window.location.href (full page reload) instead of router.replace.
                // router.replace is client-side: AuthContext persists with stale user=null.
                // Full reload forces middleware re-check + AuthContext.initAuth() to re-run
                // at the destination page where localStorage now has the token.
                window.history.replaceState({}, '', window.location.pathname);
                if (response.is_new_user) {
                    window.location.href = '/pet-owners/register-page';
                } else {
                    window.location.href = '/pet-owners/home-page';
                }
            } catch (err) {
                console.error('Token exchange failed:', err);
                setError('Login failed. Redirecting back to login...');
                setTimeout(() => router.replace('/pet-owners/login-page'), 2000);
            }
        };

        handleExchange();
    }, [searchParams, router]);

    if (error) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100vh', flexDirection: 'column', gap: 12
            }}>
                <p style={{ color: '#dc2626' }}>{error}</p>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100vh', flexDirection: 'column', gap: 12
        }}>
            <div style={{ fontSize: 14, color: '#6b7280' }}>Logging you in...</div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <div style={{ color: '#6b7280', fontSize: 14 }}>Loading...</div>
            </div>
        }>
            <CallbackHandler />
        </Suspense>
    );
}
