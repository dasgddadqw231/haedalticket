import { useState, useEffect, useCallback } from "react";
import {
  Lock,
  Check,
  Edit3,
  Save,
  X,
  Package,
  ShoppingBag,
  Percent,
  AlertCircle,
  User,
  CreditCard,
  Calendar,
  Hash,
  ChevronRight,
  FileText,
  RefreshCw,
  Loader2,
  Copy,
} from "lucide-react";
import logoImg from "figma:asset/logo-real.png";
import {
  getRates,
  updateRate,
  getNormalOrders,
  updateNormalOrderStatus,
  deleteNormalOrder,
  getReservationOrders,
  updateReservationOrderStatus,
  deleteReservationOrder,
} from "../lib/db";
import type {
  Rate,
  NormalOrder,
  ReservationOrder,
  NormalStatus,
  ReservationStatus,
} from "../lib/db";

/* ──────────────────────────────────────────
   상수
────────────────────────────────────────── */
// 비밀번호는 Vercel 환경변수 ADMIN_PASSWORD에서 서버 측 검증

const NORMAL_STATUSES: NormalStatus[] = ["대기중"];
const RESERVATION_STATUSES: ReservationStatus[] = [
  "대기", "선입금 완료",
];

const normalStatusStyle: Record<NormalStatus, string> = {
  대기중: "bg-yellow-50 text-yellow-600 border border-yellow-200",
  "입금 완료": "bg-green-50 text-green-600 border border-green-200",
  취소: "bg-red-50 text-red-500 border border-red-200",
};

const reservationStatusStyle: Record<ReservationStatus, string> = {
  대기: "bg-yellow-50 text-yellow-600 border border-yellow-200",
  "선입금 완료": "bg-blue-50 text-blue-600 border border-blue-200",
  "정상 완료": "bg-green-50 text-green-600 border border-green-200",
  취소: "bg-red-50 text-red-500 border border-red-200",
};

/* ──────────────────────────────────────────
   공통 배지
────────────────────────────────────────── */
function NormalBadge({ status }: { status: NormalStatus }) {
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full ${normalStatusStyle[status]}`}>
      {status}
    </span>
  );
}

function ReservationBadge({ status }: { status: ReservationStatus }) {
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full ${reservationStatusStyle[status]}`}>
      {status}
    </span>
  );
}

/* ──────────────────────────────────────────
   로딩 / 에러 상태
──────────────────────────────────────────── */
function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-300">
      <Loader2 size={32} className="animate-spin mb-3 text-[#1E2A5E]/40" />
      <p className="text-sm text-gray-400">불러오는 중...</p>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <AlertCircle size={32} className="mb-3 text-red-300" />
      <p className="text-sm mb-4">데이터를 불러오지 못했습니다</p>
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl border border-gray-200 hover:border-[#1E2A5E]/30 transition-colors"
      >
        <RefreshCw size={12} /> 다시 시도
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-300">
      <Package size={40} className="mb-3" />
      <p className="text-sm">주문이 없습니다</p>
    </div>
  );
}

/* ──────────────────────────────────────────
   일반 주문 모달
────────────────────────────────────────── */
function NormalOrderModal({
  order,
  saving,
  onClose,
  onSave,
  onDelete,
}: {
  order: NormalOrder;
  saving: boolean;
  onClose: () => void;
  onSave: (id: string, status: NormalStatus) => void;
  onDelete: (id: string) => void;
}) {
  const [status, setStatus] = useState<NormalStatus>(order.status);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-[430px] bg-white rounded-t-3xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-400 font-mono mb-0.5">{order.id}</p>
            <p className="text-sm text-gray-800">{order.createdAt}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[70vh] px-5 py-4 space-y-4">
          {/* 고객 정보 */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs text-gray-400 mb-3 flex items-center gap-1.5">
              <User size={11} /> 고객 정보
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">이름</p>
                <p className="text-sm text-gray-800">{order.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">연락처</p>
                <p className="text-sm text-gray-800">{order.phone}</p>
              </div>
            </div>
          </div>

          {/* 입금 계좌 */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs text-gray-400 mb-3 flex items-center gap-1.5">
              <CreditCard size={11} /> 입금 계좌
            </p>
            <div className="flex items-center gap-3 bg-white border border-gray-200 px-3 py-2.5 rounded-xl">
              <span className="text-sm text-gray-800 shrink-0">{order.bank}</span>
              <span className="text-gray-200">|</span>
              <span className="text-sm text-gray-700 font-mono flex-1">{order.account}</span>
              <button
                onClick={() => navigator.clipboard.writeText(`${order.bank} ${order.account}`)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
              >
                <Copy size={14} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* 핀번호 */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <Hash size={11} /> 핀번호 ({order.pins.length}매)
              </p>
              <span className="text-xs bg-[#1E2A5E]/10 text-[#1E2A5E] px-2.5 py-1 rounded-full">
                {order.cardType}
              </span>
            </div>
            <div className="space-y-2">
              {order.pins.map((pin, i) => (
                <div key={i} className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2.5 rounded-xl">
                  <span className="text-xs text-gray-300 w-4">{i + 1}</span>
                  <p className="text-sm text-gray-700 font-mono">{pin}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 상태 변경 */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs text-gray-400 mb-3">주문 상태 변경</p>
            <div className="grid grid-cols-3 gap-2">
              {NORMAL_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`py-2.5 rounded-xl text-xs border transition-all ${status === s
                    ? "border-[#1E2A5E] bg-[#1E2A5E] text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-[#1E2A5E]/30"
                    }`}
                >
                  {status === s && <Check size={11} className="inline mr-1" />}
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-100 space-y-2">
          <button
            onClick={() => onSave(order.id, status)}
            disabled={saving}
            className="w-full py-3.5 rounded-2xl bg-[#1E2A5E] text-white text-sm hover:bg-[#162148] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : null}
            {saving ? "저장 중..." : "저장하기"}
          </button>
          <button
            onClick={() => { if (confirm("이 주문을 삭제하시겠습니까?")) onDelete(order.id); }}
            disabled={saving}
            className="w-full py-3 rounded-2xl border border-red-200 text-red-500 text-sm hover:bg-red-50 transition-colors disabled:opacity-60"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   예약 주문 모달
────────────────────────────────────────── */
function ReservationOrderModal({
  order,
  saving,
  onClose,
  onSave,
  onDelete,
}: {
  order: ReservationOrder;
  saving: boolean;
  onClose: () => void;
  onSave: (id: string, status: ReservationStatus) => void;
  onDelete: (id: string) => void;
}) {
  const [status, setStatus] = useState<ReservationStatus>(order.status);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-[430px] bg-white rounded-t-3xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-400 font-mono mb-0.5">{order.id}</p>
            <p className="text-sm text-gray-800">{order.createdAt}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[70vh] px-5 py-4 space-y-4">
          {/* 고객 정보 */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs text-gray-400 mb-3 flex items-center gap-1.5">
              <User size={11} /> 고객 정보
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">이름</p>
                <p className="text-sm text-gray-800">{order.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">연락처</p>
                <p className="text-sm text-gray-800">{order.phone}</p>
              </div>
            </div>
          </div>

          {/* 입금 계좌 */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs text-gray-400 mb-3 flex items-center gap-1.5">
              <CreditCard size={11} /> 입금 계좌
            </p>
            <div className="flex items-center gap-3 bg-white border border-gray-200 px-3 py-2.5 rounded-xl">
              <span className="text-sm text-gray-800 shrink-0">{order.bank}</span>
              <span className="text-gray-200">|</span>
              <span className="text-sm text-gray-700 font-mono flex-1">{order.account}</span>
              <button
                onClick={() => navigator.clipboard.writeText(`${order.bank} ${order.account}`)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
              >
                <Copy size={14} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* 예약 내용 */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs text-gray-400 mb-3 flex items-center gap-1.5">
              <Calendar size={11} /> 예약 내용
            </p>
            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-1">상품권 종류</p>
              <p className="text-sm text-gray-800">{order.cardType}</p>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">권종</p>
                <p className="text-sm text-gray-800">{order.amount.toLocaleString()}원</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">수량</p>
                <p className="text-sm text-gray-800">{order.quantity}매</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">합계</p>
                <p className="text-sm text-[#1E2A5E]">
                  {(order.amount * order.quantity).toLocaleString()}원
                </p>
              </div>
            </div>
            {order.reservationDate && (
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-gray-400">예약일</p>
                <p className="text-xs text-gray-700">{order.reservationDate}</p>
              </div>
            )}
          </div>

          {/* 상태 변경 */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs text-gray-400 mb-3">주문 상태 변경</p>
            <div className="grid grid-cols-2 gap-2">
              {RESERVATION_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`py-2.5 rounded-xl text-xs border transition-all flex items-center justify-center gap-1 ${status === s
                    ? "border-[#1E2A5E] bg-[#1E2A5E] text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-[#1E2A5E]/30"
                    }`}
                >
                  {status === s && <Check size={11} />}
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-100 space-y-2">
          <button
            onClick={() => onSave(order.id, status)}
            disabled={saving}
            className="w-full py-3.5 rounded-2xl bg-[#1E2A5E] text-white text-sm hover:bg-[#162148] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : null}
            {saving ? "저장 중..." : "저장하기"}
          </button>
          <button
            onClick={() => { if (confirm("이 주문을 삭제하시겠습니까?")) onDelete(order.id); }}
            disabled={saving}
            className="w-full py-3 rounded-2xl border border-red-200 text-red-500 text-sm hover:bg-red-50 transition-colors disabled:opacity-60"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   일반 주문 카드
────────────────────────────────────────── */
function NormalOrderCard({ order, onClick }: { order: NormalOrder; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl border border-gray-200 px-4 py-3.5 text-left hover:border-[#1E2A5E]/30 hover:shadow-sm active:scale-[0.99] transition-all"
    >
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs text-gray-400 font-mono">{order.id}</span>
        <NormalBadge status={order.status} />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#1E2A5E]/8 flex items-center justify-center shrink-0">
            <User size={14} className="text-[#1E2A5E]" />
          </div>
          <div>
            <p className="text-sm text-gray-800">{order.name}</p>
            <p className="text-xs text-gray-400">{order.createdAt}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs text-gray-500">{order.cardType}</p>
            <p className="text-xs text-gray-400">{order.pins.length}매</p>
          </div>
          <ChevronRight size={15} className="text-gray-300" />
        </div>
      </div>
    </button>
  );
}

/* ──────────────────────────────────────────
   예약 주문 카드
────────────────────────────────────────── */
function ReservationOrderCard({ order, onClick }: { order: ReservationOrder; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl border border-gray-200 px-4 py-3.5 text-left hover:border-[#1E2A5E]/30 hover:shadow-sm active:scale-[0.99] transition-all"
    >
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs text-gray-400 font-mono">{order.id}</span>
        <ReservationBadge status={order.status} />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#1E2A5E]/8 flex items-center justify-center shrink-0">
            <User size={14} className="text-[#1E2A5E]" />
          </div>
          <div>
            <p className="text-sm text-gray-800">{order.name}</p>
            <p className="text-xs text-gray-400">{order.createdAt}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs text-gray-500">{order.cardType}</p>
            <p className="text-xs text-[#1E2A5E]">
              {order.amount.toLocaleString()}원 × {order.quantity}
            </p>
          </div>
          <ChevronRight size={15} className="text-gray-300" />
        </div>
      </div>
    </button>
  );
}

/* ─────────────────────────────────────────
   매입률 관리 탭
────────────────────────────────────────── */
function RateManagement() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [drafts, setDrafts] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getRates();
      setRates(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRates(); }, [fetchRates]);

  const handleEdit = (key: string, current: number) => {
    setEditing((p) => ({ ...p, [key]: true }));
    setDrafts((p) => ({ ...p, [key]: current }));
  };

  const handleCancel = (key: string) => {
    setEditing((p) => ({ ...p, [key]: false }));
  };

  const handleSave = async (key: string) => {
    const v = drafts[key];
    if (isNaN(v) || v < 0 || v > 100) return;
    setSaving((p) => ({ ...p, [key]: true }));
    try {
      const updated = await updateRate(key, v);
      setRates(updated);
      setEditing((p) => ({ ...p, [key]: false }));
      setSaved((p) => ({ ...p, [key]: true }));
      setTimeout(() => setSaved((p) => ({ ...p, [key]: false })), 2000);
    } finally {
      setSaving((p) => ({ ...p, [key]: false }));
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={fetchRates} />;

  return (
    <div className="px-4 py-6 space-y-4">
      <div className="bg-[#1E2A5E]/5 border border-[#1E2A5E]/10 rounded-2xl p-4 flex items-start gap-3 mb-2">
        <AlertCircle size={16} className="text-[#1E2A5E] shrink-0 mt-0.5" />
        <p className="text-xs text-[#1E2A5E]/80 leading-relaxed">
          매입률을 변경하면 홈화면 상품권 소개 섹션에 즉시 반영됩니다. 신중하게 수정해주세요.
        </p>
      </div>

      {rates.map((rate) => (
        <div key={rate.key} className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: rate.color + "20" }}
              >
                <Percent size={16} style={{ color: rate.color }} />
              </div>
              <div>
                <p className="text-sm text-gray-800">{rate.label}</p>
                <p className="text-xs text-gray-400">상품권</p>
              </div>
            </div>
            {!editing[rate.key] ? (
              <button
                onClick={() => handleEdit(rate.key, rate.value)}
                className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:border-[#1E2A5E]/30 transition-colors"
              >
                <Edit3 size={12} /> 수정
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => handleCancel(rate.key)} className="p-1.5 text-gray-400 hover:text-gray-600">
                  <X size={15} />
                </button>
                <button
                  onClick={() => handleSave(rate.key)}
                  disabled={saving[rate.key]}
                  className="flex items-center gap-1.5 text-xs text-white bg-[#1E2A5E] px-3 py-1.5 rounded-lg disabled:opacity-60"
                >
                  {saving[rate.key]
                    ? <Loader2 size={12} className="animate-spin" />
                    : <Save size={12} />}
                  저장
                </button>
              </div>
            )}
          </div>

          {!editing[rate.key] ? (
            <div className="flex items-end gap-2">
              <span className="text-4xl" style={{ color: rate.color, fontWeight: 700 }}>
                {rate.value}
              </span>
              <span className="text-lg text-gray-400 mb-1">%</span>
              {saved[rate.key] && (
                <span className="text-xs text-green-500 mb-1.5 flex items-center gap-1">
                  <Check size={12} /> 저장됨
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                max={100}
                value={drafts[rate.key] ?? rate.value}
                onChange={(e) =>
                  setDrafts((p) => ({ ...p, [rate.key]: Number(e.target.value) }))
                }
                className="flex-1 px-4 py-3 border-2 border-[#1E2A5E] rounded-xl text-gray-800 focus:outline-none text-lg"
              />
              <span className="text-gray-400 text-lg">%</span>
            </div>
          )}

          <div className="mt-4">
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${editing[rate.key] ? (drafts[rate.key] ?? rate.value) : rate.value}%`,
                  backgroundColor: rate.color,
                }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-300">0%</span>
              <span className="text-xs text-gray-300">100%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────
   주문 관리 탭
────────────────────────────────────────── */
function OrderManagement() {
  const [subTab, setSubTab] = useState<"normal" | "reservation">("normal");

  /* 일반 주문 */
  const [normalOrders, setNormalOrders] = useState<NormalOrder[]>([]);
  const [normalLoading, setNormalLoading] = useState(true);
  const [normalError, setNormalError] = useState(false);
  const [normalFilter, setNormalFilter] = useState<NormalStatus | "전체">("전체");
  const [selectedNormal, setSelectedNormal] = useState<NormalOrder | null>(null);
  const [savingNormal, setSavingNormal] = useState(false);

  /* 예약 주문 */
  const [resOrders, setResOrders] = useState<ReservationOrder[]>([]);
  const [resLoading, setResLoading] = useState(true);
  const [resError, setResError] = useState(false);
  const [resFilter, setResFilter] = useState<ReservationStatus | "전체">("전체");
  const [selectedRes, setSelectedRes] = useState<ReservationOrder | null>(null);
  const [savingRes, setSavingRes] = useState(false);

  const fetchNormal = useCallback(async () => {
    setNormalLoading(true);
    setNormalError(false);
    try {
      setNormalOrders(await getNormalOrders());
    } catch {
      setNormalError(true);
    } finally {
      setNormalLoading(false);
    }
  }, []);

  const fetchRes = useCallback(async () => {
    setResLoading(true);
    setResError(false);
    try {
      setResOrders(await getReservationOrders());
    } catch {
      setResError(true);
    } finally {
      setResLoading(false);
    }
  }, []);

  useEffect(() => { fetchNormal(); }, [fetchNormal]);
  useEffect(() => { fetchRes(); }, [fetchRes]);

  const handleNormalSave = async (id: string, status: NormalStatus) => {
    setSavingNormal(true);
    try {
      const updated = await updateNormalOrderStatus(id, status);
      setNormalOrders(updated);
      setSelectedNormal(null);
    } finally {
      setSavingNormal(false);
    }
  };

  const handleResSave = async (id: string, status: ReservationStatus) => {
    setSavingRes(true);
    try {
      const updated = await updateReservationOrderStatus(id, status);
      setResOrders(updated);
      setSelectedRes(null);
    } finally {
      setSavingRes(false);
    }
  };

  const handleNormalDelete = async (id: string) => {
    setSavingNormal(true);
    try {
      const updated = await deleteNormalOrder(id);
      setNormalOrders(updated);
      setSelectedNormal(null);
    } finally {
      setSavingNormal(false);
    }
  };

  const handleResDelete = async (id: string) => {
    setSavingRes(true);
    try {
      const updated = await deleteReservationOrder(id);
      setResOrders(updated);
      setSelectedRes(null);
    } finally {
      setSavingRes(false);
    }
  };

  const normalStatuses: (NormalStatus | "전체")[] = ["전체", "대기중"];
  const resStatuses: (ReservationStatus | "전체")[] = [
    "전체", "대기", "선입금 완료",
  ];

  const filteredNormal =
    normalFilter === "전체" ? normalOrders : normalOrders.filter((o) => o.status === normalFilter);
  const filteredRes =
    resFilter === "전체" ? resOrders : resOrders.filter((o) => o.status === resFilter);

  const nCount = (s: NormalStatus | "전체") =>
    s === "전체" ? normalOrders.length : normalOrders.filter((o) => o.status === s).length;
  const rCount = (s: ReservationStatus | "전체") =>
    s === "전체" ? resOrders.length : resOrders.filter((o) => o.status === s).length;

  return (
    <>
      {/* 서브 탭 */}
      <div className="flex border-b border-gray-200 bg-white sticky top-14 z-10">
        <button
          onClick={() => setSubTab("normal")}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm transition-colors ${subTab === "normal" ? "text-[#1E2A5E] border-b-2 border-[#1E2A5E]" : "text-gray-400"
            }`}
        >
          <ShoppingBag size={15} />
          일반 매입
          <span className={`text-xs px-2 py-0.5 rounded-full ${subTab === "normal" ? "bg-[#1E2A5E] text-white" : "bg-gray-100 text-gray-500"}`}>
            {normalOrders.length}
          </span>
        </button>
        <button
          onClick={() => setSubTab("reservation")}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm transition-colors ${subTab === "reservation" ? "text-[#1E2A5E] border-b-2 border-[#1E2A5E]" : "text-gray-400"
            }`}
        >
          <Calendar size={15} />
          예약 매입
          <span className={`text-xs px-2 py-0.5 rounded-full ${subTab === "reservation" ? "bg-[#1E2A5E] text-white" : "bg-gray-100 text-gray-500"}`}>
            {resOrders.length}
          </span>
        </button>
      </div>

      {/* 상태 필터 */}
      <div
        className="flex gap-2 px-4 py-3 overflow-x-auto bg-white border-b border-gray-100"
        style={{ scrollbarWidth: "none" }}
      >
        {subTab === "normal"
          ? normalStatuses.map((s) => (
            <button
              key={s}
              onClick={() => setNormalFilter(s)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${normalFilter === s
                ? "bg-[#1E2A5E] text-white border-[#1E2A5E]"
                : "bg-white text-gray-500 border-gray-200"
                }`}
            >
              {s} {nCount(s)}
            </button>
          ))
          : resStatuses.map((s) => (
            <button
              key={s}
              onClick={() => setResFilter(s)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${resFilter === s
                ? "bg-[#1E2A5E] text-white border-[#1E2A5E]"
                : "bg-white text-gray-500 border-gray-200"
                }`}
            >
              {s} {rCount(s)}
            </button>
          ))}
      </div>

      {/* 주문 목록 */}
      <div className="px-4 py-4 space-y-2.5">
        {subTab === "normal" ? (
          normalLoading ? <LoadingSpinner /> :
            normalError ? <ErrorState onRetry={fetchNormal} /> :
              filteredNormal.length === 0 ? <EmptyState /> :
                filteredNormal.map((order) => (
                  <NormalOrderCard
                    key={order.id}
                    order={order}
                    onClick={() => setSelectedNormal(order)}
                  />
                ))
        ) : (
          resLoading ? <LoadingSpinner /> :
            resError ? <ErrorState onRetry={fetchRes} /> :
              filteredRes.length === 0 ? <EmptyState /> :
                filteredRes.map((order) => (
                  <ReservationOrderCard
                    key={order.id}
                    order={order}
                    onClick={() => setSelectedRes(order)}
                  />
                ))
        )}
      </div>

      {/* 모달 */}
      {selectedNormal && (
        <NormalOrderModal
          order={selectedNormal}
          saving={savingNormal}
          onClose={() => setSelectedNormal(null)}
          onSave={handleNormalSave}
          onDelete={handleNormalDelete}
        />
      )}
      {selectedRes && (
        <ReservationOrderModal
          order={selectedRes}
          saving={savingRes}
          onClose={() => setSelectedRes(null)}
          onSave={handleResSave}
          onDelete={handleResDelete}
        />
      )}
    </>
  );
}

/* ──────────────────────────────────────────
   로그인 화면
────────────────────────────────────────── */
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (res.ok) {
        onLogin();
      } else {
        setError(true);
        setShake(true);
        setPw("");
        setTimeout(() => setShake(false), 500);
      }
    } catch {
      setError(true);
      setShake(true);
      setPw("");
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1E2A5E] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[380px]">
        <div className="text-center mb-10">
          <img src={logoImg} alt="해달 상품권" className="h-28 object-contain mx-auto mb-5" />
          <p className="text-white/50 text-sm">관리자 페이지</p>
        </div>

        <div className={`bg-white rounded-3xl p-6 shadow-xl ${shake ? "animate-shake" : ""}`}>
          <label className="block text-gray-600 text-sm mb-2">비밀번호</label>
          <input
            type="password"
            value={pw}
            onChange={(e) => { setPw(e.target.value); setError(false); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="비밀번호를 입력하세요"
            className={`w-full px-4 py-3.5 border rounded-xl text-gray-700 placeholder:text-gray-300 focus:outline-none transition-colors mb-4 ${error ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:border-[#1E2A5E]"
              }`}
          />
          {error && (
            <div className="flex items-center gap-2 text-red-500 text-xs mb-4 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
              <AlertCircle size={13} />
              비밀번호가 올바르지 않습니다
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#1E2A5E] text-white text-sm hover:bg-[#162148] transition-colors disabled:opacity-60"
          >
            {loading ? "확인 중..." : "로그인"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   메인 어드민 페이지
────────────────────────────────────────── */
export function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<"rates" | "orders">("orders");

  if (!loggedIn) {
    return <LoginScreen onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      <header className="sticky top-0 z-20 bg-[#1E2A5E] px-4 h-14 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <img src={logoImg} alt="해달 상품권" className="h-9 object-contain" />
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab("rates")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${activeTab === "rates"
              ? "bg-white text-[#1E2A5E]"
              : "bg-white/15 text-white/80 hover:bg-white/25"
              }`}
          >
            <Percent size={12} />
            매입률 관리
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${activeTab === "orders"
              ? "bg-white text-[#1E2A5E]"
              : "bg-white/15 text-white/80 hover:bg-white/25"
              }`}
          >
            <FileText size={12} />
            주문 관리
          </button>
        </div>
      </header>

      <div className="pb-10">
        {activeTab === "rates" ? <RateManagement /> : <OrderManagement />}
      </div>
    </div>
  );
}