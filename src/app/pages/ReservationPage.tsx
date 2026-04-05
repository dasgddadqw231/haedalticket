import { useState, useEffect } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Check, CalendarDays, CreditCard } from "lucide-react";
import lotteCardImg from "figma:asset/79a561ef1cf7c0b84f8fb24e20e710f1d7b8d210.png";
import shinsegaeCardImg from "figma:asset/2619779150e08b3781a2ef55302d131c85161139.png";
import { addReservationOrder, getRates, type Rate } from "../lib/db";

const giftCardTypes = [
  { id: "lotte", feeKey: "lotte", name: "롯데모바일상품권", img: lotteCardImg },
  { id: "shinsegae", feeKey: "shinsegae", name: "신세계 상품권", img: shinsegaeCardImg },
];

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function Calendar({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (date: string) => void;
}) {
  const today = new Date();
  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const canGoPrev =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          disabled={!canGoPrev}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <span className="text-gray-800 text-sm">
          {viewYear}년 {viewMonth + 1}월
        </span>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight size={18} className="text-gray-600" />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={`text-center text-xs py-1 ${
              i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"
            }`}
          >
            {w}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} />;
          }

          const dateStr = formatDate(viewYear, viewMonth, day);
          const isPast = dateStr < todayStr;
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selected;
          const dayOfWeek = (firstDay + day - 1) % 7;

          return (
            <button
              key={dateStr}
              disabled={isPast}
              onClick={() => onSelect(dateStr)}
              className={`
                h-10 rounded-lg text-sm flex items-center justify-center transition-colors
                ${isPast ? "text-gray-200 cursor-not-allowed" : "hover:bg-gray-100 cursor-pointer"}
                ${isSelected ? "!bg-[#1E2A5E] text-white hover:!bg-[#1E2A5E]" : ""}
                ${!isSelected && isToday ? "border border-[#1E2A5E] text-[#1E2A5E]" : ""}
                ${!isSelected && !isPast && dayOfWeek === 0 ? "text-red-500" : ""}
                ${!isSelected && !isPast && dayOfWeek === 6 ? "text-blue-500" : ""}
                ${!isSelected && !isPast && dayOfWeek !== 0 && dayOfWeek !== 6 ? "text-gray-700" : ""}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ReservationPage() {
  const [selectedCard, setSelectedCard] = useState("");
  const [cardOpen, setCardOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [percent, setPercent] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bankName, setBankName] = useState("");
  const [account, setAccount] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rates, setRates] = useState<Rate[]>([]);

  useEffect(() => {
    getRates().then(setRates);
  }, []);

  const selectedCardObj = giftCardTypes.find((c) => c.id === selectedCard);
  const selectedRate = selectedCardObj ? rates.find((r) => r.key === selectedCardObj.feeKey)?.value ?? 0 : 0;
  const canSubmit = selectedCard && amount && percent && selectedDate && selectedTime && name && phone && bankName && account && agreed;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      await addReservationOrder({
        reservationDate: `${selectedDate} ${selectedTime}`,
        name,
        phone,
        bank: bankName,
        account,
        cardType: selectedCardObj?.name ?? selectedCard,
        amount: Number(amount),
        percent: Number(percent),
        quantity: 1,
      });

      // 텔레그램 알림 (실패해도 주문은 정상 처리)
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message:
            `[예약문자]\n` +
            `신청자: ${name}\n` +
            `연락처: ${phone}\n` +
            `상품권 종류: ${selectedCardObj?.name} (${Number(amount).toLocaleString()}원)\n` +
            `할인율: ${percent}%\n` +
            `공급날짜: ${selectedDate} ${selectedTime}\n` +
            `계좌번호: ${bankName} ${account}`,
        }),
      }).catch(() => {});

      // 고객 SMS 알림
      fetch("/api/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: phone.replace(/-/g, ""),
          text: `[해달상품권]\n${name}님의 예약이 정상 접수되었습니다.\n\n■ ${selectedCardObj?.name} · ${Number(amount).toLocaleString()}원\n■ 할인율 ${percent}%\n■ 공급일 ${selectedDate} ${selectedTime}\n\n검토 후 연락 드리겠습니다.\n라인 hdtk2`,
        }),
      }).catch(() => {});

      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="pt-20 pb-28 px-4">
        <div className="max-w-lg mx-auto text-center py-20">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Check size={32} className="text-green-600" />
          </div>
          <h2 className="text-gray-800 mb-2" style={{ fontSize: "1.3rem" }}>예약이 완료되었습니다</h2>
          <p className="text-gray-500 text-sm mb-1">
            {selectedCardObj?.name} · {Number(amount).toLocaleString()}원
          </p>
          <p className="text-gray-500 text-sm mb-6">
            {selectedDate} {selectedTime}
          </p>
          <p className="text-gray-400 text-xs mb-8">
            예약일에 맞춰 핀번호를 준비해주세요.<br />
            담당자가 확인 후 연락드립니다.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setSelectedCard("");
              setAmount("");
              setPercent("");
              setSelectedDate("");
              setSelectedTime("");
              setName("");
              setPhone("");
              setBankName("");
              setAccount("");
            }}
            className="px-8 py-3 rounded-xl text-white bg-[#1E2A5E]"
          >
            새 예약하기
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 pb-28 px-4">
      <div className="max-w-lg mx-auto">
        {/* 페이지 타이틀 */}
        <div className="text-center py-8">
          <h1 className="text-gray-800" style={{ fontSize: "1.4rem" }}>예약 판매</h1>
          <p className="text-gray-400 text-sm mt-2">
            원하는 날짜에 맞춰 상품권을 판매할 수 있습니다
          </p>
        </div>

        {/* 상품권 선택 */}
        <div className="mb-6">
          <label className="block text-gray-600 text-sm mb-2">상품권 종류</label>
          <div className="relative">
            <button
              onClick={() => setCardOpen(!cardOpen)}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border border-gray-200 bg-white hover:border-[#1E2A5E]/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                {selectedCardObj ? (
                  <>
                    <img src={selectedCardObj.img} alt={selectedCardObj.name} className="w-9 h-9 object-contain" />
                    <span className="text-gray-800">{selectedCardObj.name}</span>
                  </>
                ) : (
                  <span className="text-gray-400">상품권을 선택해주세요</span>
                )}
              </div>
              <ChevronDown size={20} className={`text-gray-400 transition-transform ${cardOpen ? "rotate-180" : ""}`} />
            </button>
            {cardOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-20 overflow-hidden">
                {giftCardTypes.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => { setSelectedCard(card.id); setCardOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <img src={card.img} alt={card.name} className="w-9 h-9 object-contain" />
                    <span className="text-gray-700">{card.name}</span>
                    {selectedCard === card.id && <Check size={16} className="text-[#1E2A5E] ml-auto" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 금액 */}
        <div className="mb-6">
          <label className="block text-gray-600 text-sm mb-2">금액 (원)</label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
            placeholder="50,000"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-[#1E2A5E] transition-colors"
          />
        </div>

        {/* 퍼센트 */}
        <div className="mb-6">
          <label className="block text-gray-600 text-sm mb-2">할인율 (%)</label>
          <input
            type="text"
            value={percent}
            onChange={(e) => setPercent(e.target.value.replace(/[^\d.]/g, ""))}
            placeholder="예) 92"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-[#1E2A5E] transition-colors"
          />
        </div>

        {/* 캘린더 날짜 선택 */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-gray-600 text-sm mb-2">
            <CalendarDays size={16} />
            예약 날짜
          </label>
          <Calendar selected={selectedDate} onSelect={setSelectedDate} />
          {selectedDate && (
            <>
              <p className="text-sm text-[#1E2A5E] mt-2 text-center">
                선택된 날짜: {selectedDate}
              </p>
              <label className="block text-gray-600 text-sm mt-4 mb-2">공급 시간</label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:border-[#1E2A5E] transition-colors"
              />
            </>
          )}
        </div>

        {/* 연락처 정보 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h3 className="text-gray-800 text-sm mb-4 flex items-center gap-2">
            <CreditCard size={16} />
            예약자 정보
          </h3>
          <label className="block text-gray-600 text-sm mb-2">이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력해주세요"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 mb-4 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#1E2A5E] transition-colors"
          />
          <label className="block text-gray-600 text-sm mb-2">휴대폰 번호</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="010-0000-0000"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 mb-4 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#1E2A5E] transition-colors"
          />
          <label className="block text-gray-600 text-sm mb-2">은행명</label>
          <input
            type="text"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="예) 국민은행, 카카오뱅크"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 mb-4 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#1E2A5E] transition-colors"
          />
          <label className="block text-gray-600 text-sm mb-2">계좌번호</label>
          <input
            type="text"
            value={account}
            onChange={(e) => setAccount(e.target.value.replace(/\D/g, ""))}
            placeholder="계좌번호를 입력해주세요"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#1E2A5E] transition-colors"
          />
        </div>

        {/* 예약 요약 */}
        {selectedCard && amount && selectedDate && (
          <div className="bg-[#1E2A5E]/5 rounded-xl p-4 mb-6">
            <h4 className="text-sm text-[#1E2A5E] mb-2">예약 요약</h4>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>상품권</span>
              <span>{selectedCardObj?.name}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>금액</span>
              <span>{Number(amount).toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>할인율</span>
              <span>{percent}%</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>예약 날짜</span>
              <span>{selectedDate} {selectedTime}</span>
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="w-full py-3.5 rounded-xl text-white transition-colors disabled:cursor-not-allowed"
          style={{ backgroundColor: canSubmit && !submitting ? "#1E2A5E" : "#ccc" }}
        >
          {submitting ? "처리 중..." : "예약 신청하기"}
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
    </main>
  );
}