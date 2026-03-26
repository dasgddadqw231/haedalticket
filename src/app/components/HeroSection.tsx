import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-[#1E2A5E]"
      style={{ minHeight: "310px" }}
    >
      {/* ── 배경 레이어: 그리드 도트 패턴 ── */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* ── 장식 원 – 좌상단 ── */}
      <div
        className="absolute -top-20 -left-20 rounded-full border border-white/10"
        style={{ width: 340, height: 340 }}
      />
      <div
        className="absolute -top-8 -left-8 rounded-full border border-white/10"
        style={{ width: 200, height: 200 }}
      />

      {/* ── 장식 원 – 우하단 ── */}
      <div
        className="absolute -bottom-24 -right-24 rounded-full border border-white/10"
        style={{ width: 380, height: 380 }}
      />
      <div
        className="absolute -bottom-10 -right-10 rounded-full border border-white/10"
        style={{ width: 220, height: 220 }}
      />

      {/* ── 골드 액센트 글로우 ── */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-3xl"
        style={{
          width: 480,
          height: 480,
          background:
            "radial-gradient(circle, #E8C547 0%, transparent 70%)",
        }}
      />

      {/* ── 우상단 장식 카드 실루엣 ── */}
      <div className="absolute top-16 right-6 opacity-[0.06] pointer-events-none">
        <svg width="120" height="76" viewBox="0 0 120 76" fill="none">
          <rect width="120" height="76" rx="8" fill="white" />
          <rect x="0" y="20" width="120" height="14" fill="white" />
        </svg>
      </div>
      <div className="absolute top-28 right-14 opacity-[0.04] pointer-events-none">
        <svg width="90" height="56" viewBox="0 0 90 56" fill="none">
          <rect width="90" height="56" rx="6" fill="white" />
          <rect x="0" y="15" width="90" height="10" fill="white" />
        </svg>
      </div>

      {/* ── 좌하단 장식 카드 실루엣 ── */}
      <div className="absolute bottom-14 left-4 opacity-[0.05] pointer-events-none rotate-[-12deg]">
        <svg width="100" height="64" viewBox="0 0 100 64" fill="none">
          <rect width="100" height="64" rx="7" fill="white" />
          <rect x="0" y="17" width="100" height="12" fill="white" />
        </svg>
      </div>

      {/* ── 수평 구분선 – 좌측 포인트 ── */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-20">
        <div className="h-px w-14 bg-white" />
        <div className="w-1.5 h-1.5 rounded-full bg-[#E8C547]" />
      </div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-20 flex-row-reverse">
        <div className="h-px w-14 bg-white" />
        <div className="w-1.5 h-1.5 rounded-full bg-[#E8C547]" />
      </div>

      {/* ── 메인 콘텐츠 ── */}
      <div className="relative z-10 max-w-lg mx-auto text-center pt-2 pb-0 px-6">

        {/* 뱃지 */}
        <div className="inline-flex items-center gap-2 mb-7">
          <span className="block w-6 h-px bg-[#E8C547]/60" />
          <span
            className="text-[#E8C547]/90 tracking-[0.18em] uppercase"
            style={{ fontSize: "0.68rem" }}
          >
            365일 24시간 · 빠르고 쉬운 상품권 매입
          </span>
          <span className="block w-6 h-px bg-[#E8C547]/60" />
        </div>

        {/* 구분선 */}
        <div className="flex items-center justify-center gap-3 my-5">
          <span className="block h-px w-10 bg-white/15" />
          <span className="block w-1 h-1 rounded-full bg-[#E8C547]/50" />
          <span className="block h-px w-10 bg-white/15" />
        </div>

        {/* 설명 */}
        <p className="text-white/45 mb-9" style={{ fontSize: "0.88rem", lineHeight: 1.75 }}>
          회원가입 없이 간편하게
          <br />
          상품권을 현금화 할 수 있습니다.
        </p>

        {/* CTA 버튼 */}
        <a
          href="#sell"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("sell")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-[#1E2A5E] transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] shadow-lg"
          style={{
            background: "linear-gradient(135deg, #F5E97A 0%, #E8C547 100%)",
            fontSize: "0.95rem",
          }}
        >
          상품권 번호 입력하기
          <ArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </a>

        {/* 하단 신뢰 지표 */}
        <div className="flex items-center justify-center gap-6 mt-4 opacity-40">
          {[
            { num: "최고가", label: "매입가 보장" },
            { num: "24시간", label: "연중무휴" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-white" style={{ fontSize: "0.75rem" }}>
                {item.num}
              </p>
              <p className="text-white/60" style={{ fontSize: "0.65rem", marginTop: 2 }}>
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 하단 페이드 ── */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#1a2550] to-transparent" />
    </section>
  );
}