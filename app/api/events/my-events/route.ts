import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Event from '@/database/event.model';

export async function GET(request: NextRequest) {
    try {
        // Require authentication
        const user = await requireAuth(request);

        await connectDB();

        // Fetch only events created by this user, sorted by newest first
        const events = await Event.find({ createdBy: user.id })
            .sort({ createdAt: -1 })
            .select('title slug image location date time createdAt')
            .lean();

        return NextResponse.json(
            {
                events,
                count: events.length
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error fetching user events:', error);

        if (error.message === 'Authentication required') {
            return NextResponse.json(
                { message: 'Please login to view your events' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { message: 'Failed to fetch events' },
            { status: 500 }
        );
    }
}