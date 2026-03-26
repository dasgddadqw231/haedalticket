import cultureCardImg from "figma:asset/788db9609c735aeca250f054df2b24440badbf43.png";
import starbucksCardImg from "figma:asset/71d838fa81d3d0d9ff68e30174fa04391b676ed3.png";
import lotteCardImg from "figma:asset/79a561ef1cf7c0b84f8fb24e20e710f1d7b8d210.png";

const giftCards = [
  {
    id: 1,
    cardId: "culture",
    name: "컬쳐랜드 상품권",
    rate: "91%",
    img: cultureCardImg,
  },
  {
    id: 2,
    cardId: "starbucks",
    name: "스타벅스 상품권",
    rate: "90%",
    img: starbucksCardImg,
  },
  {
    id: 3,
    cardId: "lotte",
    name: "롯데모바일상품권",
    rate: "92%",
    img: lotteCardImg,
  },
];

export function GiftCardGrid({ onSelectCard }: { onSelectCard?: (cardId: string) => void }) {
  return (
    <section className="px-4 relative z-10" style={{ marginTop: "-2rem" }}>
      <div className="max-w-lg mx-auto flex flex-col gap-3">
        {giftCards.map((card) => (
          <button
            key={card.id}
            onClick={() => onSelectCard?.(card.cardId)}
            className="rounded-2xl p-4 flex items-center gap-4 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow active:scale-[0.99]"
          >
            <div className="w-16 h-11 rounded-lg overflow-hidden shrink-0 bg-gray-50">
              <img
                src={card.img}
                alt={card.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left flex-1">
              <div className="text-gray-800 text-sm">{card.name}</div>
              <div className="text-gray-400 text-xs mt-0.5">최고가 매입</div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[#1E2A5E] text-sm">{card.rate}</span>
              <p className="text-gray-400 text-xs">매입률</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}