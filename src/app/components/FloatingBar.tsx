import { Phone } from "lucide-react";
import lineIconImg from "figma:asset/f058f8067419a47702cf2efaa8c82110e845e34c.png";

export function FloatingBar() {
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] px-6 py-3">
        <a
          href="tel:010-2909-2993"
          className="w-[140px] flex items-center justify-center gap-2.5 py-1 text-sm font-bold text-gray-800 hover:text-[#1E2A5E] transition-colors whitespace-nowrap"
        >
          <Phone size={18} className="text-[#1E2A5E]" fill="currentColor" />
          <span className="tracking-tighter">전화로 상담하기</span>
        </a>
        <div className="w-px h-5 bg-gray-200" />
        <a
          href="https://line.me/ti/p/~hdtk2"
          target="_blank"
          rel="noopener noreferrer"
          className="w-[140px] flex items-center justify-center gap-2.5 py-1 text-sm font-bold text-gray-800 hover:text-[#1E2A5E] transition-colors whitespace-nowrap"
        >
          <img src={lineIconImg} alt="LINE" className="w-[22px] h-[22px] object-contain" />
          라인: hdtk2
        </a>
      </div>
    </div>
  );
}