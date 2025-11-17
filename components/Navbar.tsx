
'use client';

import { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import Link from 'next/link';
import { User, LogOut, Plus } from 'lucide-react';
import LogoutModal from './LogoutModal';
import Image from "next/image";

const Navbar = () => {
    const { user, loading, logout } = useAuth();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <header>
            <nav>
                <Link href="/" className="logo">
                    <Image src="/icons/logo.png" width={24} height={24} alt="logo" />
                    <p>DevEvent</p>
                </Link>

                <ul className="nav">
                    <Link href="/" className="nav-item">Home</Link>
                    <Link href="/explore" className="nav-item">Events</Link>
                    {user ? (
                        <>
                            <div className="relative">
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex items-center gap-2 bg-dark-200 hover:bg-dark-200/80 px-4 py-2 rounded-md transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                        <User className="w-4 h-4 text-primary" />
                                    </div>
                                    <span className="text-light-100 max-sm:hidden">{user.name}</span>
                                </button>

                                {showDropdown && (
                                    <>
                                        {/* Backdrop */}
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setShowDropdown(false)}
                                        />

                                        {/* Dropdown */}
                                        <div className="absolute right-0 mt-2 w-56 bg-dark-100 border border-dark-200 rounded-lg shadow-lg z-50 overflow-hidden">
                                            <div className="px-4 py-3 border-b border-dark-200">
                                                <p className="text-sm text-light-200">Signed in as</p>
                                                <p className="text-sm font-semibold text-foreground truncate">{user.email}</p>
                                            </div>

                                            <div className="py-2">
                                                <Link
                                                    href="/events/create"
                                                    className="flex items-center gap-3 px-4 py-2 text-light-100 hover:bg-dark-200 transition-colors"
                                                    onClick={() => setShowDropdown(false)}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Create Event
                                                </Link>

                                                <button
                                                    onClick={() => {
                                                        setShowDropdown(false);
                                                        setShowLogoutModal(true);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-2 text-destructive hover:bg-destructive/10 transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Log Out
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <LogoutModal
                                isOpen={showLogoutModal}
                                onClose={() => setShowLogoutModal(false)}
                            />
                        </>
                    ) : (
                        <>
                            <Link href="/login">Login</Link>
                            <Link href="/signup">Signup</Link>
                        </>
                    )}


                </ul>
            </nav>
        </header>
    )
}
export default Navbar
