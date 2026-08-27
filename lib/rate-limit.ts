/**
 * 極簡「in-memory sliding window」rate limiter。
 *
 * 冇用 Redis / 外部服務 —— 呢個 app 係 single-region 細規模應用,用嚟擋
 * 「一個 tab loop 狂 call server action」呢種低成本 abuse 已經夠。
 *
 * 限制(要知㗎):狀態淨係存喺呢個 serverless instance 嘅記憶體度,唔同
 * instance/冷啟動之間唔會共享,所以實際上限係「per-instance」而唔係
 * 「per-key 全局精準」——對於呢個 app 嘅規模嚟講係可以接受嘅 trade-off。
 * 如果第時要跨 instance 精準限流,先至值得換做 Upstash/Redis 呢類方案。
 */

type RateLimitOptions = {
  /** 呢個 window 入面最多准幾多次 request */
  maxRequests: number;
  /** sliding window 長度(毫秒) */
  windowMs: number;
};

// key -> 呢個 key 喺目前 window 入面嘅 request timestamps(毫秒)
const hits = new Map<string, number[]>();

// 避免 Map 隨時間無限脹大:每隔一段時間清一次已經完全過期嘅 key
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 分鐘掃一次
let lastCleanupAt = 0;

function cleanupExpiredKeys(now: number, windowMs: number) {
  for (const [key, timestamps] of hits) {
    const stillValid = timestamps.filter((t) => now - t < windowMs);
    if (stillValid.length === 0) {
      hits.delete(key);
    } else {
      hits.set(key, stillValid);
    }
  }
  lastCleanupAt = now;
}

/**
 * 檢查某個 key(例如客人 IP 或 guest_token)喺 sliding window 入面
 * 有冇超過 request 上限。
 *
 * 回傳 true = 准入,false = 超咗限,要擋。
 */
export function checkRateLimit(key: string, opts: RateLimitOptions): boolean {
  const { maxRequests, windowMs } = opts;
  const now = Date.now();

  if (now - lastCleanupAt > CLEANUP_INTERVAL_MS) {
    cleanupExpiredKeys(now, windowMs);
  }

  const timestamps = hits.get(key) ?? [];
  const withinWindow = timestamps.filter((t) => now - t < windowMs);

  if (withinWindow.length >= maxRequests) {
    hits.set(key, withinWindow);
    return false;
  }

  withinWindow.push(now);
  hits.set(key, withinWindow);
  return true;
}
