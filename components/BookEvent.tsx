'use client';

import {useState} from "react";
import {createBooking} from "@/lib/actions/booking.actions";
import posthog from "posthog-js";

const BookEvent = ({ eventId, slug}: { eventId: string, slug: string}) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // server action
        const { success } = await createBooking({ eventId, slug, email });
        if (success) {
            setSubmitted(true);
            // track number of submissions and user behaviour
            posthog.capture('event_booked', { eventId, slug, email })
        } else {
            console.error('Booking creation failed');
            posthog.captureException('Booking creation failed');
        }

        // prevent reload
    //     e.preventDefault();
    //
    //     setTimeout(() => {
    //         setSubmitted(true);
    //     }, 1000)
    }

    return (
        <div id="book-event">
            {submitted ? (
                <p className="text-sm">Thank you for signing up!</p>
            ): (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email">Email Address</label>
                        <input type={email}
                               onChange={(e) => setEmail(e.target.value)}
                               value={email}
                                id="email"
                                placeholder="Enter your email address"
                        />
                    </div>

                    <button type="submit" className="button-submit">Submit</button>
                </form>
            )}

        </div>
    )
}
export default BookEvent
