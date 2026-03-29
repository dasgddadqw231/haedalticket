import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Search, User, Phone, AlertCircle, Loader2 } from "lucide-react";
import { getOrdersByUser, getReservationOrdersByUser } from "../lib/db";
import type { NormalOrder, ReservationOrder } from "../lib/db";

/* ── 유틸 ── */
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function getDaysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}
function getFirstDayOfMonth(y: number, m: number) {
  return new Date(y, m, 1).getDay();
}
function fmt(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function toDisplay(iso: string) {
  return iso.replace(/-/g, ".");
}

/** "2026.03.26 14:30" → "2026.03.26" */
function dateOnly(createdAt: string) {
  return createdAt.split(" ")[0];
}

interface VerifiedUser {
  name: string;
  phone: string;
  normalOrders: NormalOrder[];
  reservationOrders: ReservationOrder[];
}

/* ── 범위 캘린더 ── */
function RangeCalendar({
  startDate,
  endDate,
  onSelect,
}: {
  startDate: string;
  endDate: string;
  onSelect: (date: string) => void;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else setViewMonth(viewMonth + 1);
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const todayStr = fmt(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <span className="text-gray-800 text-sm">{viewYear}년 {viewMonth + 1}월</span>
        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <ChevronRight size={18} className="text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={`text-center text-xs py-1 ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"
              }`}
          >
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`e-${idx}`} />;

          const dateStr = fmt(viewYear, viewMonth, day);
          const dayOfWeek = (firstDay + day - 1) % 7;
          const isToday = dateStr === todayStr;

          const isStart = dateStr === startDate;
          const isEnd = dateStr === endDate;
          const isInRange =
            startDate && endDate && dateStr > startDate && dateStr < endDate;

          const isSelected = isStart || isEnd;

          let bgClass = "";
          if (isSelected) bgClass = "bg-[#1E2A5E] text-white";
          else if (isInRange) bgClass = "bg-[#1E2A5E]/10";

          let roundClass = "rounded-lg";
          if (isStart && endDate && startDate !== endDate) roundClass = "rounded-l-lg rounded-r-none";
          else if (isEnd && startDate && startDate !== endDate) roundClass = "rounded-r-lg rounded-l-none";
          else if (isInRange) roundClass = "rounded-none";

          return (
            <button
              key={dateStr}
              onClick={() => onSelect(dateStr)}
              className={`
                h-10 flex items-center justify-center text-sm transition-colors
                ${roundClass}
                ${bgClass}
                ${!isSelected && !isInRange ? "hover:bg-gray-100" : ""}
                ${!isSelected && isToday ? "border border-[#1E2A5E] text-[#1E2A5E] rounded-lg" : ""}
                ${!isSelected && !isInRange && !isToday && dayOfWeek === 0 ? "text-red-500" : ""}
                ${!isSelected && !isInRange && !isToday && dayOfWeek === 6 ? "text-blue-500" : ""}
                ${!isSelected && !isInRange && !isToday && dayOfWeek !== 0 && dayOfWeek !== 6 ? "text-gray-700" : ""}
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

/* ── 본인확인 화면 ── */
function VerifyForm({
  onVerified,
}: {
  onVerified: (user: VerifiedUser) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatPhone = (val: string) => {
    const nums = val.replace(/\D/g, "").slice(0, 11);
    if (nums.length <= 3) return nums;
    if (nums.length <= 7) return `${nums.slice(0, 3)}-${nums.slice(3)}`;
    return `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7)}`;
  };

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      setError("이름과 휴대폰 번호를 모두 입력해주세요.");
      triggerShake();
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const [normalOrders, reservationOrders] = await Promise.all([
        getOrdersByUser(name.trim(), phone.trim()),
        getReservationOrdersByUser(name.trim(), phone.trim()),
      ]);
      if (normalOrders.length === 0 && reservationOrders.length === 0) {
        setError("일치하는 주문 내역을 찾을 수 없습니다.");
        triggerShake();
      } else {
        setError("");
        onVerified({ name: name.trim(), phone: phone.trim(), normalOrders, reservationOrders });
      }
    } catch {
      setError("조회 중 오류가 발생했습니다. 다시 시도해주세요.");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-14 pb-28">
      <div className="bg-[#1E2A5E] pt-10 pb-12 px-4 text-center">
        <h1 className="text-white mb-2" style={{ fontSize: "1.4rem" }}>
          주문내역 조회
        </h1>
        <p className="text-white/60 text-sm">
          본인 확인 후 주문내역을 확인하실 수 있습니다
        </p>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-6">
        <div
          className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-6 ${shaking ? "animate-shake" : ""}`}
        >
          <div className="w-14 h-14 bg-[#1E2A5E]/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search size={24} className="text-[#1E2A5E]" />
          </div>

          <p className="text-center text-gray-500 text-sm mb-6">
            판매 시 입력한 이름과 휴대폰 번호를 입력해주세요
          </p>

          <div className="mb-4">
            <label className="flex items-center gap-2 text-gray-600 text-sm mb-2">
              <User size={14} />
              이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              placeholder="홍길동"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-[#1E2A5E] transition-colors"
            />
          </div>

          <div className="mb-5">
            <label className="flex items-center gap-2 text-gray-600 text-sm mb-2">
              <Phone size={14} />
              휴대폰 번호
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => { setPhone(formatPhone(e.target.value)); setError(""); }}
              placeholder="010-0000-0000"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-[#1E2A5E] transition-colors"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm mb-4 bg-red-50 px-4 py-2.5 rounded-lg">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-white bg-[#1E2A5E] hover:bg-[#162148] transition-colors disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                조회 중...
              </span>
            ) : "조회하기"}
          </button>
        </div>
      </div>
    </main>
  );
}

const statusStyle: Record<string, string> = {
  "대기중": "text-yellow-600",
  "입금 완료": "text-green-500",
  "취소": "text-red-500",
  "대기": "text-yellow-600",
  "선입금 완료": "text-blue-500",
  "정상 완료": "text-green-500",
};

/* ── 페이지 ── */
export function OrderHistoryPage() {
  const [verifiedUser, setVerifiedUser] = useState<VerifiedUser | null>(null);
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const [startDate, setStartDate] = useState(fmt(thirtyDaysAgo.getFullYear(), thirtyDaysAgo.getMonth(), thirtyDaysAgo.getDate()));
  const [endDate, setEndDate] = useState(fmt(today.getFullYear(), today.getMonth(), today.getDate()));
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [picking, setPicking] = useState<"start" | "end">("start");

  if (!verifiedUser) {
    return <VerifyForm onVerified={(user) => setVerifiedUser(user)} />;
  }

  const handleDateSelect = (date: string) => {
    if (picking === "start") {
      setStartDate(date);
      setEndDate("");
      setPicking("end");
    } else {
      if (date < startDate) {
        setEndDate(startDate);
        setStartDate(date);
      } else {
        setEndDate(date);
      }
      setPicking("start");
    }
  };

  // 날짜별 그룹핑
  const startDot = toDisplay(startDate);
  const endDot = endDate ? toDisplay(endDate) : startDot;

  type DayGroup = {
    date: string;
    items: { type: "normal" | "reservation"; cardType: string; status: string; pins?: number; amount?: number; quantity?: number }[];
  };

  const dayMap = new Map<string, DayGroup["items"]>();

  for (const order of verifiedUser.normalOrders) {
    const d = dateOnly(order.createdAt);
    if (d >= startDot && d <= endDot) {
      if (!dayMap.has(d)) dayMap.set(d, []);
      dayMap.get(d)!.push({
        type: "normal",
        cardType: order.cardType,
        status: order.status,
        pins: order.pins.length,
      });
    }
  }

  for (const order of verifiedUser.reservationOrders) {
    const d = dateOnly(order.createdAt);
    if (d >= startDot && d <= endDot) {
      if (!dayMap.has(d)) dayMap.set(d, []);
      dayMap.get(d)!.push({
        type: "reservation",
        cardType: order.cardType,
        status: order.status,
        amount: order.amount,
        quantity: order.quantity,
      });
    }
  }

  const days: DayGroup[] = Array.from(dayMap.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, items]) => ({ date, items }));

  const rangeLabel =
    startDate && endDate
      ? `${toDisplay(startDate)} ~ ${toDisplay(endDate)}`
      : startDate
        ? `${toDisplay(startDate)} ~ 종료일 선택`
        : "날짜를 선택하세요";

  return (
    <main className="pt-14 pb-28">
      <div className="bg-[#1E2A5E] pt-10 pb-12 px-4 text-center">
        <h1 className="text-white mb-2" style={{ fontSize: "1.4rem" }}>
          실시간 교환현황
        </h1>
        <p className="text-white/60 text-sm">
          {verifiedUser.name}님의 실시간 교환 현황입니다.
        </p>
      </div>

      <div className="max-w-lg mx-auto px-4">
        {/* 사용자 정보 바 */}
        <div className="flex items-center justify-between py-4 border-b border-gray-100 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1E2A5E]/10 flex items-center justify-center">
              <User size={14} className="text-[#1E2A5E]" />
            </div>
            <div>
              <p className="text-sm text-gray-800">{verifiedUser.name}</p>
              <p className="text-xs text-gray-400">{verifiedUser.phone}</p>
            </div>
          </div>
          <button
            onClick={() => setVerifiedUser(null)}
            className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            다른 계정 조회
          </button>
        </div>

        {/* 날짜 범위 선택 */}
        <div className="py-5">
          <button
            onClick={() => setCalendarOpen(!calendarOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 bg-white hover:border-[#1E2A5E]/30 transition-colors"
          >
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CalendarDays size={16} className="text-[#1E2A5E]" />
              <span>조회 기간</span>
            </div>
            <span className="text-sm text-gray-800">{rangeLabel}</span>
          </button>

          {calendarOpen && (
            <div className="mt-3">
              <p className="text-xs text-center mb-3 text-gray-400">
                {picking === "start" ? "시작일을 선택하세요" : "종료일을 선택하세요"}
              </p>
              <RangeCalendar
                startDate={startDate}
                endDate={endDate}
                onSelect={handleDateSelect}
              />
              {startDate && endDate && (
                <button
                  onClick={() => setCalendarOpen(false)}
                  className="w-full mt-3 py-2.5 rounded-xl bg-[#1E2A5E] text-white text-sm transition-colors hover:bg-[#162148]"
                >
                  적용하기
                </button>
              )}
            </div>
          )}
        </div>

        {/* 날짜별 리스트 */}
        {days.length === 0 && (
          <div className="text-center py-16 text-gray-300 text-sm">
            해당 기간에 거래 내역이 없습니다
          </div>
        )}

        <div className="space-y-5">
          {days.map((day) => (
            <div key={day.date} className="rounded-xl border border-gray-200 overflow-hidden bg-white">
              {/* 날짜 헤더 */}
              <div className="bg-[#1E2A5E] px-4 py-3 flex items-center justify-between">
                <span className="text-white text-sm">{day.date}</span>
                <span className="text-white/60 text-xs">{day.items.length}건</span>
              </div>

              {/* 주문 목록 */}
              <div>
                {day.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-b-0"
                  >
                    <div>
                      <p className="text-sm text-gray-700">{item.cardType}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.type === "normal"
                          ? `핀 ${item.pins}건`
                          : `${(item.amount ?? 0).toLocaleString()}원 × ${item.quantity}매`}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs ${statusStyle[item.status] ?? "text-gray-500"}`}>
                        {item.status}
                      </span>
                      <p className="text-xs text-gray-300 mt-0.5">
                        {item.type === "normal" ? "일반" : "예약"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
