import { Phone, MessageCircle } from "lucide-react";
import { motion } from "motion/react";

export function StickyContactBar() {
  return (
    <div className="sticky bottom-0 z-50 p-4 pb-6 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none">
      <div className="flex gap-3 pointer-events-auto">
        <motion.a
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          href="tel:01029936992"
          className="flex-1 flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 shadow-lg rounded-full py-3.5 font-bold text-sm hover:bg-slate-50 transition-colors"
        >
          <Phone className="w-5 h-5 text-green-600 fill-green-600" />
          <span>전화로 상담하기</span>
        </motion.a>

        <motion.a
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          href="https://open.kakao.com/o/rctk2"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 shadow-lg rounded-full py-3.5 font-bold text-sm hover:bg-slate-50 transition-colors"
        >
          <MessageCircle className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <span>카카오톡 상담하기</span>
        </motion.a>
      </div>
    </div>
  );
}