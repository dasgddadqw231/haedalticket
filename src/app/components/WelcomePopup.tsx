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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Close button */}
        <div className="flex justify-end px-4 pt-4">
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Empty body */}
        <div className="px-6 py-10" />

        {/* Buttons */}
        <div className="flex gap-2 px-6 pb-6">
          <button
            onClick={handleHideToday}
            className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
          >
            오늘 하루 열지않기
          </button>
          <button
            onClick={handleClose}
            className="flex-1 py-4 bg-[#1E2A5E] text-white rounded-lg font-medium hover:bg-[#2A3A7E] transition-colors text-sm"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
