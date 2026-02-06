"use client";

import { useEffect, useState, useMemo } from "react";
import { authStorage, getNotifications, markNotificationAsRead } from "@/services/api/client";
import { NotificationItem } from "@/types/domain/notification";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import NotificationCard from "./NotificationCard";
import SectionError from "@/components/pet-owners/shared/SectionError";

dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);

type GroupedNotifications = {
    title: string;
    items: NotificationItem[];
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = authStorage.getToken();
            if (!token) return;
            const data = await getNotifications(token);
            setNotifications(data);
        } catch (err) {
            console.error(err);
            setError("Could not load notifications");
        } finally {
            setLoading(false);
        }
    };

    const handleRead = async (id: string, isRead: boolean) => {
        if (isRead) return;
        try {
            const token = authStorage.getToken();
            if (!token) return;
            await markNotificationAsRead(token, id);
            // Update local state
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, is_read: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const groupedNotifications = useMemo(() => {
        const groups: { [key: string]: NotificationItem[] } = {};

        // Sort by Date Desc
        const sorted = [...notifications].sort((a, b) => dayjs(b.created_at).diff(dayjs(a.created_at)));

        sorted.forEach(n => {
            const d = dayjs(n.created_at);
            let key = d.format("D MMM YYYY");

            if (d.isToday()) key = "Today";
            else if (d.isYesterday()) key = "Yesterday";

            if (!groups[key]) groups[key] = [];
            groups[key].push(n);
        });

        // Convert to array and keep "Today" / "Yesterday" at top if they exist
        // Since we iterated sorted list, the keys insertion order might safeguard this but flexible map is safer.
        // Let's rely on reconstructing the list based on sorted unique keys from the sorted items to preserve order.

        const uniqueKeys = Array.from(new Set(sorted.map(n => {
            const d = dayjs(n.created_at);
            if (d.isToday()) return "Today";
            if (d.isYesterday()) return "Yesterday";
            return d.format("D MMM YYYY");
        })));

        return uniqueKeys.map(key => ({
            title: key,
            items: groups[key]
        }));
    }, [notifications]);

    if (loading) return <div className="p-5 text-center text-gray-400">Loading...</div>;

    return (
        <div className="flex justify-center">
            <div className="w-full min-h-screen relative">
                <div className="space-y-6">
                    {error ? (
                        <SectionError
                            message={error}
                            onRetry={fetchData}
                        />
                    ) : (
                        groupedNotifications.length === 0 ? (
                            <div className="text-center text-gray-400 mt-10">No notifications</div>
                        ) : (
                            groupedNotifications.map((group) => (
                                <section key={group.title}>
                                    <h2 className="text-gray-400 text-[12px] font-medium mb-3 ml-1 uppercase tracking-wider">
                                        {group.title}
                                    </h2>
                                    <div className="space-y-3">
                                        {group.items.map(n => (
                                            <NotificationCard
                                                key={n._id}
                                                item={n}
                                                onClick={() => handleRead(n._id, n.is_read)}
                                            />
                                        ))}
                                    </div>
                                </section>
                            ))
                        )
                    )}
                </div>
            </div>
        </div>
    );
}