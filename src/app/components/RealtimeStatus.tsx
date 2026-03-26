import { useEffect, useRef } from "react";
import cultureCardImg from "figma:asset/788db9609c735aeca250f054df2b24440badbf43.png";
import starbucksCardImg from "figma:asset/71d838fa81d3d0d9ff68e30174fa04391b676ed3.png";
import lotteCardImg from "figma:asset/79a561ef1cf7c0b84f8fb24e20e710f1d7b8d210.png";

const cardImageMap: Record<string, string> = {
  "컬쳐랜드 상품권": cultureCardImg,
  "스타벅스 상품권": starbucksCardImg,
  "롯데모바일상품권": lotteCardImg,
};

const statusData = [
  { name: "오*원", type: "롯데모바일상품권", status: "입금 완료" },
  { name: "이*름", type: "스타벅스 상품권", status: "입금 완료" },
  { name: "김*규", type: "컬쳐랜드 상품권", status: "입금 완료" },
  { name: "주***", type: "롯데모바일상품권", status: "정산대기" },
  { name: "김*은", type: "스타벅스 상품권", status: "입금 완료" },
  { name: "박*수", type: "컬쳐랜드 상품권", status: "입금 완료" },
  { name: "최*진", type: "롯데모바일상품권", status: "입금 완료" },
  { name: "한*미", type: "스타벅스 상품권", status: "입금 완료" },
  { name: "정*호", type: "컬쳐랜드 상품권", status: "정산대기" },
  { name: "송*아", type: "롯데모바일상품권", status: "입금 완료" },
];

const ROW_HEIGHT = 48;
const VISIBLE_COUNT = 7;

function Row({ item }: { item: (typeof statusData)[0] }) {
  const img = cardImageMap[item.type];
  return (
    <div
      className="flex items-center px-4 border-b border-gray-100"
      style={{ height: ROW_HEIGHT, flexShrink: 0 }}
    >
      <span className="text-sm text-gray-700 w-16 shrink-0">{item.name}</span>
      <span className="flex-1 flex items-center gap-2 min-w-0">
        {img && (
          <img
            src={img}
            alt={item.type}
            className="w-8 h-6 rounded object-cover shrink-0"
          />
        )}
        <span className="text-sm text-gray-600 truncate">{item.type}</span>
      </span>
      <span
        className={`text-xs whitespace-nowrap text-right shrink-0 ${item.status === "입금 완료" ? "text-[#1E2A5E]" : "text-orange-500"
          }`}
      >
        {item.status}
      </span>
    </div>
  );
}

export function RealtimeStatus() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animId: number;
    let pos = 0;
    const totalHeight = statusData.length * ROW_HEIGHT; // height of one set
    const speed = 0.5; // px per frame

    const tick = () => {
      pos += speed;
      if (pos >= totalHeight) {
        pos -= totalHeight;
      }
      el.style.transform = `translateY(${-pos}px)`;
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <section id="status" className="py-10 px-4 bg-white">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-gray-800" style={{ fontSize: "1.2rem" }}>
            실시간 교환 현황
          </h2>
          <p className="text-gray-400 text-sm mt-1">최근 매입 현황입니다</p>
        </div>

        <div className="rounded-xl border border-gray-200 overflow-hidden">
          {/* Table header */}
          <div className="flex items-center px-4 py-3 bg-[#1E2A5E] text-white text-xs">
            <span className="w-16 shrink-0">이름</span>
            <span className="flex-1">상품명</span>
            <span className="w-16 text-right">상태</span>
          </div>

          {/* Continuous rolling ticker */}
          <div style={{ height: ROW_HEIGHT * VISIBLE_COUNT, overflow: "hidden" }}>
            <div ref={scrollRef} style={{ willChange: "transform" }}>
              {/* Render list twice for seamless loop */}
              {statusData.map((item, i) => (
                <Row key={`a-${i}`} item={item} />
              ))}
              {statusData.map((item, i) => (
                <Row key={`b-${i}`} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}