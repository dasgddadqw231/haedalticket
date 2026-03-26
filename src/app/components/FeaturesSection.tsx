import { MessageCircle, ClipboardCheck, Banknote } from "lucide-react";

const steps = [
  {
    step: "01",
    Icon: MessageCircle,
    accent: "문자&전화&카톡으로",
    title: "365일 24시간 상담가능",
    desc: "상담원 365일 24시간 항시 상담 진행중",
    iconBg: "#1E2A5E",
    decor: ["💬", "📱", "💰"],
  },
  {
    step: "02",
    Icon: ClipboardCheck,
    accent: "상담후 접수진행하여",
    title: "신속한 처리진행해드립니다",
    desc: "간단한 정보로 빠르게 조회가능 합니다",
    iconBg: "#253470",
    decor: ["📋", "✅", "⚡"],
  },
  {
    step: "03",
    Icon: Banknote,
    accent: "해달 상품권",
    title: "빠른 마무리 절차",
    desc: "현금을 바로 사용 가능하십니다.",
    iconBg: "#1a2860",
    decor: ["💵", "🪙", "💸"],
  },
];

export function FeaturesSection() {
  return (
    <section className="py-10 px-4 bg-gray-50 mt-8">
      <div className="max-w-lg mx-auto flex flex-col gap-4">
        {steps.map((s) => (
          <div
            key={s.step}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4"
          >
            {/* 아이콘 */}
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: s.iconBg }}
            >
              <s.Icon size={22} className="text-white" />
            </div>

            {/* 텍스트 */}
            <div className="flex-1">
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#1E2A5E] text-white mb-2"
                style={{ fontSize: "0.65rem", letterSpacing: "0.08em" }}
              >
                STEP {s.step}
              </span>
              <p className="text-gray-800" style={{ fontSize: "0.95rem", fontWeight: 700, lineHeight: 1.45 }}>
                {s.accent}
              </p>
              <p className="text-gray-500" style={{ fontSize: "0.88rem", lineHeight: 1.45 }}>
                {s.title}
              </p>
              <p className="text-gray-400 mt-1" style={{ fontSize: "0.78rem" }}>
                {s.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}