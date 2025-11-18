'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Tag, Plus, X, Upload } from 'lucide-react';

import { useRouter } from 'next/navigation';
import {useRequireAuth} from "@/app/contexts/AuthContext";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function CreateEventPage() {
    const { user, loading: authLoading } = useRequireAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [imagePreview, setImagePreview] = useState('');
    const [agendaItems, setAgendaItems] = useState(['']);
    const [tags, setTags] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        overview: '',
        venue: '',
        location: '',
        date: '',
        time: '',
        mode: 'hybrid',
        audience: '',
        organizer: '',
        image: null as File | null,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const addAgendaItem = () => {
        setAgendaItems([...agendaItems, '']);
    };

    const removeAgendaItem = (index: number) => {
        setAgendaItems(agendaItems.filter((_, i) => i !== index));
    };

    const updateAgendaItem = (index: number, value: string) => {
        const updated = [...agendaItems];
        updated[index] = value;
        setAgendaItems(updated);
    };

    const addTag = () => {
        if (currentTag.trim() && !tags.includes(currentTag.trim())) {
            setTags([...tags, currentTag.trim()]);
            setCurrentTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.image) {
            setError('Please upload an event image');
            return;
        }

        const validAgendaItems = agendaItems.filter(item => item.trim());
        if (validAgendaItems.length === 0) {
            setError('Please add at least one agenda item');
            return;
        }

        if (tags.length === 0) {
            setError('Please add at least one tag');
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'image' && value) {
                    data.append('image', value);
                } else if (value !== null) {
                    data.append(key, value.toString());
                }
            });

            data.append('agenda', JSON.stringify(validAgendaItems));
            data.append('tags', JSON.stringify(tags));

            // Token is automatically included in httpOnly cookie
            const response = await fetch('/api/events', {
                method: 'POST',
                body: data,
            });

            const result = await response.json();

            if (!response.ok) {
                // Handle authentication errors
                if (response.status === 401) {
                    setError('You must be logged in to create events. Redirecting to login...');
                    setTimeout(() => router.push('/login'), 2000);
                    return;
                }
                throw new Error(result.message || 'Failed to create event');
            }

            setSuccess(true);
            setError('');

            setFormData({
                title: '',
                description: '',
                overview: '',
                venue: '',
                location: '',
                date: '',
                time: '',
                mode: 'hybrid',
                audience: '',
                organizer: '',
                image: null,
            });
            setImagePreview('');
            setAgendaItems(['']);
            setTags([]);

            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Optionally redirect to the new event
            setTimeout(() => {
                router.push(`/events/${result.event.slug}`);
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    // Show loading while checking authentication
    if (authLoading) {
        return (
            <div className="w-full max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-light-100">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="mb-10">
                <h1>Create New Event</h1>
                <p className="text-light-100 text-lg max-sm:text-sm mt-5">
                    Fill in the details to create an amazing event
                </p>
                {user && (
                    <p className="text-sm text-light-200 mt-2">
                        Creating as: <span className="text-primary font-medium">{user.email}</span>
                    </p>
                )}
            </div>

            <div className="bg-dark-100 border-dark-200 card-shadow rounded-lg border p-8">
                {success && (
                    <div className="bg-primary/10 border border-primary/30 text-primary px-4 py-3 rounded-md mb-6">
                        <p className="font-semibold">Event created successfully!</p>
                        <p className="text-sm mt-1 text-light-100">Your event has been added to the system.</p>
                    </div>
                )}

                {error && (
                    <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-md mb-6">
                        {error}
                    </div>
                )}

                <div className="space-y-6" onSubmit={handleSubmit}>
                    {/* Image Upload */}
                    <div className="flex flex-col gap-2">
                        <label className="text-light-100 text-sm font-medium">
                            Event Image *
                        </label>
                        {imagePreview ? (
                            <div className="relative">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-64 object-cover rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImagePreview('');
                                        setFormData(prev => ({ ...prev, image: null }));
                                    }}
                                    className="absolute top-2 right-2 bg-destructive text-white p-2 rounded-md hover:bg-destructive/90"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border-dark rounded-lg cursor-pointer hover:border-primary/50 hover:bg-dark-200/50 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-12 h-12 text-light-200 mb-3" />
                                    <p className="mb-2 text-sm text-light-100">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-light-200">PNG, JPG or WEBP (MAX. 5MB)</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </label>
                        )}
                    </div>

                    {/* Title */}
                    <div className="flex flex-col gap-2">
                        <label className="text-light-100 text-sm font-medium">Event Title *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            maxLength={100}
                            required
                            className="bg-dark-200 rounded-md px-5 py-2.5 text-foreground"
                            placeholder="e.g., Tech Conference 2025"
                        />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-2">
                        <label className="text-light-100 text-sm font-medium">Description *</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            maxLength={1000}
                            required
                            rows={3}
                            className="bg-dark-200 rounded-md px-5 py-2.5 text-foreground resize-none"
                            placeholder="Brief description of the event"
                        />
                    </div>

                    {/* Overview */}
                    <div className="flex flex-col gap-2">
                        <label className="text-light-100 text-sm font-medium">Overview *</label>
                        <textarea
                            name="overview"
                            value={formData.overview}
                            onChange={handleInputChange}
                            maxLength={500}
                            required
                            rows={2}
                            className="bg-dark-200 rounded-md px-5 py-2.5 text-foreground resize-none"
                            placeholder="Quick overview of what attendees can expect"
                        />
                    </div>

                    {/* Venue and Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-light-100 text-sm font-medium flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Venue *
                            </label>
                            <input
                                type="text"
                                name="venue"
                                value={formData.venue}
                                onChange={handleInputChange}
                                required
                                className="bg-dark-200 rounded-md px-5 py-2.5 text-foreground"
                                placeholder="e.g., Convention Center"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-light-100 text-sm font-medium">Location *</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                required
                                className="bg-dark-200 rounded-md px-5 py-2.5 text-foreground"
                                placeholder="e.g., San Francisco, CA"
                            />
                        </div>
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-light-100 text-sm font-medium flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Date *
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                required
                                className="bg-dark-200 rounded-md px-5 py-2.5 text-foreground"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-light-100 text-sm font-medium flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Time *
                            </label>
                            <input
                                type="time"
                                name="time"
                                value={formData.time}
                                onChange={handleInputChange}
                                required
                                className="bg-dark-200 rounded-md px-5 py-2.5 text-foreground"
                            />
                        </div>
                    </div>

                    {/* Mode */}
                    <div className="flex flex-col gap-2">
                        <label className="text-light-100 text-sm font-medium">Event Mode *</label>
                        <select
                            name="mode"
                            value={formData.mode}
                            onChange={handleInputChange}
                            required
                            className="bg-dark-200 rounded-md px-5 py-2.5 text-foreground"
                        >
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                            <option value="hybrid">Hybrid</option>
                        </select>
                    </div>

                    {/* Audience */}
                    <div className="flex flex-col gap-2">
                        <label className="text-light-100 text-sm font-medium flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Target Audience *
                        </label>
                        <input
                            type="text"
                            name="audience"
                            value={formData.audience}
                            onChange={handleInputChange}
                            required
                            className="bg-dark-200 rounded-md px-5 py-2.5 text-foreground"
                            placeholder="e.g., Developers, designers, tech enthusiasts"
                        />
                    </div>

                    {/* Organizer */}
                    <div className="flex flex-col gap-2">
                        <label className="text-light-100 text-sm font-medium">Organizer *</label>
                        <textarea
                            name="organizer"
                            value={formData.organizer}
                            onChange={handleInputChange}
                            required
                            rows={2}
                            className="bg-dark-200 rounded-md px-5 py-2.5 text-foreground resize-none"
                            placeholder="Information about the organizing team or company"
                        />
                    </div>

                    {/* Agenda */}
                    <div className="flex flex-col gap-2">
                        <label className="text-light-100 text-sm font-medium">Agenda *</label>
                        <div className="space-y-2">
                            {agendaItems.map((item, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => updateAgendaItem(index, e.target.value)}
                                        className="flex-1 bg-dark-200 rounded-md px-5 py-2.5 text-foreground"
                                        placeholder="e.g., 09:00 AM - Opening Keynote"
                                    />
                                    {agendaItems.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeAgendaItem(index)}
                                            className="p-2 text-destructive hover:bg-destructive/10 rounded-md"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addAgendaItem}
                                className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/10 rounded-md transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                Add Agenda Item
                            </button>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-col gap-2">
                        <label className="text-light-100 text-sm font-medium flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            Tags *
                        </label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={currentTag}
                                onChange={(e) => setCurrentTag(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                className="flex-1 bg-dark-200 rounded-md px-5 py-2.5 text-foreground"
                                placeholder="Add a tag and press Enter"
                            />
                            <button
                                type="button"
                                onClick={addTag}
                                className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-black font-semibold rounded-md transition-colors"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="pill inline-flex items-center gap-2"
                                >
                  {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        className="hover:text-primary"
                                    >
                    <X className="w-4 h-4" />
                  </button>
                </span>
                            ))}
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-4 pt-6">
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 bg-primary hover:bg-primary/90 text-black font-semibold py-2.5 px-6 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Creating Event...' : 'Create Event'}
                        </button>
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="px-6 py-2.5 border border-border-dark text-light-100 rounded-md font-semibold hover:bg-dark-200 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}