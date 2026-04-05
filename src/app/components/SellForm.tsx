import { useState, useEffect, useRef } from "react";
import { ChevronDown, Check, Trash2, X } from "lucide-react";
import cultureCardImg from "figma:asset/788db9609c735aeca250f054df2b24440badbf43.png";
import starbucksCardImg from "figma:asset/71d838fa81d3d0d9ff68e30174fa04391b676ed3.png";
import lotteCardImg from "figma:asset/79a561ef1cf7c0b84f8fb24e20e710f1d7b8d210.png";
import { addNormalOrder, getRates, type Rate } from "../lib/db";

const giftCardTypes = [
  {
    id: "lotte",
    name: "롯데모바일상품권",
    img: lotteCardImg,
    pinCount: 3,
    feeKey: "lotte",
    infoBg: "#FFF5F5",
    info: [
      "롯데 상품권 형식: 1234-1234-1234 (12자리)",
      "발행처 : 롯데멤버스",
      "신청 시 검토 후 입금됩니다.",
    ],
  },
  {
    id: "starbucks",
    name: "스타벅스 상품권",
    img: starbucksCardImg,
    pinCount: 4,
    feeKey: "starbucks",
    infoBg: "#F0FFF4",
    info: [
      "스타벅스 상품권 형식: 1234-1234-1234-1234 (16자리)",
      "발행처 : 스타벅스커피 코리아",
      "신청 시 검토 후 입금됩니다.",
    ],
  },
  {
    id: "culture",
    name: "컬쳐랜드 상품권",
    img: cultureCardImg,
    pinCount: 4,
    feeKey: "culture",
    infoBg: "#FFFBF0",
    info: [
      "컬쳐랜드 상품권 형식: 1234-1234-1234-1234 (16자리)",
      "발행처 : (주)한국문화진흥",
      "신청 시 검토 후 입금됩니다.",
    ],
  },
];

export function SellForm({ preselectedCard }: { preselectedCard?: string }) {
  const [selectedCard, setSelectedCard] = useState("");
  const [cardOpen, setCardOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [rates, setRates] = useState<Rate[]>([]);

  const [pinInputs, setPinInputs] = useState(["", "", "", ""]);
  const [name, setName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [registeredCards, setRegisteredCards] = useState<
    { type: string; pin: string }[]
  >([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getRates().then(setRates);
  }, []);

  useEffect(() => {
    if (preselectedCard) {
      setSelectedCard(preselectedCard);
      const card = giftCardTypes.find((c) => c.id === preselectedCard);
      setPinInputs(Array(card?.pinCount ?? 4).fill(""));
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  }, [preselectedCard]);

  const handleCardSelect = (cardId: string) => {
    setSelectedCard(cardId);
    setCardOpen(false);
    const card = giftCardTypes.find((c) => c.id === cardId);
    setPinInputs(Array(card?.pinCount ?? 4).fill(""));
  };

  const handlePinChange = (index: number, value: string) => {
    const newPins = [...pinInputs];
    newPins[index] = value.replace(/\D/g, "").slice(0, 4);
    setPinInputs(newPins);
  };

  const handleRegisterPin = () => {
    const pinCount = selectedCardObj?.pinCount ?? 4;
    const fullPin = pinInputs.slice(0, pinCount).join("-");
    if (pinInputs.slice(0, pinCount).every((p) => p.length === 4) && selectedCard) {
      setRegisteredCards([...registeredCards, { type: selectedCard, pin: fullPin }]);
      setPinInputs(Array(pinCount).fill(""));
    }
  };

  const handleRemoveCard = (index: number) => {
    setRegisteredCards(registeredCards.filter((_, i) => i !== index));
  };

  const selectedCardObj = giftCardTypes.find((c) => c.id === selectedCard);
  const canRegister = pinInputs.every((p) => p.length === 4) && !!selectedCard;
  const canSubmit =
    name && bankName && accountNumber && phoneNumber && agreed && registeredCards.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      await addNormalOrder({
        name,
        phone: phoneNumber,
        bank: bankName,
        account: accountNumber,
        cardType: selectedCardObj?.name ?? selectedCard,
        pins: registeredCards.map((c) => c.pin),
      });

      // 텔레그램 알림 (실패해도 주문은 정상 처리)
      const cardGroups = registeredCards.reduce<Record<string, number>>((acc, c) => {
        const cardName = giftCardTypes.find((t) => t.id === c.type)?.name ?? c.type;
        acc[cardName] = (acc[cardName] || 0) + 1;
        return acc;
      }, {});
      const cardSummary = Object.entries(cardGroups)
        .map(([name, count]) => `${name} (${count}매)`)
        .join(", ");

      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message:
            `[일반]\n` +
            `신청자: ${name}\n` +
            `연락처: ${phoneNumber}\n` +
            `상품권 종류: ${cardSummary}\n` +
            `신청날짜: ${new Date().toLocaleDateString("ko-KR")}\n` +
            `계좌번호: ${bankName} ${accountNumber}`,
        }),
      }).catch(() => {});

      // 고객 SMS 알림
      fetch("/api/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: phoneNumber.replace(/-/g, ""),
          text: `[해달상품권]\n${name}님의 교환 신청이 정상 접수되었습니다.\n\n■ ${cardSummary}\n■ ${new Date().toLocaleDateString("ko-KR")}\n\n검토 후 연락 드리겠습니다.\n라인 hdtk2`,
        }),
      }).catch(() => {});

      alert("교환 신청이 완료되었습니다!\n입력하신 계좌로 빠르게 입금해 드리겠습니다.");
      setSelectedCard("");
      setCardOpen(false);
      setPinInputs(["", "", "", ""]);
      setName("");
      setBankName("");
      setAccountNumber("");
      setPhoneNumber("");
      setAgreed(false);
      setRegisteredCards([]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="sell-form" className="py-10 px-4" ref={sectionRef}>
      <div className="max-w-lg mx-auto">
        {/* STEP 1 */}
        <div className="text-center mb-6">
          <span className="inline-block px-3 py-1 rounded-full text-xs text-[#1E2A5E] border border-[#1E2A5E]/20 bg-[#1E2A5E]/5">
            STEP 01
          </span>
          <h2 className="mt-3 text-gray-800" style={{ fontSize: "1.2rem" }}>
            상품권 선택
          </h2>
        </div>

        <div className="relative mb-3">
          <button
            onClick={() => setCardOpen(!cardOpen)}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border border-gray-200 bg-white hover:border-[#1E2A5E]/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              {selectedCardObj ? (
                <>
                  <img src={selectedCardObj.img} alt={selectedCardObj.name} className="w-5 h-5" />
                  <span className="text-gray-800">{selectedCardObj.name}</span>
                </>
              ) : (
                <span className="text-gray-400">상품권을 선택해주세요</span>
              )}
            </div>
            <ChevronDown
              size={20}
              className={`text-gray-400 transition-transform ${cardOpen ? "rotate-180" : ""}`}
            />
          </button>
          {cardOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-20 overflow-hidden">
              {giftCardTypes.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleCardSelect(card.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <img src={card.img} alt={card.name} className="w-5 h-5" />
                  <span className="text-gray-700">{card.name}</span>
                  {selectedCard === card.id && (
                    <Check size={16} className="ml-auto text-[#1E2A5E]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 상품권 설명 패널 */}
        {selectedCardObj && (() => {
          const rateObj = rates.find((r) => r.key === selectedCardObj.feeKey);
          const feePercent = rateObj ? (100 - rateObj.value) : null;
          return (
            <div
              className="flex items-center gap-4 rounded-2xl px-4 py-4 mb-10"
              style={{ backgroundColor: selectedCardObj.infoBg }}
            >
              <div className="shrink-0 w-16 h-16 flex items-center justify-center">
                <img
                  src={selectedCardObj.img}
                  alt={selectedCardObj.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <ul className="flex-1 space-y-1.5">
                {feePercent !== null && (
                  <li className="flex items-start gap-2">
                    <span className="text-[#B8A020] mt-0.5 shrink-0" style={{ fontSize: "0.7rem" }}>✓</span>
                    <span className="text-gray-600" style={{ fontSize: "0.76rem", lineHeight: 1.6 }}>
                      {selectedCardObj.name} 매입 수수료는 <strong>{feePercent}%</strong> 입니다.
                    </span>
                  </li>
                )}
                {selectedCardObj.info.map((line, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#B8A020] mt-0.5 shrink-0" style={{ fontSize: "0.7rem" }}>✓</span>
                    <span className="text-gray-600" style={{ fontSize: "0.76rem", lineHeight: 1.6 }}>
                      {line}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })()}

        {!selectedCardObj && <div className="mb-10" />}

        {/* STEP 2 */}
        <div className="text-center mb-6">
          <span className="inline-block px-3 py-1 rounded-full text-xs text-[#1E2A5E] border border-[#1E2A5E]/20 bg-[#1E2A5E]/5">
            STEP 02
          </span>
          <h2 className="mt-3 text-gray-800" style={{ fontSize: "1.2rem" }}>
            상품권 핀번호 입력
          </h2>
        </div>

        {/* 핀번호 입력 카드 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-[#1E2A5E] flex items-center justify-center shrink-0">
              <span className="text-white text-xs">+</span>
            </div>
            <span className="text-gray-800 text-sm">핀번호 직접 입력하기</span>
          </div>
          <p className="text-gray-400 text-xs mb-4">
            판매 신청하실 상품권 핀번호를 입력하시면 됩니다.
          </p>
          <div className={`grid gap-2 mb-3 ${(selectedCardObj?.pinCount ?? 4) === 3 ? "grid-cols-3" : "grid-cols-4"}`}>
            {pinInputs.map((pin, i) => (
              <input
                key={i}
                type="text"
                value={pin}
                onChange={(e) => handlePinChange(i, e.target.value)}
                placeholder="0000"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-center text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-[#1E2A5E] transition-colors"
                maxLength={4}
              />
            ))}
          </div>
          <button
            onClick={handleRegisterPin}
            className="w-full py-3 rounded-xl text-white transition-colors"
            style={{ backgroundColor: canRegister ? "#1E2A5E" : "#ccc" }}
          >
            등록
          </button>
        </div>

        {/* 등록된 상품권 패널 */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-800" style={{ fontSize: "0.9rem", fontWeight: 700 }}>
              등록된 상품권{" "}
              <span style={{ color: "#1E2A5E" }}>{registeredCards.length}매</span>
            </h3>
            {registeredCards.length > 0 && (
              <button
                onClick={() => setRegisteredCards([])}
                className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors"
                style={{ fontSize: "0.75rem" }}
              >
                <Trash2 size={13} />
                전체 삭제
              </button>
            )}
          </div>

          {registeredCards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 rounded-2xl bg-gray-50 border border-dashed border-gray-200">
              <p className="text-gray-700" style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                등록된 상품권이 없습니다.
              </p>
              <p className="text-gray-400 mt-1" style={{ fontSize: "0.78rem" }}>
                상품권을 등록해주세요.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {registeredCards.map((card, i) => {
                const cardInfo = giftCardTypes.find((c) => c.id === card.type);
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3"
                  >
                    {cardInfo && (
                      <img src={cardInfo.img} alt={cardInfo.name} className="w-8 h-8 object-contain shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                        {cardInfo?.name}
                      </p>
                      <p className="text-gray-400 truncate" style={{ fontSize: "0.75rem", letterSpacing: "0.04em" }}>
                        {card.pin}
                      </p>
                    </div>
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full shrink-0">
                      등록완료
                    </span>
                    <button
                      onClick={() => handleRemoveCard(i)}
                      className="text-gray-300 hover:text-red-400 transition-colors ml-1 shrink-0"
                    >
                      <X size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* STEP 3 */}
        <div className="text-center mb-6 mt-10">
          <span className="inline-block px-3 py-1 rounded-full text-xs text-[#1E2A5E] border border-[#1E2A5E]/20 bg-[#1E2A5E]/5">
            STEP 03
          </span>
          <h2 className="mt-3 text-gray-800" style={{ fontSize: "1.2rem" }}>
            주문정보 입력
          </h2>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <label className="block text-gray-600 text-sm mb-2">이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력해주세요"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 mb-5 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#1E2A5E] transition-colors"
          />

          <label className="block text-gray-600 text-sm mb-2">은행명</label>
          <input
            type="text"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="예) 국민은행, 카카오뱅크"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 mb-5 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#1E2A5E] transition-colors"
          />

          <label className="block text-gray-600 text-sm mb-2">계좌번호</label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
            placeholder="계좌번호를 입력해주세요"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 mb-5 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#1E2A5E] transition-colors"
          />

          <label className="block text-gray-600 text-sm mb-2">휴대폰 번호</label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="010-0000-0000"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 mb-5 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#1E2A5E] transition-colors"
          />

          <div className="text-xs text-gray-400 space-y-1 mb-5">
            <p>· 신청 건당 이체수수료 500원이 부과됩니다.</p>
            <p>· 신청이 완료되면 취소 및 환불이 불가합니다.</p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="w-full py-3.5 rounded-xl text-white transition-colors disabled:cursor-not-allowed"
            style={{ backgroundColor: canSubmit && !submitting ? "#1E2A5E" : "#ccc" }}
          >
            {submitting ? "처리 중..." : "교환 신청하기"}
          </button>

          <label className="flex items-center justify-center gap-2 mt-4 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4 rounded accent-[#1E2A5E]"
            />
            <span className="text-xs text-gray-500">
              개인정보 처리 방침 동의
            </span>
          </label>
        </div>
      </div>
    </section>
  );
}