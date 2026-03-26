import logoImg from "figma:asset/logo-real.png";

export function Footer() {
  return (
    <footer className="bg-[#1E2A5E] py-10 px-4 pb-24">
      <div className="max-w-lg mx-auto text-center">
        <img
          src={logoImg}
          alt="해달 상품권"
          className="h-10 mx-auto mb-6"
        />

        <div className="flex flex-col items-center gap-1 text-sm text-white/60">
          <p className="text-xs text-white/40 mt-2">대표 | 박만수</p>
          <p className="text-xs text-white/40">사업자등록번호 | 722-93-01794</p>
        </div>

        <p className="text-xs text-white/30 mt-6">
          © 해달상품권 2026
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
        </div>


      </div>
    </footer>
  );
}