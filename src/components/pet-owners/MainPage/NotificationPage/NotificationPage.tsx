"use client";

import { useRouter } from '@/hooks/use-next-routing';

import { useEffect, useState, useMemo } from "react";
import { authStorage, getAllNotifications, markNotificationAsRead } from "@/services/api/client";
import { UnifiedNotification } from "@/types/domain/notification";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import NotificationCard from "./NotificationCard";
import SectionError from "@/components/pet-owners/shared/SectionError";

import isTomorrow from "dayjs/plugin/isTomorrow";

dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(isTomorrow);

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<UnifiedNotification[]>([]);
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
            if (!token) throw new Error("No token found");
            const data = await getAllNotifications(token);
            setNotifications(data);
        } catch (err) {
            console.error(err);
            setError("Could not load notifications");
        } finally {
            setLoading(false);
        }
    };

    const router = useRouter();

    const handleNotificationClick = async (item: UnifiedNotification) => {
        // If it's a medicine notification, mark as taken and navigate
        if (item.type === 'medicine') {
            try {
                // Navigate to medication page with query params to open popup


                // Optimistically update status if not already read
                if (!item.is_read) {
                    const token = authStorage.getToken();
                    if (token) {
                        markNotificationAsRead(token, String(item.notification_id)).then(success => {
                            if (success) {
                                setNotifications(prev => prev.map(n =>
                                    (n.type === 'medicine' && n.notification_id === item.notification_id)
                                        ? { ...n, is_read: true, status: 'taken' }
                                        : n
                                ));
                            }
                        });
                    }
                }

                // Navigate
                router.push(`/pet-owners/medication-page?popup=view-medication&noti_id=${item.notification_id}`);

            } catch (err) {
                console.error(err);
            }
        } else if (item.type === 'appointment') {
            // For appointments, navigate to calendar page
            const appointmentId = (item.payload as { appointment_id?: string | number })?.appointment_id;

            // Mark as read locally (optimistic)
            if (!item.is_read) {
                setNotifications(prev => prev.map(n =>
                    (n.type === 'appointment' && n.notification_id === item.notification_id)
                        ? { ...n, is_read: true }
                        : n
                ));
            }

            // Navigate
            router.push(`/pet-owners/calendar-page?tab=appointment&appointment_id=${appointmentId}&popup=view-appointment`);
        }
    };

    const [showHistory, setShowHistory] = useState(false);

    const { todayNotifications, upcomingGroups, historyNotifications } = useMemo(() => {
        const today: UnifiedNotification[] = [];
        const history: UnifiedNotification[] = [];
        const upcoming: UnifiedNotification[] = [];
        const now = dayjs();

        // Sort by Date Desc
        const sorted = [...notifications].sort((a, b) => dayjs(b.notification_at).diff(dayjs(a.notification_at)));

        sorted.forEach(n => {
            const d = dayjs(n.notification_at);
            const diffMinutes = d.diff(now, 'minute');

            if (diffMinutes > 15) {
                // Future more than 15 mins - HIDE
                return;
            }

            if (diffMinutes >= 0 && diffMinutes <= 15) {
                // Upcoming within 15 mins
                upcoming.push(n);
            } else {
                // Past (diffMinutes < 0)
                if (d.isToday()) {
                    today.push(n);
                } else {
                    history.push(n);
                }
            }
        });

        // Group upcoming notifications (Group the future)
        // Usually upcoming shows nearest first.
        const upcomingSorted = [...upcoming].sort((a, b) => dayjs(a.notification_at).diff(dayjs(b.notification_at)));

        const upcomingGroupsMap: { [key: string]: UnifiedNotification[] } = {};
        upcomingSorted.forEach(n => {
            const d = dayjs(n.notification_at);
            let key = d.format("D MMM YYYY");
            if (d.isTomorrow()) key = "Tomorrow";
            if (d.isToday()) key = "Today"; // Should not happen for > 15 mins, but for 0-15 mins it is Today.

            if (!upcomingGroupsMap[key]) upcomingGroupsMap[key] = [];
            upcomingGroupsMap[key].push(n);
        });

        const uniqueUpcomingKeys = Array.from(new Set(upcomingSorted.map(n => {
            const d = dayjs(n.notification_at);
            if (d.isTomorrow()) return "Tomorrow";
            if (d.isToday()) return "Today";
            return d.format("D MMM YYYY");
        })));

        const upcomingGroupsList = uniqueUpcomingKeys.map(key => ({
            title: key,
            items: upcomingGroupsMap[key]
        }));

        return {
            todayNotifications: today,
            upcomingGroups: upcomingGroupsList,
            historyNotifications: history
        };
    }, [notifications]);

    if (loading) return <div className="p-5 text-center text-gray-400">Loading...</div>;

    return (
        <div className="flex justify-center">
            <div className="w-full min-h-screen relative pb-20">
                <div className="space-y-3">
                    {error ? (
                        <SectionError
                            message={error}
                            onRetry={fetchData}
                        />
                    ) : (
                        <>
                            {/* Upcoming Section (Grouped) */}
                            {upcomingGroups.length > 0 && (
                                <section className="mt-6 mb-3 flex flex-col items-end w-full">
                                    <button
                                        onClick={() => setShowHistory(!showHistory)}
                                        className="flex items-center text-gray-400 text-[12px] font-medium mb-3 ml-1 uppercase tracking-wider hover:text-gray-600 transition-colors"
                                    >
                                        Upcoming
                                        <svg
                                            className={`w-3 h-3 ml-1 transition-transform ${showHistory ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {showHistory && (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 w-full duration-200">
                                            {upcomingGroups.map((group) => (
                                                <div key={group.title}>
                                                    <h3 className="text-gray-400 text-[11px] font-medium mb-2 ml-1 opacity-70">
                                                        {group.title}
                                                    </h3>
                                                    <div className="space-y-3">
                                                        {group.items.map((n, index) => (
                                                            <NotificationCard
                                                                key={`upcoming-${n.type}-${n.notification_id}-${index}`}
                                                                item={n}
                                                                onClick={() => handleNotificationClick(n)}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* Today Section */}
                            <section>
                                <h2 className="flex items-center text-gray-400 text-[12px] font-medium mb-3 ml-1 uppercase tracking-wider hover:text-gray-600 transition-colors">
                                    Today
                                </h2>
                                {todayNotifications.length === 0 ? (
                                    <div className="text-center text-gray-400 py-4 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        No notifications today
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {todayNotifications.map((n, index) => (
                                            <NotificationCard
                                                key={`today-${n.type}-${n.notification_id}-${index}`}
                                                item={n}
                                                onClick={() => handleNotificationClick(n)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Earlier Section (Collapsible, Flat) */}
                            {historyNotifications.length > 0 && (
                                <section>
                                    <h2 className="flex items-center text-gray-400 text-[12px] font-medium mb-3 ml-1 uppercase tracking-wider hover:text-gray-600 transition-colors">
                                        Earlier
                                    </h2>
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {historyNotifications.map((n, index) => (
                                            <NotificationCard
                                                key={`history-${n.type}-${n.notification_id}-${index}`}
                                                item={n}
                                                onClick={() => handleNotificationClick(n)}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {todayNotifications.length === 0 && upcomingGroups.length === 0 && historyNotifications.length === 0 && (
                                <div className="text-center text-gray-400 mt-10">No notifications</div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}