'use client';

export default function NotificationsPage() {
  return (
    <div className="flex justify-center">
      {/* Container จำลองหน้าจอมือถือ */}
      <div className="w-full min-h-screen relative">

        <div className="p-4 space-y-6">
          {/* TODAY SECTION */}
          <section>
            <h2 className="text-gray-400 text-[12px] font-medium mb-3 ml-1 uppercase tracking-wider">Today</h2>
            <div className="space-y-3">
              
              {/* Appointment Card */}
              <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-start border border-gray-50">
                <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 mr-4 border border-gray-100">
                  <img src="/images/lee.png" alt="Pet" className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <h3 className="text-gray-800 font-bold text-[14px]">Appointment</h3>
                    <span className="text-[10px] text-gray-400 font-normal">5 min ago</span>
                  </div>
                  <p className="text-gray-500 text-[12px] mt-[2px] leading-tight">Lee หมอนัด 17/12/2025 11.00</p>
                </div>
              </div>

              {/* Medicine Card */}
              <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-start border border-gray-50">
                <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 mr-4 border border-gray-100">
                  <img src="/images/lee.png" alt="Pet" className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <h3 className="text-gray-800 font-bold text-[14px]">Medicine</h3>
                    <span className="text-[10px] text-gray-400 font-normal">48 min ago</span>
                  </div>
                  <p className="text-gray-500 text-[12px] mt-[2px] leading-tight">Lee อย่าลืมทานยา ABO 250 mg</p>
                </div>
              </div>

            </div>
          </section>

          {/* OLDER SECTION */}
          <section>
            <h2 className="text-gray-400 text-[12px] font-medium mb-3 ml-1 uppercase tracking-wider">Older</h2>
            <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-start border border-gray-50 relative overflow-hidden">
              <div className="w-11 h-11 rounded-full flex-shrink-0 overflow-hidden mr-4">
                <img 
                    src="/images/approve.png" 
                    alt="Approved" 
                    className="w-full h-full object-cover" 
                />
                </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <h3 className="text-gray-800 font-bold text-[14px]">System</h3>
                  <span className="text-[10px] text-gray-400 font-normal">2 days ago</span>
                </div>
                <p className="text-gray-500 text-[12px] mt-[2px] leading-tight">Tom ได้รับการยืนยันแล้ว</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}