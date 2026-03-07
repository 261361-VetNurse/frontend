import React, { useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { SWRConfig } from 'swr';

import App from './App';
import './globals.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import PageSkeleton from './components/shared/PageSkeleton';
import { ApiError } from './services/api/client';

/**
 * Inner component so we can access useAuth() for the SWR global error handler.
 * onError and swrConfig are memoized so SWRConfig's value object is stable
 * across renders — prevents re-rendering all SWR consumers on every render.
 */
function AppWithSWR() {
    const { logout } = useAuth();

    const handleSWRError = useCallback((err: unknown) => {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
            logout();
        }
        if (import.meta.env.DEV) {
            console.error('[SWR] Global error:', err);
        }
    }, [logout]);

    const swrConfig = useMemo(() => ({
        revalidateOnFocus: false,
        dedupingInterval: 30_000,
        errorRetryCount: 3,
        onError: handleSWRError,
    }), [handleSWRError]);

    return (
        <SWRConfig value={swrConfig}>
            <App />
        </SWRConfig>
    );
}

/**
 * Auth-loading gate: show a skeleton while AuthProvider is restoring the session.
 */
function AppGate() {
    const { isLoading } = useAuth();
    if (isLoading) return <PageSkeleton />;
    return <AppWithSWR />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ErrorBoundary>
            <AuthProvider>
                <AppGate />
            </AuthProvider>
        </ErrorBoundary>
    </React.StrictMode>
);
