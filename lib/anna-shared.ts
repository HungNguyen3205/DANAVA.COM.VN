/* Phần dùng chung giữa trình duyệt và máy chủ của ANNA (không import gì phía server vào đây). */

export const ANNA_LIMITS = { message: 1000, answer: 8000, turns: 8 };

export type AnnaErrorCode = 'unavailable' | 'busy' | 'limit' | 'failed';

/** Mỗi dòng trong phản hồi stream (NDJSON). */
export type AnnaEvent =
  | { type: 'delta'; text: string }
  /** Thay toàn bộ phần đã hiện (câu trả lời bị chặn hoặc bị từ chối) */
  | { type: 'replace'; text: string }
  | { type: 'done'; sig?: string }
  | { type: 'error'; code: AnnaErrorCode };
