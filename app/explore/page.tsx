"use client";

import { useState, useEffect } from "react";
import Event, {IEvent, IEventPlain} from '@/database/event.model';
import EventCard from "@/components/EventCard";
import {getAllTags, getEventsByFilter} from "@/lib/actions/event.actions";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function ExplorePage() {
    const [events, setEvents] = useState<IEventPlain[]>([]);
    const [search, setSearch] = useState("");
    const [date, setDate] = useState("");
    const [tags, setTags] = useState("");
    const [loading, setLoading] = useState(false);

    const [allTags, setAllTags] = useState<string[]>([]);
    const [filteredTags, setFilteredTags] = useState<string[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            setEvents([]);
            const params = new URLSearchParams();
            if (search) params.append("title", search);
            if (date) params.append("date", date);
            if (tags) params.append("tags", tags);

            const data = await getEventsByFilter(params.toString());

            console.log("Fetched events:", data);

            if (data && Array.isArray(data.events)) {
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
        const loadTags = async () => {
            const fetchedTags = await getAllTags();
            setAllTags(fetchedTags);
        };
        loadTags();
        fetchEvents();
    }, []);

    const handleTagInput = (value: string) => {
        setTags(value);

        // Extract the current tag being typed (after the last comma)
        const parts = value.split(",");
        const currentInput = parts[parts.length - 1].trim().toLowerCase();

        if (!currentInput) {
            setFilteredTags([]);
            setShowDropdown(false);
            return;
        }
        // Show matching tags
        const matches = allTags.filter((t) =>
            t.toLowerCase().includes(currentInput)
        );
        setFilteredTags(matches.slice(0, 10));
        setShowDropdown(true);
    };

    const handleSelectTag = (tag: string) => {
        // Replace the last typed segment with the selected tag
        const parts = tags.split(",").map((p) => p.trim()).filter(Boolean);

        // Replace or append tag
        if (parts.length > 0 && !tags.endsWith(",")) {
            parts[parts.length - 1] = tag;
        } else {
            parts.push(tag);
        }

        const newTags = Array.from(new Set(parts)).join(", ");
        setTags(newTags);
        setShowDropdown(false);
    };

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
                        {/* Tag autocomplete input */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Tags (comma separated)"
                                value={tags}
                                onChange={(e) => handleTagInput(e.target.value)}
                                onFocus={() => tags && setShowDropdown(true)}
                                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                                className="bg-dark-200 rounded-[6px] px-5 py-2.5 w-full"
                            />

                            {showDropdown && filteredTags.length > 0 && (
                                <ul className="absolute z-10 bg-dark-100 rounded-md mt-1 w-full shadow-lg max-h-48 overflow-y-auto">
                                    {filteredTags.map((tag) => (
                                        <li
                                            key={tag}
                                            onMouseDown={() => handleSelectTag(tag)}
                                            className="cursor-pointer px-4 py-2 hover:bg-dark-300"
                                        >
                                            {tag}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
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
                <h2 className="font-schibsted-grotesk text-2xl font-bold mt-10 mb-4">Search Results</h2>
                <ul className="events">
                    {events && events.length > 0 ? ( events.map((event: IEventPlain) => (
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

