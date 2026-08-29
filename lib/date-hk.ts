/**
 * 香港時區(UTC+8,冇日光節約時間,寫死就夠)日期輔助函數。
 *
 * 原本 app/admin/reports/page.tsx 自己有個 local 嘅 hongKongTodayStart(),
 * 而家報表要加「本週/本月」範圍,先抽呢個共用檔案,唔好周圍複製貼上
 * 呢份時區邏輯。
 */

const HK_OFFSET_MS = 8 * 60 * 60 * 1000;

/** 而家嘅 HKT 時間(用 UTC Date 表示,淨係加咗 8 粒鐘) */
export function hkNow(): Date {
  return new Date(Date.now() + HK_OFFSET_MS);
}

/** 傳入時間所屬 HKT 日子嘅凌晨 0 點,返回真實 UTC 時間戳 */
export function hkStartOfDay(hkDate: Date = hkNow()): Date {
  const hkMidnightUtcMs =
    Date.UTC(hkDate.getUTCFullYear(), hkDate.getUTCMonth(), hkDate.getUTCDate()) - HK_OFFSET_MS;
  return new Date(hkMidnightUtcMs);
}

/** 傳入時間所屬 HKT 星期嘅星期一 0 點(香港/國際慣例一週由星期一開始) */
export function hkStartOfWeek(hkDate: Date = hkNow()): Date {
  const today = hkStartOfDay(hkDate);
  const hkDayOfWeek = new Date(today.getTime() + HK_OFFSET_MS).getUTCDay(); // 0=日, 1=一...6=六
  const daysSinceMonday = hkDayOfWeek === 0 ? 6 : hkDayOfWeek - 1;
  return new Date(today.getTime() - daysSinceMonday * 24 * 60 * 60 * 1000);
}

/** 傳入時間所屬 HKT 月份嘅 1 號 0 點 */
export function hkStartOfMonth(hkDate: Date = hkNow()): Date {
  const hkMonthStartUtcMs =
    Date.UTC(hkDate.getUTCFullYear(), hkDate.getUTCMonth(), 1) - HK_OFFSET_MS;
  return new Date(hkMonthStartUtcMs);
}

export type ReportRange = "today" | "week" | "month";

export const REPORT_RANGE_LABELS: Record<ReportRange, string> = {
  today: "今日",
  week: "本週",
  month: "本月",
};

/** 報表用範圍:[start, now] —— now 就係查詢當刻,唔使計 end of day */
export function getReportRangeBounds(range: ReportRange): { start: Date; end: Date } {
  const now = hkNow();
  const start =
    range === "today" ? hkStartOfDay(now) : range === "week" ? hkStartOfWeek(now) : hkStartOfMonth(now);
  return { start, end: new Date() };
}
