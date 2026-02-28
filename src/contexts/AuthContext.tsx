"use client";

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize from storage or dev fake auth
    useEffect(() => {
        const initAuth = async () => {
            const storedToken = authStorage.getToken();

            if (!storedToken) {
                // No token in localStorage — clear any stale cookie and redirect to login
                // (cookie may have outlived localStorage if user cleared DevTools storage)
                document.cookie = 'auth-token=; path=/; SameSite=Strict; max-age=0';
                setIsLoading(false);
                const isPublic = window.location.pathname.startsWith('/pet-owners/login-page')
                    || window.location.pathname.startsWith('/auth');
                if (!isPublic) {
                    window.location.href = `/pet-owners/login-page?from=${encodeURIComponent(window.location.pathname)}`;
                }
                return;
            }

            // Backfill the auth cookie for users who logged in before middleware was introduced
            setToken(storedToken);
            document.cookie = `auth-token=${storedToken}; path=/; SameSite=Strict; max-age=${60 * 60 * 24 * 7}`;
            try {
                const userData = await getCurrentUser(storedToken);
                setUser(userData);
            } catch (error) {
                // Check if we're on the register page — new users have a valid token
                // but no profile yet, so getCurrentUser will fail with 404/403.
                // Don't clear token or redirect in that case.
                const onRegisterPage = window.location.pathname.startsWith('/pet-owners/register-page');
                if (onRegisterPage) {
                    // Token is valid but profile not yet created — let register page proceed
                    setIsLoading(false);
                    return;
                }
                console.error("Failed to restore user session:", error);
                authStorage.removeToken();
                document.cookie = 'auth-token=; path=/; SameSite=Strict; max-age=0';
                setToken(null);
                // Token was invalid/expired — kick to login
                window.location.href = '/pet-owners/login-page';
                return;
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (newToken: string) => {
        setIsLoading(true);
        try {
            authStorage.setToken(newToken);
            setToken(newToken);
            const userData = await getCurrentUser(newToken);
            setUser(userData);
            // Set auth cookie so the Edge middleware can gate routes
            // (localStorage is not accessible server-side)
            document.cookie = `auth-token=${newToken}; path=/; SameSite=Strict; max-age=${60 * 60 * 24 * 7}`; // 7 days
        } catch (error) {
            console.error("Login failed:", error);
            authStorage.removeToken();
            setToken(null);
            setUser(null);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        authStorage.clear();
        setToken(null);
        setUser(null);
        // Clear the auth cookie
        document.cookie = 'auth-token=; path=/; SameSite=Strict; max-age=0';
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
