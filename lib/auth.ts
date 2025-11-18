import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import connectDB from '@/lib/mongodb';
import User from '@/database/user.model';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET
);

export interface AuthUser {
    id: string;
    email: string;
    name: string;
}

/**
 * Verify and decode JWT token from request cookies
 */
export async function verifyAuth(request: NextRequest): Promise<AuthUser | null> {
    try {
        const token = request.cookies.get('token')?.value;

        if (!token) {
            return null;
        }

        // Verify token
        const { payload } = await jwtVerify(token, JWT_SECRET);

        if (!payload.userId) {
            return null;
        }

        // Connect to DB and get user
        await connectDB();
        const user = await User.findById(payload.userId);

        if (!user) {
            return null;
        }

        return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
        };
    } catch (error) {
        return null;
    }
}

/**
 * Require authentication - throws error if not authenticated
 * Use this in API routes that need authentication
 */
export async function requireAuth(request: NextRequest): Promise<AuthUser> {
    const user = await verifyAuth(request);

    if (!user) {
        throw new Error('Authentication required');
    }

    return user;
}