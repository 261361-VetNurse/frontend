"use client";

import { X, ChevronLeft, Search } from 'lucide-react';

export default function HelpCenterPage() {
  const faqItems = [
    { topic: "เริ่มใช้งาน App", detail: "มีสัตว์เลี้ยงหลายตัวต้อง Add เพิ่มยังไง?" },
    { topic: "ฟังก์ชันของ App", detail: "สามารถสั่งยาออนไลน์ใน App ได้ไหม?" },
    { topic: "สัตว์เลี้ยง", detail: "ลืมให้สัตว์กินยา ต้องทำอย่างไร?" },
    { topic: "การนัดหมาย", detail: "ฉันสามารถเลื่อนวันนัดหมายได้อย่างไร" },
    { topic: "topic", detail: "detail" },
    { topic: "topic", detail: "detail" },
    { topic: "topic", detail: "detail" },
  ];

  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full min-h-screen relative pb-10">

        <div>
          {/* Help Center Title with Back Button */}
          <div className="flex items-center mb-5">
            <button className="text-gray-800 mr-4" onClick={() => window.history.back()}>
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-[18px] font-bold text-gray-800 flex-grow text-center mr-8">Help Center</h2>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full bg-white border border-gray-200 rounded-full py-2.5 px-5 pr-10 text-[14px] shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all"
            />
            <Search className="absolute right-4 top-3 text-gray-400" size={18} />
          </div>

          {/* FAQ Section */}
          <div className="mb-6">
            <h3 className="text-[16px] font-bold text-gray-800 mb-3 ml-1">คำถามยอดฮิต</h3>
            <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-50 overflow-hidden">
              {faqItems.map((item, index) => (
                <div 
                  key={index} 
                  className={`p-4 flex flex-col cursor-pointer hover:bg-gray-50 transition-colors ${
                    index !== faqItems.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <p className="text-[13px] text-gray-700 leading-relaxed font-medium">
                    <span className="font-bold text-gray-800">[{item.topic}]</span> {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-[16px] font-bold text-gray-800 mb-3 ml-1">สอบถามเพิ่มเติม</h3>
            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-50 text-center">
              <p className="text-[18px] font-bold text-gray-800 tracking-wide">โทร 053 948 031</p>
              <p className="text-[12px] text-gray-400 mt-1 font-medium">เวลาให้บริการ 09.00-20.00 น.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}