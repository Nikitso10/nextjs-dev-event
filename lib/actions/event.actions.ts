'use server';

import Event from '@/database/event.model';
import connectDB from "@/lib/mongodb";

export const getSimilarEventsBySlug = async (slug: string) => {
    try {
        await connectDB();

        const event = await Event.findOne({ slug });
        // find similar events: ne (not included) the same event, in (included) same tags
        // lean method because event is returned by mongoose
        return await Event.find({ _id: { $ne: event._id}, tags: { $in: event.tags } }).lean();


    } catch {
        return [];
    }
}