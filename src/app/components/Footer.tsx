import logoImg from "figma:asset/logo-real.png";

export function Footer() {
  return (
    <footer className="bg-[#1E2A5E] py-10 px-4 pb-24">
      <div className="max-w-lg mx-auto text-center">
        <div className="flex flex-row items-center justify-center gap-1.5">
          <img
            src={logoImg}
            alt="해달 상품권"
            className="h-10"
          />
          <span className="text-[#E8C547] font-bold tracking-tight text-lg">
            해달상품권
          </span>
        </div>
        <p className="text-xs text-white/50 mt-6">고객센터 24시</p>

        <div className="flex flex-col items-center gap-1 text-sm text-white/60 mt-6">
          <p className="text-white font-bold text-base mb-3">해달상품권</p>
          <p className="text-xs text-white/40">대표 | 박만수</p>
          <p className="text-xs text-white/40">유선 | 010-2909-2993</p>
          <p className="text-xs text-white/40">사업자등록번호 | 722-93-01794</p>
          <p className="text-xs text-white/40">통신판매번호 | 2026달서0067호</p>
        </div>

        <p className="text-xs text-white/30 mt-6">
          © 해달상품권 2026
        </p>
      </div>
    </footer>
  );
}
