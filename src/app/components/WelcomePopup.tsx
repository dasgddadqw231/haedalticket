import { useState, useEffect } from "react";
import { X } from "lucide-react";

export function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hideUntil = localStorage.getItem("hideWelcomePopupUntil");
    const now = new Date().getTime();

    if (!hideUntil || now > parseInt(hideUntil)) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleHideToday = () => {
    const tomorrow = new Date();
    tomorrow.setHours(24, 0, 0, 0);
    localStorage.setItem("hideWelcomePopupUntil", tomorrow.getTime().toString());
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5">
          <span className="text-[#1E2A5E] font-bold text-sm">안내</span>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pt-4 pb-6 space-y-5">
          <div className="bg-[#1E2A5E]/5 border border-[#1E2A5E]/15 rounded-xl px-4 py-3">
            <p className="text-[#1E2A5E] font-bold text-center text-[15px]">
              매입실패 시 꼭 재신청 해주세요
            </p>
          </div>

          <p className="text-gray-500 font-medium text-center text-sm">
            고객센터로 연락주세요
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
              <span className="text-gray-400 font-medium w-10">카톡</span>
              <span className="font-bold text-[#1E2A5E]">hdtk</span>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
              <span className="text-gray-400 font-medium w-10">문자</span>
              <span className="font-bold text-[#1E2A5E]">010-2909-2993</span>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
              <span className="text-gray-400 font-medium w-10">라인</span>
              <span className="font-bold text-[#1E2A5E]">hdtk2</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={handleHideToday}
            className="flex-1 py-3.5 bg-gray-100 text-gray-500 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
          >
            오늘 하루 열지않기
          </button>
          <button
            onClick={handleClose}
            className="flex-1 py-3.5 bg-[#1E2A5E] text-white rounded-lg font-medium hover:bg-[#2A3A7E] transition-colors text-sm"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
