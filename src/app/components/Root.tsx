import { Outlet } from "react-router";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { StickyContactBar } from "./components/StickyContactBar";
import { WelcomePopup } from "./components/WelcomePopup";

export default function Root() {
  return (
    /* PC: 회색 사이드 + 가운데 폰 프레임 */
    <div className="min-h-screen bg-[#E2E6ED] flex justify-center">
      <div className="w-full max-w-[430px] bg-white flex flex-col min-h-screen shadow-2xl relative">
        <Header />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
        <StickyContactBar />
        <WelcomePopup />
      </div>
    </div>
  );
}