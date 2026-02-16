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
            // --- NORMAL API MODE ---
            const storedToken = authStorage.getToken();
            if (storedToken) {
                setToken(storedToken);
                try {
                    const userData = await getCurrentUser(storedToken);
                    setUser(userData);
                } catch (error) {
                    console.error("Failed to restore user session:", error);
                    authStorage.removeToken();
                    setToken(null);
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
