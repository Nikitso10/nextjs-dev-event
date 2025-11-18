'use client';

import { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User } from 'lucide-react';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signup(email, password, name);
            router.push('/explore');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="mb-10 text-center">
                <h1 className="mb-4">Create Account</h1>
                <p className="text-light-100 text-lg max-sm:text-sm">
                    Join us to create and manage events
                </p>
            </div>

            <div className="bg-dark-100 border-dark-200 card-shadow rounded-lg border p-8">
                {error && (
                    <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-md mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-light-100 text-sm font-medium flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-dark-200 rounded-md px-5 py-2.5 text-foreground"
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-light-100 text-sm font-medium flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-dark-200 rounded-md px-5 py-2.5 text-foreground"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-light-100 text-sm font-medium flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-dark-200 rounded-md px-5 py-2.5 text-foreground"
                            placeholder="Minimum 6 characters"
                            minLength={6}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary hover:bg-primary/90 w-full font-semibold py-2.5 px-6 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-black"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-light-200 text-sm">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:text-primary/90 font-semibold">
                            Log In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}