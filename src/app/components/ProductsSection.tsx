import cultureCardImg from "figma:asset/788db9609c735aeca250f054df2b24440badbf43.png";
import starbucksCardImg from "figma:asset/71d838fa81d3d0d9ff68e30174fa04391b676ed3.png";
import lotteCardImg from "figma:asset/79a561ef1cf7c0b84f8fb24e20e710f1d7b8d210.png";
import hyundaiCardImg from "figma:asset/56d29cdec7c596f20470197d2278245a9970b04c.png";
import shinsegaeCardImg from "figma:asset/fdea8871a0940d4f67cc3244d9f2006b18423681.png";
import afreecaCardImg from "figma:asset/8a5589c3946363aa68c0ffbfbb282d81fcf8e592.png";
import booknlifeCardImg from "figma:asset/9ff9e63e0fcff244ca59538e3ca0d54a2a01fee1.png";

const cards = [
  { id: "culture",   name: "컬쳐랜드 상품권",      img: cultureCardImg,   blendMultiply: false },
  { id: "hyundai",   name: "현대 상품권",           img: hyundaiCardImg,   blendMultiply: false },
  { id: "starbucks", name: "스타벅스 상품권",       img: starbucksCardImg, blendMultiply: false },
  { id: "shinsegae", name: "신세계 상품권",          img: shinsegaeCardImg, blendMultiply: false },
  { id: "lotte",     name: "롯데 상품권",            img: lotteCardImg,     blendMultiply: false },
  { id: "afreeca",   name: "아프리카 별풍선교환권",  img: afreecaCardImg,   blendMultiply: true  },
  { id: "booknlife", name: "도서문화 상품권",        img: booknlifeCardImg, blendMultiply: true  },
];

export function ProductsSection() {
  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-lg mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h2 className="text-gray-900 mb-3" style={{ fontSize: "1.9rem", lineHeight: 1.2 }}>
            해달 상품권{" "}
            <span style={{ fontWeight: 800 }}>취급상품</span>
          </h2>
          <p className="text-gray-400" style={{ fontSize: "0.82rem", lineHeight: 1.7 }}>
            취급상품권 이 외의 상품권 이나 e-(모바일)쿠폰은
            <br />
            고객센터에 문의하여주세요
          </p>
        </div>

        {/* 카드 그리드 */}
        <div className="grid grid-cols-2 gap-4">
          {cards.map((card) => (
            <div key={card.id} className="flex flex-col gap-2">
              <div
                className="rounded-2xl overflow-hidden bg-[#f5f5f5] flex items-center justify-center p-2"
                style={{ aspectRatio: "1.55 / 1" }}
              >
                <img
                  src={card.img}
                  alt={card.name}
                  className="w-full h-full object-contain"
                  style={card.blendMultiply ? { mixBlendMode: "multiply" } : undefined}
                />
              </div>
              <p
                className="text-center text-gray-800"
                style={{ fontSize: "0.88rem", fontWeight: 600, lineHeight: 1.4 }}
              >
                {card.name}
              </p>
            </div>
          ))}

          {/* 기타 문의 카드 */}
          <div className="flex flex-col gap-2">
            <div
              className="rounded-2xl flex flex-col items-center justify-center gap-1.5 bg-[#1E2A5E]/5 border-2 border-dashed border-[#1E2A5E]/20"
              style={{ aspectRatio: "1.55 / 1" }}
            >
              <span className="text-[#1E2A5E]/50" style={{ fontSize: "1.4rem" }}>＋</span>
              <p className="text-[#1E2A5E]/50 text-center" style={{ fontSize: "0.65rem", lineHeight: 1.5 }}>
                그 외 상품권
                <br />
                문의 가능
              </p>
            </div>
            <p
              className="text-center text-gray-400"
              style={{ fontSize: "0.88rem", fontWeight: 600, lineHeight: 1.4 }}
            >
              기타 상품권
            </p>
          </div>
        </div>

        {/* 하단 안내 */}
        <div className="mt-6 px-4 py-3.5 rounded-xl bg-[#1E2A5E]/[0.04] border border-[#1E2A5E]/10 flex items-start gap-2.5">
          <span className="text-[#1E2A5E] mt-0.5 shrink-0" style={{ fontSize: "0.85rem" }}>ℹ</span>
          <p className="text-gray-500" style={{ fontSize: "0.75rem", lineHeight: 1.65 }}>
            목록에 없는 상품권도 카카오톡 <strong className="text-[#1E2A5E]">rctk2</strong> 또는
            전화 <strong className="text-[#1E2A5E]">010-2993-6992</strong>로 문의해 주시면
            빠르게 안내드립니다.
          </p>
        </div>
      </div>
    </section>
  );
}