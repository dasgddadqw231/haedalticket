import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Search, User, Phone, AlertCircle } from "lucide-react";

interface DayOrder {
  date: string;
  items: {
    name: string;
    requestAmount: number;
    depositAmount: number;
    status: string;
  }[];
}

/* ── Mock 사용자 DB (추후 Supabase 연동) ── */
interface UserOrders {
  name: string;
  phone: string;
  orders: DayOrder[];
}

const mockUsers: UserOrders[] = [
  {
    name: "김리코",
    phone: "010-1234-5678",
    orders: [
      {
        date: "2026.03.03",
        items: [
          { name: "롯데모바일상품권", requestAmount: 50000, depositAmount: 46000, status: "입금 완료" },
          { name: "스타벅스 상품권", requestAmount: 30000, depositAmount: 27000, status: "입금 완료" },
        ],
      },
      {
        date: "2026.03.02",
        items: [
          { name: "컬쳐랜드 상품권", requestAmount: 100000, depositAmount: 91000, status: "입금 완료" },
        ],
      },
      {
        date: "2026.03.01",
        items: [
          { name: "롯데모바일상품권", requestAmount: 50000, depositAmount: 46000, status: "입금 완료" },
          { name: "스타벅스 상품권", requestAmount: 10000, depositAmount: 9000, status: "정산대기" },
          { name: "컬쳐랜드 상품권", requestAmount: 50000, depositAmount: 45500, status: "입금 완료" },
        ],
      },
      {
        date: "2026.02.28",
        items: [],
      },
      {
        date: "2026.02.27",
        items: [
          { name: "롯데모바일상품권", requestAmount: 30000, depositAmount: 27600, status: "입금 완료" },
        ],
      },
    ],
  },
  {
    name: "박용진",
    phone: "010-9876-5432",
    orders: [
      {
        date: "2026.03.03",
        items: [
          { name: "컬쳐랜드 상품권", requestAmount: 200000, depositAmount: 182000, status: "입금 완료" },
        ],
      },
      {
        date: "2026.03.01",
        items: [
          { name: "스타벅스 상품권", requestAmount: 50000, depositAmount: 45000, status: "입금 완료" },
        ],
      },
    ],
  },
];

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
  // "2026-03-01" → "2026.03.01"
  return iso.replace(/-/g, ".");
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
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <span className="text-gray-800 text-sm">{viewYear}년 {viewMonth + 1}월</span>
        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <ChevronRight size={18} className="text-gray-600" />
        </button>
      </div>

      {/* 요일 */}
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

      {/* 날짜 그리드 */}
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

          // 범위 안 배경 색
          let bgClass = "";
          if (isSelected) bgClass = "bg-[#1E2A5E] text-white";
          else if (isInRange) bgClass = "bg-[#1E2A5E]/10";

          // 범위 양쪽 끝 모서리
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
  onVerified: (user: UserOrders) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);

  const formatPhone = (val: string) => {
    const nums = val.replace(/\D/g, "").slice(0, 11);
    if (nums.length <= 3) return nums;
    if (nums.length <= 7) return `${nums.slice(0, 3)}-${nums.slice(3)}`;
    return `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7)}`;
  };

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim()) {
      setError("이름과 휴대폰 번호를 모두 입력해주세요.");
      triggerShake();
      return;
    }
    const found = mockUsers.find(
      (u) => u.name === name.trim() && u.phone === phone.trim()
    );
    if (found) {
      setError("");
      onVerified(found);
    } else {
      setError("일치하는 주문 내역을 찾을 수 없습니다.");
      triggerShake();
    }
  };

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
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
          {/* 아이콘 */}
          <div className="w-14 h-14 bg-[#1E2A5E]/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search size={24} className="text-[#1E2A5E]" />
          </div>

          <p className="text-center text-gray-500 text-sm mb-6">
            판매 시 입력한 이름과 휴대폰 번호를 입력해주세요
          </p>

          {/* 이름 */}
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

          {/* 전화번호 */}
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

          {/* 에러 */}
          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm mb-4 bg-red-50 px-4 py-2.5 rounded-lg">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="w-full py-3.5 rounded-xl text-white bg-[#1E2A5E] hover:bg-[#162148] transition-colors"
          >
            조회하기
          </button>

          {/* 테스트 안내 */}
          <div className="mt-5 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-400 text-center">테스트 계정</p>
            <div className="flex justify-center gap-6 mt-1.5 text-xs text-gray-500">
              <span>김리코 / 010-1234-5678</span>
              <span>박용진 / 010-9876-5432</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ── 페이지 ── */
export function OrderHistoryPage() {
  const [verifiedUser, setVerifiedUser] = useState<UserOrders | null>(null);
  const [startDate, setStartDate] = useState("2026-03-01");
  const [endDate, setEndDate] = useState("2026-03-03");
  const [calendarOpen, setCalendarOpen] = useState(false);
  // "picking" tracks which end to set next
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
      // 끝 날짜가 시작보다 앞이면 swap
      if (date < startDate) {
        setEndDate(startDate);
        setStartDate(date);
      } else {
        setEndDate(date);
      }
      setPicking("start");
    }
  };

  // 필터링: "2026.03.01" 형식으로 비교
  const startDot = toDisplay(startDate);
  const endDot = endDate ? toDisplay(endDate) : startDot;
  const filtered = verifiedUser.orders.filter((d) => d.date >= startDot && d.date <= endDot);

  const rangeLabel =
    startDate && endDate
      ? `${toDisplay(startDate)} ~ ${toDisplay(endDate)}`
      : startDate
        ? `${toDisplay(startDate)} ~ 종료일 선택`
        : "날짜를 선택하세요";

  return (
    <main className="pt-14 pb-28">
      {/* Hero banner */}
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
              {/* 안내 */}
              <p className="text-xs text-center mb-3 text-gray-400">
                {picking === "start" ? "시작일을 선택하세요" : "종료일을 선택하세요"}
              </p>
              <RangeCalendar
                startDate={startDate}
                endDate={endDate}
                onSelect={handleDateSelect}
              />
              {/* 선택 완료 버튼 */}
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
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-300 text-sm">
            해당 기간에 거래 내역이 없습니다
          </div>
        )}

        <div className="space-y-5">
          {filtered.map((day) => {
            const totalRequest = day.items.reduce((s, i) => s + i.requestAmount, 0);
            const totalDeposit = day.items.reduce((s, i) => s + i.depositAmount, 0);

            return (
              <div key={day.date} className="rounded-xl border border-gray-200 overflow-hidden bg-white">
                {/* 날짜 헤더 */}
                <div className="bg-[#1E2A5E] px-4 py-3">
                  <span className="text-white text-sm">{day.date}</span>
                </div>

                {/* 합계 */}
                <div className="grid grid-cols-2 divide-x divide-gray-100">
                  <div className="px-4 py-4">
                    <p className="text-gray-400 text-xs mb-1">신청금액 합계</p>
                    <p className="text-gray-800" style={{ fontSize: "1.15rem" }}>
                      {totalRequest.toLocaleString()}원
                    </p>
                  </div>
                  <div className="px-4 py-4">
                    <p className="text-gray-400 text-xs mb-1">입금금액 합계</p>
                    <p className="text-[#1E2A5E]" style={{ fontSize: "1.15rem" }}>
                      {totalDeposit.toLocaleString()}원
                    </p>
                  </div>
                </div>

                {/* 상세 내역 */}
                {day.items.length > 0 && (
                  <div className="border-t border-gray-100">
                    {day.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-b-0"
                      >
                        <div>
                          <p className="text-sm text-gray-700">{item.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            신청 {item.requestAmount.toLocaleString()}원
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-[#1E2A5E]">
                            {item.depositAmount.toLocaleString()}원
                          </p>
                          <span
                            className={`text-xs ${item.status === "입금 완료"
                                ? "text-green-500"
                                : "text-orange-500"
                              }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {day.items.length === 0 && (
                  <div className="border-t border-gray-100 px-4 py-6 text-center text-gray-300 text-sm">
                    거래 내역이 없습니다
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}