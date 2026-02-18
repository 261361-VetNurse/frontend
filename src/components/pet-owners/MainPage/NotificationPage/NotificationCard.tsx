import { UnifiedNotification } from "@/types/domain/notification";
import dayjs from "dayjs";


export default function NotificationCard({ item, onClick }: { item: UnifiedNotification; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-start border cursor-pointer transition-colors ${item.is_read ? 'bg-white border-gray-50' : 'bg-blue-50 border-blue-100'}`}
    >
      <div className={`w-11 h-11 rounded-full overflow-hidden flex-shrink-0 mr-4 border border-gray-100 flex items-center justify-center ${item.type === 'medicine' ? 'bg-blue-100 text-blue-500' : 'bg-green-100 text-green-500'}`}>
        {/* Simple icon based on type */}
        {item.type === 'medicine' ? '💊' : '📅'}
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <h3 className={`text-gray-800 font-bold text-[14px] ${!item.is_read ? 'text-blue-700' : ''}`}>{item.title}</h3>
          <span className="text-[10px] text-gray-400 font-normal">{dayjs(item.notification_at).fromNow()}</span>
        </div>
        {/* Payload details if needed, e.g. location for appointments */}
        {item.type === 'appointment' && item.payload?.location && (
          <p className="text-gray-500 text-[12px] mt-[2px] leading-tight">at {item.payload.location}</p>
        )}
      </div>
      {!item.is_read && <div className="ml-2 w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />}
    </div>
  );
}