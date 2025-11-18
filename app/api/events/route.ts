import {NextRequest, NextResponse} from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import { v2 as cloudinary } from "cloudinary";
import {requireAuth} from "@/lib/auth";

export async function POST(req: NextRequest, res: NextResponse) {
    try {
        // Require authentication - user must be logged in
        const user = await requireAuth(req);

        await connectDB();

        const formData = await req.formData();

        let event;

        try {
            event = Object.fromEntries(formData.entries());
        } catch (e) {
            return NextResponse.json({message: 'Invalid JSON data format'}, { status: 400 });
        }

        const file = formData.get('image') as File;

        if(!file) return NextResponse.json({message: 'Image file is required'}, {status: 400});

        let tags = JSON.parse(formData.get('tags') as string);
        let agenda = JSON.parse(formData.get('agenda') as string);
        // Convert file into a buffer containing a promise of a copy of Blob data
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        // Use buffer to pass it on to cloudinary object
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'DevEvent'}, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }).end(buffer);
        });

        // uploadResults contains the url, so must be defined as an object
        event.image = (uploadResult as { secure_url: string}).secure_url;





        const createdEvent = await Event.create({
            // spread properties of the event
            ...event,
            // storing in the right format
            tags: tags,
            agenda: agenda,
            createdBy: user.id,
        });

        return NextResponse.json({message: 'Event created successfully', event: createdEvent}, { status: 201 });

    } catch (e) {
        console.error(e);
        return NextResponse.json({message: 'Event Creation Failed', error: e instanceof Error ? e.message : 'unknown'}, { status: 500 });
    }
}

export async function GET() {
    try {
        await connectDB();
        // sort: new events showing at the top
        const events = await Event.find().sort({ createdAt: -1 });

        return NextResponse.json({message: 'Event found successfully', events}, {status: 200});
    } catch (e) {
        return NextResponse.json({message: 'Event fetching failed', error: e}, {status: 500});
    }
}



// httpie test api
// POST: 3000/api/events
// Body text:
// {
//     "title": "Cloud Next 2026",
//     "description": "Google’s premier cloud computing event, showcasing innovations in AI, infrastructure, and enterprise solutions.",
//     "overview": "Cloud Next 2025 highlights the latest in cloud-native development, Kubernetes, AI, and enterprise scalability. Developers, architects, and executives gather to learn about new Google Cloud services, best practices, and success stories.",
//     "image": "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2340",
//     "venue": "Moscone Center",
//     "location": "San Francisco, CA",
//     "date": "2025-04-10",
//     "time": "08:30",
//     "mode": "Hybrid (In-Person & Online)",
//     "audience": "Cloud engineers, DevOps, enterprise leaders, AI researchers",
//     "agenda": [
//     "08:30 AM - 09:30 AM | Keynote: AI-Driven Cloud Infrastructure",
//     "09:45 AM - 11:00 AM | Deep Dives: Kubernetes, Data Analytics, Security",
//     "11:15 AM - 12:30 PM | Product Demos & Networking",
//     "12:30 PM - 01:30 PM | Lunch",
//     "01:30 PM - 03:00 PM | Workshops: Scaling with GCP",
//     "03:15 PM - 04:30 PM | Fireside Chat: The Future of Enterprise Cloud"
// ],
//     "organizer": "Google Cloud organizes Cloud Next to connect global businesses, developers, and innovators with the latest technologies and best practices in cloud computing.",
//     "tags": ["Cloud", "DevOps", "Kubernetes", "AI"]
// }