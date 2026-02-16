import { NotificationItem } from "@/types/domain/notification";
import dayjs from "dayjs";


export default function NotificationCard({ item, onClick }: { item: NotificationItem; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-start border cursor-pointer transition-colors ${item.istaken ? 'bg-white border-gray-50' : 'bg-blue-50 border-blue-100'}`}
    >
      <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 mr-4 border border-gray-100">
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <h3 className={`text-gray-800 font-bold text-[14px] ${!item.istaken ? 'text-blue-700' : ''}`}>{item.title}</h3>
          <span className="text-[10px] text-gray-400 font-normal">{dayjs(item.notification_at).fromNow()}</span>
        </div>
        {/* @ts-ignore - message might not exist on all NotificationItem versions from API */}
        {item.message && <p className="text-gray-500 text-[12px] mt-[2px] leading-tight">{item.message}</p>}
      </div>
      {!item.istaken && <div className="ml-2 w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />}
    </div>
  );
}