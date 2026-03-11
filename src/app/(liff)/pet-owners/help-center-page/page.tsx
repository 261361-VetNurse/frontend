"use client";

import { ChevronLeft, Search, ChevronDown, ChevronUp, Phone } from 'lucide-react';
import { useState } from 'react';

type FaqItem = {
  tag: string;
  detail: string;
  answer: string;
};

const faqItems: FaqItem[] = [
  {
    tag: "เริ่มใช้งาน App",
    detail: "มีสัตว์เลี้ยงหลายตัวต้อง Add เพิ่มยังไง?",
    answer: "ไปที่หน้า 'สัตว์เลี้ยงของฉัน' แล้วกดปุ่ม '+' มุมขวาบน จากนั้นกรอกข้อมูลสัตว์เลี้ยงตัวใหม่แล้วกด 'บันทึก'",
  },
  {
    tag: "ฟังก์ชันของ App",
    detail: "สามารถสั่งยาออนไลน์ใน App ได้ไหม?",
    answer: "ขณะนี้ยังไม่รองรับการสั่งยาออนไลน์โดยตรง สามารถติดต่อคลินิกผ่านช่องทาง 'สอบถามเพิ่มเติม' เพื่อให้สัตวแพทย์สั่งยาและจัดส่งให้",
  },
  {
    tag: "สัตว์เลี้ยง",
    detail: "ลืมให้สัตว์กินยา ต้องทำอย่างไร?",
    answer: "กดที่รายการยาในหน้า 'ยา' แล้วเลือก 'บันทึกให้ยาย้อนหลัง' — หากไม่แน่ใจควรปรึกษาสัตวแพทย์ก่อน",
  },
  {
    tag: "การนัดหมาย",
    detail: "ฉันสามารถเลื่อนวันนัดหมายได้อย่างไร?",
    answer: "ไปที่หน้า 'นัดหมาย' กดที่นัดที่ต้องการเลื่อน เลือก 'แก้ไขนัดหมาย' — กรุณาเลื่อนล่วงหน้าอย่างน้อย 24 ชั่วโมง",
  },
  {
    tag: "การแจ้งเตือน",
    detail: "ทำไมฉันไม่ได้รับการแจ้งเตือนยา?",
    answer: "ตรวจสอบว่าเปิดการแจ้งเตือนใน Settings ของโทรศัพท์แล้ว และตรวจสอบว่าเวลาแจ้งเตือนตั้งไว้ถูกต้องในหน้า 'ยา'",
  },
  {
    tag: "ประวัติการรักษา",
    detail: "ฉันสามารถดูประวัติค่ารักษาได้จากที่ไหน?",
    answer: "ประวัติค่ารักษาอยู่ที่หน้า 'โปรไฟล์' > 'ประวัติการรักษา' กดที่แต่ละรายการเพื่อดูรายละเอียดและใบเสร็จ",
  },
];

const TAGS = ["ทั้งหมด", "เริ่มใช้งาน App", "ฟังก์ชันของ App", "สัตว์เลี้ยง", "การนัดหมาย", "การแจ้งเตือน", "ประวัติการรักษา"];

export default function HelpCenterPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("ทั้งหมด");

  const filtered = faqItems.filter((item) => {
    const matchTag = activeTag === "ทั้งหมด" || item.tag === activeTag;
    const matchSearch =
      search === "" ||
      item.detail.toLowerCase().includes(search.toLowerCase()) ||
      item.tag.toLowerCase().includes(search.toLowerCase());
    return matchTag && matchSearch;
  });

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full min-h-screen px-4 py-5">

        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            className="text-gray-700 mr-4"
            onClick={() => window.history.back()}
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-[18px] font-bold text-gray-800 flex-grow text-center mr-8">Help Center</h2>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="ค้นหาคำถาม..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-full py-2.5 px-5 pr-10 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#09BFF8] transition-all"
          />
          <Search className="absolute right-4 top-3 text-gray-400" size={17} />
        </div>

        {/* Tag Filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-hide">
          {TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`whitespace-nowrap text-[12px] font-medium px-3.5 py-1.5 rounded-full transition-all flex-shrink-0 ${activeTag === tag
                ? "bg-[#09BFF8] text-white"
                : "bg-gray-100 text-gray-500"
                }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mb-6">
          <h3 className="text-[15px] font-bold text-gray-800 mb-3">คำถามยอดฮิต</h3>

          {filtered.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              <p className="text-[14px] text-gray-400">ไม่พบคำถามที่ตรงกัน</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-100">
              {filtered.map((item) => {
                const realIndex = faqItems.indexOf(item);
                const isOpen = openIndex === realIndex;
                return (
                  <div key={realIndex}>
                    <button
                      onClick={() => toggle(realIndex)}
                      className="w-full px-4 py-3.5 flex items-start gap-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-grow min-w-0">
                        <span className="text-[10px] font-semibold text-[#09BFF8] uppercase tracking-wide">
                          {item.tag}
                        </span>
                        <p className="text-[13px] text-gray-800 font-medium leading-snug mt-0.5">{item.detail}</p>
                      </div>
                      <div className="flex-shrink-0 text-gray-400 mt-1">
                        {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4">
                        <div className="bg-[#09BFF8]/10 rounded-xl px-4 py-3 border-l-2 border-[#09BFF8]">
                          <p className="text-[12.5px] text-gray-600 leading-relaxed">{item.answer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div>
          <h3 className="text-[15px] font-bold text-gray-800 mb-3">สอบถามเพิ่มเติม</h3>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#09BFF8]/10 flex items-center justify-center flex-shrink-0">
              <Phone size={18} className="text-[#09BFF8]" />
            </div>
            <div className="flex-grow">
              <p className="text-[15px] font-bold text-gray-800">053 948 031</p>
              <p className="text-[11px] text-gray-400 mt-0.5">เวลาให้บริการ 09.00 – 20.00 น.</p>
            </div>
            <a
              href="tel:053948031"
              className="bg-[#09BFF8] text-white text-[12px] font-semibold px-4 py-2 rounded-full"
            >
              โทร
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}