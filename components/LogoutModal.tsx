'use client';

import { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut, X } from 'lucide-react';

interface LogoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
    const { logout, user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);
        try {
            await logout();
            onClose();
            router.push('/');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-dark-100 border-dark-200 card-shadow rounded-lg border p-8 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-light-200 hover:text-foreground transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                        <LogOut className="w-8 h-8 text-destructive" />
                    </div>
                </div>

                {/* Content */}
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">Log Out</h3>
                    <p className="text-light-100 text-base">
                        Are you sure you want to log out?
                    </p>
                    {user && (
                        <p className="text-light-200 text-sm mt-2">
                            Currently logged in as: <span className="text-primary font-medium">{user.email}</span>
                        </p>
                    )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 bg-dark-200 hover:bg-dark-200/80 text-light-100 font-semibold py-2.5 px-6 rounded-md transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleLogout}
                        disabled={loading}
                        className="flex-1 bg-destructive hover:bg-destructive/90 text-white font-semibold py-2.5 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Logging Out...' : 'Log Out'}
                    </button>
                </div>
            </div>
        </div>
    );
}