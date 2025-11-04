import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import {IEvent} from "@/database";
import {cacheLife} from "next/cache";
import {GET} from "@/app/api/events/route";

const getBaseUrl = () => {
    if (typeof window !== 'undefined') return ''; // Client-side
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
    return 'http://localhost:3000'; // Default for local dev
};



// const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
// const BASE_URL = process.env.VERCEL_URL;
// Asynchronous server page allowing top level await
const Page = async () => {
    'use cache';
    cacheLife('hours')
    const baseUrl = getBaseUrl();
    const res = await GET();
    //const res = await fetch(`${baseUrl}/api/events`);

    // If the API fails, fail gracefully
    if (!res.ok) {
        console.error('API fetch failed:', res.statusText);
        return <div>Error loading events</div>;
    }

    const data = await res.json();
    const events = data.events || [];

    // const response = await fetch(`https://${BASE_URL}/api/events`);
    // const response = await fetch(`${BASE_URL}/api/events`);
    // destructure the actual events
    // const {events} = await response.json();

    return (
        <section>
            <h1 className="text-center">The Hub for Every Dev <br/> Event You Can't Miss</h1>
            <p className="text-center mt-5">Hackathons, Meetups and Conferences. All in One Place.</p>

            <ExploreBtn />

            <div className="mt-20 space-y-7">
                <h3>Featured Events</h3>
                <ul className="events">
                    {events && events.length > 0 && events.map((event: IEvent) => (
                        <li key={event.title} className="list-none">
                            <EventCard {...event} />
                        </li>

                    ))}
                </ul>
            </div>
        </section>
    )
}
export default Page
