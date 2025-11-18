'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/auth/profile');
            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Login failed');
        }

        const data = await response.json();
        setUser(data.user);
    };

    const signup = async (email: string, password: string, name: string) => {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Signup failed');
        }

        const data = await response.json();
        setUser(data.user);
    };

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        setUser(null);
    };

    const refreshUser = async () => {
        await checkAuth();
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
    {children}
    </AuthContext.Provider>
);
}

// Custom hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Optional: Hook to require authentication
export function useRequireAuth() {
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            // Redirect to login
            window.location.href = '/login';
        }
    }, [user, loading]);

    return { user, loading };
}