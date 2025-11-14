"use client";

import { useState, useEffect } from "react";
import { IEventPlain } from '@/database/event.model';
import EventCard from "@/components/EventCard";
import AutocompleteInput from "@/components/AutocompleteInput";
import { getAllLocations, getAllTags, getEventsByFilter } from "@/lib/actions/event.actions";
import {useAutocomplete} from "@/hooks/useAutocomplete";

export default function ExplorePage() {
    const [events, setEvents] = useState<IEventPlain[]>([]);
    const [search, setSearch] = useState("");
    const [date, setDate] = useState("");
    const [loading, setLoading] = useState(false);

    const [allTags, setAllTags] = useState<string[]>([]);
    const [allLocations, setAllLocations] = useState<string[]>([]);

    // Use the autocomplete hook for tags (multi-select)
    const tagsAutocomplete = useAutocomplete({
        allOptions: allTags,
        multiSelect: true,
    });

    // Use the autocomplete hook for location (single select)
    const locationAutocomplete = useAutocomplete({
        allOptions: allLocations,
        multiSelect: false,
    });

    const fetchEvents = async () => {
        try {
            setLoading(true);
            setEvents([]);

            const params = new URLSearchParams();
            if (search) params.append("title", search);
            if (locationAutocomplete.value) params.append("location", locationAutocomplete.value);
            if (date) params.append("date", date);
            if (tagsAutocomplete.value) params.append("tags", tagsAutocomplete.value);

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
        const loadData = async () => {
            const [fetchedTags, fetchedLocations] = await Promise.all([
                getAllTags(),
                getAllLocations(),
            ]);
            setAllTags(fetchedTags);
            setAllLocations(fetchedLocations);
        };
        loadData();
    }, []);

    const EventTags = ({ tags }: { tags: string[] }) => (
        <div className="flex flex-row-gap-1.5 flex-wrap mt-5">
            {tags.map((tag) => (
                <div className="pill" key={tag}>{tag}</div>
            ))}
        </div>
    );

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

                        <AutocompleteInput
                            placeholder="Location"
                            value={locationAutocomplete.value}
                            filteredOptions={locationAutocomplete.filteredOptions}
                            showDropdown={locationAutocomplete.showDropdown}
                            onInput={locationAutocomplete.handleInput}
                            onSelect={locationAutocomplete.handleSelect}
                            onFocus={locationAutocomplete.handleFocus}
                            onBlur={locationAutocomplete.handleBlur}
                        />

                        <input
                            type="date"
                            placeholder="DD/MM/YYYY"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="bg-dark-200 rounded-[6px] px-5 py-2.5"
                        />

                        <AutocompleteInput
                            placeholder="Tags (comma separated)"
                            value={tagsAutocomplete.value}
                            filteredOptions={tagsAutocomplete.filteredOptions}
                            showDropdown={tagsAutocomplete.showDropdown}
                            onInput={tagsAutocomplete.handleInput}
                            onSelect={tagsAutocomplete.handleSelect}
                            onFocus={tagsAutocomplete.handleFocus}
                            onBlur={tagsAutocomplete.handleBlur}
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
                <div className="content">
                    <h2 className="font-schibsted-grotesk text-2xl font-bold mt-10 mb-4">
                        Search Results
                    </h2>
                    <ul className="events">
                        {events && events.length > 0 ? (
                            events.map((event: IEventPlain) => (
                                <li key={event.title} className="list-none">
                                    <EventCard {...event} />
                                    <EventTags tags={event.tags} />
                                </li>
                            ))
                        ) : (
                            <p>No events found.</p>
                        )}
                    </ul>
                </div>
            )}
        </section>
    );
}