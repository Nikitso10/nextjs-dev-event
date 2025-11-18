'use client';

import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/app/contexts/AuthContext';
import EventCard from '@/components/EventCard';
import { Calendar } from 'lucide-react';


interface Event {
    _id: string;
    title: string;
    slug: string;
    image: string;
    location: string;
    date: string;
    time: string;
}

export default function MyEventsPage() {
    const { user, loading: authLoading } = useRequireAuth();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            fetchMyEvents();
        }
    }, [user]);

    const fetchMyEvents = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/events/my-events');

            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }

            const data = await response.json();
            setEvents(data.events);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Show loading while checking auth
    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-light-100">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="mb-10">
                <h1>My Events</h1>
                <p className="text-light-100 text-lg max-sm:text-sm mt-5">
                    Events you've created
                </p>
                {user && (
                    <p className="text-light-200 text-sm mt-2">
                        Logged in as: <span className="text-primary font-medium">{user.email}</span>
                    </p>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[40vh]">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-light-100">Loading your events...</p>
                    </div>
                </div>
            ) : error ? (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive px-6 py-4 rounded-lg">
                    <p className="font-semibold">Error loading events</p>
                    <p className="text-sm mt-1">{error}</p>
                </div>
            ) : events.length === 0 ? (
                <div className="bg-dark-100 border-dark-200 card-shadow rounded-lg border p-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                        <Calendar className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">No Events Yet</h3>
                    <p className="text-light-100 text-lg mb-6 max-w-md mx-auto">
                        You haven't created any events yet. Start by creating your first event!
                    </p>
                    <a
                        href="/events/create"
                        className="inline-block bg-primary hover:bg-primary/90 text-black font-semibold px-8 py-3 rounded-md transition-colors"
                    >
                        Create Your First Event
                    </a>
                </div>
            ) : (
                <>
                    <div className="mb-6">
                        <p className="text-light-200 text-sm">
                            {events.length} {events.length === 1 ? 'event' : 'events'} found
                        </p>
                    </div>
                    <div className="events">
                        {events.map((event) => (
                            <EventCard
                                key={event._id}
                                title={event.title}
                                image={event.image}
                                slug={event.slug}
                                location={event.location}
                                date={event.date}
                                time={event.time}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}