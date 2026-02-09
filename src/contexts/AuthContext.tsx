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
            let initialToken = authStorage.getToken();

            // --- DEV ONLY: Fake Auth Handling ---
            if (process.env.NODE_ENV === "development" &&
                process.env.NEXT_PUBLIC_USE_DEV_FAKE_AUTH === "true" &&
                !initialToken) {

                const fakeToken = process.env.NEXT_PUBLIC_DEV_FAKE_TOKEN;
                if (fakeToken) {
                    console.warn("⚠️ [DEV] DEV_FAKE_AUTH enabled. Using fake token.");
                    authStorage.setToken(fakeToken);
                    initialToken = fakeToken;
                } else {
                    console.error("⚠️ [DEV] DEV_FAKE_AUTH enabled but NEXT_PUBLIC_DEV_FAKE_TOKEN is missing.");
                }
            }
            // ------------------------------------

            if (initialToken) {
                setToken(initialToken);
                try {
                    // Start fetching user in parallel or blocking? 
                    // Let's block to prevent flicker of "logged out" state
                    const userData = await getCurrentUser(initialToken);
                    setUser(userData);
                } catch (error) {
                    console.error("Failed to restore user session:", error);

                    // --- DEV ONLY: Keep token if it matches fake token ---
                    const isFakeToken = process.env.NODE_ENV === "development" &&
                        initialToken === process.env.NEXT_PUBLIC_DEV_FAKE_TOKEN;

                    if (isFakeToken) {
                        console.warn("⚠️ [DEV] API failed with fake token. Creating MOCK user.");
                        setUser({
                            id: "dev-mock-user",
                            display_name: "Dev Mock User",
                            picture_url: "",
                            role: "user",
                            is_registered: true
                        });
                        // Do NOT clear token
                    } else {
                        // Standard behavior: if token is invalid, clear it
                        authStorage.removeToken();
                        setToken(null);
                    }
                    // ----------------------------------------------------
                }
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
        // Optional: Redirect to login or let the consumer handle it
        window.location.href = "/login";
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
