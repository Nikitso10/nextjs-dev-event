'use server';

import Event from '@/database/event.model';
import connectDB from "@/lib/mongodb";
import {NextResponse} from "next/server";

export const getSimilarEventsBySlug = async (slug: string) => {
    try {
        await connectDB();

        const event = await Event.findOne({ slug });
        // find similar events: '$ne' (not included) the same event, '$in' (included) same tags
        // lean method because event is returned by mongoose
        return await Event.find({ _id: { $ne: event._id}, tags: { $in: event.tags } }).lean();


    } catch {
        return [];
    }
}

export const getEventsByFilter = async (filter: string) => {
    try {
        await connectDB();

        const events = await Event.find({ filter });
        return NextResponse.json({message: 'Event found successfully', events}, {status: 200});


    } catch (e) {
        return NextResponse.json({message: 'Event fetching failed', error: e}, {status: 500});
    }
}