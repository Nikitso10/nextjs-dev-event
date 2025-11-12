'use server';

import Event, {IEventPlain} from '@/database/event.model';
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

export const getEventsByFilter = async (query: string): Promise<{ events: IEventPlain[] }> => {
    try {
        await connectDB();

        const params = new URLSearchParams(query);
        const filter: any = {};

        const title = params.get('title');
        const date = params.get('date');
        const tags = params.get('tags');
        const location = params.get('location');

        if (title) {
            filter.title = { $regex: title, $options: 'i' };
        }

        if (location) {
            filter.location = { $regex: location, $options: 'i' };
        }

        if (date) {
            const startOfDay = new Date(date);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            filter.date = { $gte: startOfDay, $lte: endOfDay };
        }

        if (tags) {
            const tagArray = tags.split(',').map(tag => tag.trim());
            filter.tags = { $in: tagArray };
        }

        const events = await Event.find(filter).sort({ createdAt: -1 }).lean<IEventPlain[]>();

        // Convert to plain objects
        const plainEvents: IEventPlain[] = events.map(event => ({
            ...event,
            _id: event._id.toString(),
            date: event.date.toString(),
            location: event.location.toString(),
            createdAt: event.createdAt.toString(),
            updatedAt: event.updatedAt.toString(),
        }));

        return { events: plainEvents };

    } catch (error) {
        console.error("Error in getEventsByFilter:", error);
        return { events: [] };
    }
};

export const getAllTags = async (): Promise<string[]> => {
    try {
        await connectDB();
        const tags = await Event.distinct("tags");
        return tags.sort();
    } catch (error) {
        console.error("Error fetching tags:", error);
        return [];
    }
};

export const getAllLocations = async (): Promise<string[]> => {
    try {
        await connectDB();
        const locations = await Event.distinct("location");
        return locations.sort();
    } catch (error) {
        console.error("Error fetching locations:", error);
        return [];
    }
};