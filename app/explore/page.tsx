"use client";

import { useState, useEffect } from "react";
import Event, { IEvent } from '@/database/event.model';
import EventCard from "@/components/EventCard";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function ExplorePage() {
    const [events, setEvents] = useState<IEvent[]>([]);
    const [search, setSearch] = useState("");
    const [date, setDate] = useState("");
    const [tags, setTags] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            setEvents([]);
            const params = new URLSearchParams();
            if (search) params.append("title", search);
            if (date) params.append("date", date);
            if (tags) params.append("tags", tags);

            const res = await fetch(`${BASE_URL}/api/events?${params.toString()}`);
            const data = await res.json();

            console.log("Fetched events:", data);

            if (Array.isArray(data)) {
                setEvents(data);
            } else if (Array.isArray(data.events)) {
                setEvents(data.events);
            } else {
                console.error("Unexpected API response:", data);
                setEvents([]);
                }
            } catch (err) {
                console.error("Error fetching events:", err);
                setEvents([]);
            } finally {
            setLoading(false);
        }
        };

    useEffect(() => {
        fetchEvents();
    }, []);

    const EventTags = ({ tags }: { tags: string[] }) => (
        <div className="flex flex-row-gap-1.5 flex-wrap mt-5">
            {tags.map((tag) => (
                <div className="pill" key={tag}>{tag}</div>
            ))}
        </div>
    )

    return (
        <section id="event">
            <h1 className="header">Search Events</h1>


            {/* Filters */}
            <div className="details">
                <div className="booking">
                    <div className="signup-card">
                        <p>Search Events by Title, Date or Tags</p>
                        <input
                            type="text"
                            placeholder="Search by title"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-dark-200 rounded-[6px] px-5 py-2.5"
                        />
                        <input
                            type="date"
                            placeholder="DD/MM/YYYY"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="bg-dark-200 rounded-[6px] px-5 py-2.5"
                        />
                        <input
                            type="text"
                            placeholder="Tags (comma separated)"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="bg-dark-200 rounded-[6px] px-5 py-2.5"
                        />
                        <button
                            type="submit"
                            onClick={fetchEvents}
                            className="bg-primary hover:bg-primary/90 w-full cursor-pointer items-center justify-center rounded-[6px] px-4 py-2.5 text-lg font-semibold text-black"
                        >
                            {loading ? "Searching..." : "Search"}
                        </button>
                    </div>
            </div>


            </div>

            {/* Events Grid */}
            {loading ? (
                <p>Loading events...</p>
            ) : (
            <div className="content" >
                <h3>Search Results</h3>
                <ul className="events">
                    {events && events.length > 0 ? ( events.map((event: IEvent) => (
                        <li key={event.title} className="list-none">
                            <EventCard {...event} />
                            <EventTags tags={event.tags} />
                        </li>

                    ))) : (
                        <p>No events found.</p>
                    )}
                </ul>
            </div>
            )}
        </section>
    );

}

