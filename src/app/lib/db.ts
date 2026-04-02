/**
 * db.ts
 * Supabase 기반 Database
 * mockDb.ts와 동일한 인터페이스를 유지합니다.
 */

import { supabase } from "./supabase";

/* ──────────────────────────────────────────
   타입 정의 (mockDb.ts와 동일)
────────────────────────────────────────── */
export type NormalStatus = "대기중" | "입금 완료" | "취소";
export type ReservationStatus =
  | "대기"
  | "선입금 완료"
  | "정상 완료"
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
   헬퍼
────────────────────────────────────────── */
const pad = (n: number) => String(n).padStart(2, "0");

function formatDate(date: Date): string {
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** DB snake_case → 프론트 camelCase 변환 */
function toNormalOrder(row: Record<string, unknown>): NormalOrder {
  return {
    id: row.id as string,
    createdAt: row.created_at as string,
    name: row.name as string,
    phone: row.phone as string,
    bank: row.bank as string,
    account: row.account as string,
    cardType: row.card_type as string,
    pins: row.pins as string[],
    status: row.status as NormalStatus,
  };
}

function toReservationOrder(row: Record<string, unknown>): ReservationOrder {
  return {
    id: row.id as string,
    createdAt: row.created_at as string,
    reservationDate: row.reservation_date as string,
    name: row.name as string,
    phone: row.phone as string,
    bank: row.bank as string,
    account: row.account as string,
    cardType: row.card_type as string,
    amount: row.amount as number,
    quantity: row.quantity as number,
    status: row.status as ReservationStatus,
  };
}

/* ──────────────────────────────────────────
   매입률 API
────────────────────────────────────────── */
export async function getRates(): Promise<Rate[]> {
  const { data, error } = await supabase.from("rates").select("*");
  if (error) throw error;
  return data as Rate[];
}

export async function updateRate(key: string, value: number): Promise<Rate[]> {
  const { error } = await supabase
    .from("rates")
    .update({ value })
    .eq("key", key);
  if (error) throw error;
  return getRates();
}

/* ──────────────────────────────────────────
   일반 주문 API
────────────────────────────────────────── */
export async function getNormalOrders(): Promise<NormalOrder[]> {
  const { data, error } = await supabase
    .from("normal_orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toNormalOrder);
}

export async function updateNormalOrderStatus(
  id: string,
  status: NormalStatus
): Promise<NormalOrder[]> {
  const { error } = await supabase
    .from("normal_orders")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
  return getNormalOrders();
}

export async function addNormalOrder(
  order: Omit<NormalOrder, "id" | "createdAt" | "status">
): Promise<NormalOrder> {
  const now = new Date();
  const year = now.getFullYear();
  const prefix = `N-${year}-`;
  const { data: latest } = await supabase
    .from("normal_orders")
    .select("id")
    .like("id", `${prefix}%`)
    .order("id", { ascending: false })
    .limit(1)
    .single();
  const lastNum = latest ? parseInt(latest.id.replace(prefix, ""), 10) : 0;
  const id = `${prefix}${String(lastNum + 1).padStart(4, "0")}`;
  const createdAt = formatDate(now);

  const row = {
    id,
    created_at: createdAt,
    name: order.name,
    phone: order.phone,
    bank: order.bank,
    account: order.account,
    card_type: order.cardType,
    pins: order.pins,
    status: "대기중" as NormalStatus,
  };

  const { data, error } = await supabase
    .from("normal_orders")
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return toNormalOrder(data);
}

/* ──────────────────────────────────────────
   예약 주문 API
────────────────────────────────────────── */
export async function getReservationOrders(): Promise<ReservationOrder[]> {
  const { data, error } = await supabase
    .from("reservation_orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toReservationOrder);
}

export async function updateReservationOrderStatus(
  id: string,
  status: ReservationStatus
): Promise<ReservationOrder[]> {
  const { error } = await supabase
    .from("reservation_orders")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
  return getReservationOrders();
}

/* ──────────────────────────────────────────
   주문 삭제 API
────────────────────────────────────────── */
export async function deleteNormalOrder(id: string): Promise<NormalOrder[]> {
  const { error } = await supabase
    .from("normal_orders")
    .delete()
    .eq("id", id);
  if (error) throw error;
  return getNormalOrders();
}

export async function deleteReservationOrder(id: string): Promise<ReservationOrder[]> {
  const { error } = await supabase
    .from("reservation_orders")
    .delete()
    .eq("id", id);
  if (error) throw error;
  return getReservationOrders();
}

/* ──────────────────────────────────────────
   주문 조회 (고객용)
────────────────────────────────────────── */
export async function getOrdersByUser(
  name: string,
  phone: string
): Promise<NormalOrder[]> {
  const { data, error } = await supabase
    .from("normal_orders")
    .select("*")
    .eq("name", name)
    .eq("phone", phone)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toNormalOrder);
}

export async function getReservationOrdersByUser(
  name: string,
  phone: string
): Promise<ReservationOrder[]> {
  const { data, error } = await supabase
    .from("reservation_orders")
    .select("*")
    .eq("name", name)
    .eq("phone", phone)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toReservationOrder);
}

export async function addReservationOrder(
  order: Omit<ReservationOrder, "id" | "createdAt" | "status">
): Promise<ReservationOrder> {
  const now = new Date();
  const year = now.getFullYear();
  const prefix = `R-${year}-`;
  const { data: latest } = await supabase
    .from("reservation_orders")
    .select("id")
    .like("id", `${prefix}%`)
    .order("id", { ascending: false })
    .limit(1)
    .single();
  const lastNum = latest ? parseInt(latest.id.replace(prefix, ""), 10) : 0;
  const id = `${prefix}${String(lastNum + 1).padStart(4, "0")}`;
  const createdAt = formatDate(now);

  const row = {
    id,
    created_at: createdAt,
    reservation_date: order.reservationDate,
    name: order.name,
    phone: order.phone,
    bank: order.bank,
    account: order.account,
    card_type: order.cardType,
    amount: order.amount,
    quantity: order.quantity,
    status: "대기" as ReservationStatus,
  };

  const { data, error } = await supabase
    .from("reservation_orders")
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return toReservationOrder(data);
}
