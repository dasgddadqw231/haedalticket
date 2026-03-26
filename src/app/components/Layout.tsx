import { Outlet } from "react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { FloatingBar } from "./FloatingBar";
import { WelcomePopup } from "./WelcomePopup";

export function Layout() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Outlet />
      <Footer />
      <FloatingBar />
      <WelcomePopup />
    </div>
  );
}