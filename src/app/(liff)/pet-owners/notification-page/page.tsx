'use client';

export default function NotificationsPage() {
  return (
    <div className="bg-[#f2f2f2] min-h-screen font-sans flex justify-center">
      {/* Container จำลองหน้าจอมือถือ */}
      <div className="w-full max-w-md bg-[#f2f2f2] min-h-screen relative shadow-lg">
        
        {/* Header Section */}
        <div className="bg-white px-4 py-4 flex flex-col items-center relative border-b border-gray-100">
          <h1 className="text-gray-800 font-bold text-[16px] tracking-tight">PetCare+</h1>
          <p className="text-[10px] text-gray-400 mt-[-2px]">www.petcare.cmu.ac.th</p>
          <button className="absolute right-5 top-5 text-gray-400">
          </button>
        </div>

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

       {/* Bottom Navigation Bar จำลอง */}
        <div className="absolute bottom-0 w-full bg-white border-t border-gray-100 py-2 flex justify-around items-center">
        
        {/* Home */}
        <div className="flex flex-col items-center text-gray-400">
            <div className="w-6 h-6 mb-1">
            <img src="/images/home.png" alt="Home" className="w-full h-full object-contain opacity-40" />
            </div>
            <span className="text-[9px]">Home</span>
        </div>

        {/* Calendar */}
        <div className="flex flex-col items-center text-gray-400">
            <div className="w-6 h-6 mb-1">
            <img src="/images/calendar.png" alt="Calendar" className="w-full h-full object-contain opacity-40" />
            </div>
            <span className="text-[9px]">Calendar</span>
        </div>

        {/* My pets */}
        <div className="flex flex-col items-center text-gray-400">
            <div className="w-6 h-6 mb-1">
            <img src="/images/my-pets.png" alt="My pets" className="w-full h-full object-contain opacity-40" />
            </div>
            <span className="text-[9px]">My pets</span>
        </div>

        {/* Medication */}
        <div className="flex flex-col items-center text-gray-400">
            <div className="w-6 h-6 mb-1">
            <img src="/images/medication.png" alt="Medication" className="w-full h-full object-contain opacity-40" />
            </div>
            <span className="text-[9px]">Medication</span>
        </div>

        {/* Notifications (Active State) */}
        <div className="flex flex-col items-center text-[#00AAFF]">
            <div className="w-6 h-6 mb-1">
            <img src="/images/Notifications.png" alt="Notifications" className="w-full h-full object-contain" />
            </div>
            <span className="text-[9px] font-bold">Notifications</span>
        </div>

        </div>

      </div>
    </div>
  );
}