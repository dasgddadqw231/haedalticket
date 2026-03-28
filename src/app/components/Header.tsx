import { useState, useCallback } from "react";
import { Menu, X, Home, CalendarDays, ShoppingCart } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import logoImg from "figma:asset/logo-real.png";

const navItems = [
  { label: "홈", path: "/", icon: Home },
  { label: "즉시매입", path: "/#sell-form", icon: ShoppingCart, anchor: "sell-form" },
  { label: "예약판매", path: "/reservation", icon: CalendarDays },
];

function scrollToSellForm() {
  const el = document.getElementById("sell-form");
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = useCallback(
    (item: (typeof navItems)[number]) => {
      setMenuOpen(false);
      if (item.anchor) {
        if (location.pathname === "/") {
          scrollToSellForm();
        } else {
          navigate("/");
          setTimeout(scrollToSellForm, 300);
        }
        return;
      }
    },
    [location.pathname, navigate],
  );

  return (
    <header className="sticky top-0 z-50 bg-[#1E2A5E] shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/" onClick={() => setMenuOpen(false)} className="flex flex-row items-center gap-2.5">
          <img
            src={logoImg}
            alt="해달 상품권"
            className="h-8 object-contain"
          />
          <span className="text-[#E8C547] font-bold tracking-tight" style={{ fontSize: "0.95rem" }}>
            해달상품권
          </span>
        </Link>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {menuOpen && (
        <div className="bg-[#1E2A5E] border-t border-white/10">
          <div className="py-4 px-6 flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = item.anchor
                ? location.pathname === "/" && location.hash === `#${item.anchor}`
                : location.pathname === item.path;

              if (item.anchor) {
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(item)}
                    className={`flex items-center gap-3 py-3 transition-colors text-left ${isActive ? "text-white" : "text-white/70 hover:text-white"}`}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => handleNavClick(item)}
                  className={`flex items-center gap-3 py-3 transition-colors ${isActive ? "text-white" : "text-white/70 hover:text-white"
                    }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}