import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types/domain/user";
import { getCurrentUser, authStorage } from "@/services/api/client";

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// In dev (Vite dev server) we talk directly to the backend and keep the JWT in
// localStorage — same as the original flow, no BFF required.
// In production the Hono BFF is in front and we use HttpOnly cookies instead.
const IS_PROD = import.meta.env.PROD;

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                if (IS_PROD) {
                    // ── Production: restore session from HttpOnly cookie via BFF ──
                    const res = await fetch('/api/auth/session', { credentials: 'include' });
                    if (!res.ok) {
                        const isPublic =
                            window.location.pathname.startsWith('/pet-owners/login-page') ||
                            window.location.pathname.startsWith('/auth') ||
                            window.location.pathname.startsWith('/pet-owners/register-page');
                        if (!isPublic) {
                            window.location.href = `/pet-owners/login-page?from=${encodeURIComponent(window.location.pathname)}`;
                        }
                        return;
                    }
                    const { user: userData, token: sessionToken } = await res.json();
                    setUser(userData);
                    setToken(sessionToken);
                } else {
                    // ── Development: restore session from localStorage ────────────
                    const storedToken = authStorage.getToken();
                    if (!storedToken) {
                        const isPublic =
                            window.location.pathname.startsWith('/pet-owners/login-page') ||
                            window.location.pathname.startsWith('/auth');
                        if (!isPublic) {
                            window.location.href = `/pet-owners/login-page?from=${encodeURIComponent(window.location.pathname)}`;
                        }
                        return;
                    }
                    setToken(storedToken);
                    try {
                        const userData = await getCurrentUser(storedToken);
                        setUser(userData);
                    } catch {
                        const onRegisterPage = window.location.pathname.startsWith('/pet-owners/register-page');
                        if (onRegisterPage) return;
                        authStorage.removeToken();
                        setToken(null);
                        window.location.href = '/pet-owners/login-page';
                        return;
                    }
                }
            } catch {
                const isPublic =
                    window.location.pathname.startsWith('/pet-owners/login-page') ||
                    window.location.pathname.startsWith('/auth');
                if (!isPublic) {
                    window.location.href = '/pet-owners/login-page';
                }
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (newToken: string) => {
        setIsLoading(true);
        try {
            if (IS_PROD) {
                // Production: BFF sets the HttpOnly cookie
                const res = await fetch('/api/auth/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ token: newToken }),
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.detail || 'Session creation failed');
                }
                const { user: userData } = await res.json();
                setUser(userData);
                setToken(newToken);
            } else {
                // Development: store token in localStorage, fetch user directly
                authStorage.setToken(newToken);
                setToken(newToken);
                const userData = await getCurrentUser(newToken);
                setUser(userData);
            }
        } catch (error) {
            if (!IS_PROD) authStorage.removeToken();
            setToken(null);
            setUser(null);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        if (IS_PROD) {
            try {
                await fetch('/api/auth/session', { method: 'DELETE', credentials: 'include' });
            } catch { /* best-effort */ }
        } else {
            authStorage.clear();
        }
        setToken(null);
        setUser(null);
        window.location.href = '/pet-owners/login-page';
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
