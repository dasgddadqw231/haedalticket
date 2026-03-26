/**
 * mockDb.ts
 * localStorage 기반 Mock Database
 * 실제 Supabase/API로 교체 시 이 파일의 함수 구현부만 바꾸면 됩니다.
 */

/* ──────────────────────────────────────────
   타입 정의
────────────────────────────────────────── */
export type NormalStatus = "대기중" | "입금 완료" | "취소";
export type ReservationStatus =
  | "대기"
  | "선입금 완료"
  | "정상 완료"
  | "연체/미납"
  | "취소";

export interface Rate {
  key: string;
  label: string;
  value: number;
  color: string;
}

export interface NormalOrder {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  bank: string;
  account: string;
  cardType: string;
  pins: string[];
  status: NormalStatus;
}

export interface ReservationOrder {
  id: string;
  createdAt: string;
  reservationDate: string;
  name: string;
  phone: string;
  bank: string;
  account: string;
  cardType: string;
  amount: number;
  quantity: number;
  status: ReservationStatus;
}

/* ──────────────────────────────────────────
   시드 데이터
────────────────────────────────────────── */
const SEED_RATES: Rate[] = [
  { key: "culture", label: "컬쳐랜드", value: 90, color: "#F59E0B" },
  { key: "starbucks", label: "스타벅스", value: 90, color: "#10B981" },
  { key: "lotte", label: "롯데", value: 92, color: "#EF4444" },
];

const SEED_NORMAL_ORDERS: NormalOrder[] = [];

const SEED_RESERVATION_ORDERS: ReservationOrder[] = [];

/* ──────────────────────────────────────────
   localStorage 헬퍼
────────────────────────────────────────── */
const KEYS = {
  rates: "mockdb_rates",
  normalOrders: "mockdb_normal_orders",
  reservationOrders: "mockdb_reservation_orders",
} as const;

function load<T>(key: string, seed: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : seed;
  } catch {
    return seed;
  }
}

function save<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

/** 네트워크 지연 시뮬레이션 (실제 API 교체 시 제거) */
const delay = (ms = 300) => new Promise<void>((r) => setTimeout(r, ms));

/* ──────────────────────────────────────────
   매입률 API
────────────────────────────────────────── */
export async function getRates(): Promise<Rate[]> {
  await delay();
  return load<Rate[]>(KEYS.rates, SEED_RATES);
}

export async function updateRate(key: string, value: number): Promise<Rate[]> {
  await delay(200);
  const rates = load<Rate[]>(KEYS.rates, SEED_RATES).map((r) =>
    r.key === key ? { ...r, value } : r
  );
  save(KEYS.rates, rates);
  return rates;
}

/* ──────────────────────────────────────────
   일반 주문 API
────────────────────────────────────────── */
export async function getNormalOrders(): Promise<NormalOrder[]> {
  await delay();
  return load<NormalOrder[]>(KEYS.normalOrders, SEED_NORMAL_ORDERS);
}

export async function updateNormalOrderStatus(
  id: string,
  status: NormalStatus
): Promise<NormalOrder[]> {
  await delay(200);
  const orders = load<NormalOrder[]>(KEYS.normalOrders, SEED_NORMAL_ORDERS).map(
    (o) => (o.id === id ? { ...o, status } : o)
  );
  save(KEYS.normalOrders, orders);
  return orders;
}

export async function addNormalOrder(
  order: Omit<NormalOrder, "id" | "createdAt" | "status">
): Promise<NormalOrder> {
  await delay(200);
  const orders = load<NormalOrder[]>(KEYS.normalOrders, SEED_NORMAL_ORDERS);
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const createdAt = `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const id = `N-${now.getFullYear()}-${String(orders.length + 1).padStart(4, "0")}`;
  const newOrder: NormalOrder = { id, createdAt, status: "대기중", ...order };
  save(KEYS.normalOrders, [newOrder, ...orders]);
  return newOrder;
}

/* ──────────────────────────────────────────
   예약 주문 API
────────────────────────────────────────── */
export async function getReservationOrders(): Promise<ReservationOrder[]> {
  await delay();
  return load<ReservationOrder[]>(KEYS.reservationOrders, SEED_RESERVATION_ORDERS);
}

export async function updateReservationOrderStatus(
  id: string,
  status: ReservationStatus
): Promise<ReservationOrder[]> {
  await delay(200);
  const orders = load<ReservationOrder[]>(
    KEYS.reservationOrders,
    SEED_RESERVATION_ORDERS
  ).map((o) => (o.id === id ? { ...o, status } : o));
  save(KEYS.reservationOrders, orders);
  return orders;
}

export async function addReservationOrder(
  order: Omit<ReservationOrder, "id" | "createdAt" | "status">
): Promise<ReservationOrder> {
  await delay(200);
  const orders = load<ReservationOrder[]>(KEYS.reservationOrders, SEED_RESERVATION_ORDERS);
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const createdAt = `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const id = `R-${now.getFullYear()}-${String(orders.length + 1).padStart(4, "0")}`;
  const newOrder: ReservationOrder = { id, createdAt, status: "대기", ...order };
  save(KEYS.reservationOrders, [newOrder, ...orders]);
  return newOrder;
}

/** 개발용: localStorage 초기화 */
export function resetDb(): void {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}