import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import connectDB from '@/lib/mongodb';
import User from '@/database/user.model';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET
);

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Verify token
        const { payload } = await jwtVerify(token, JWT_SECRET);

        await connectDB();
        const user = await User.findById(payload.userId);

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            user: { id: user._id, email: user.email, name: user.name }
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid token' },
            { status: 401 }
        );
    }
}