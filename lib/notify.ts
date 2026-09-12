import 'server-only';

/**
 * 신청이 들어오면 메일로 알린다 — 유튜브 문의가 오는 그 메일함(success.inside.kr@gmail.com)으로.
 * 사이트 관리자와 Gmail, 두 군데를 보지 않아도 되게.
 *
 * Resend의 REST API를 fetch로 직접 부른다(SDK 없음). RESEND_API_KEY가 없으면 조용히 건너뛴다 —
 * 메일이 안 가도 신청은 DB에 남으니, 알림 실패가 접수 실패가 되어서는 안 된다.
 *
 * NOTIFY_FROM은 도메인 인증 전에는 onboarding@resend.dev만 쓸 수 있고,
 * 그때는 Resend 계정 메일로만 보낼 수 있다. successinside.kr을 인증하면 apply@successinside.kr 같은 주소로 바꾼다.
 */
const TO = process.env.NOTIFY_TO || 'success.inside.kr@gmail.com';
const FROM = process.env.NOTIFY_FROM || '성공인사이드 <onboarding@resend.dev>';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ApplicationMail = {
  type: string; name: string; business: string; contact: string; message: string;
};

export async function notifyApplication(a: ApplicationMail): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;

  const subject = `[${a.type}] ${a.name}${a.business ? ` — ${a.business}` : ''}`;
  const text = [
    `유형: ${a.type}`,
    `성함: ${a.name}`,
    a.business ? `사업체: ${a.business}` : null,
    `연락처: ${a.contact}`,
    '',
    a.message,
    '',
    '—',
    '성공인사이드 홈페이지 신청 양식에서 왔습니다.',
    '관리자에서 보기: https://successinside.kr/admin',
  ].filter(l => l !== null).join('\n');

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM, to: [TO], subject, text,
        // 연락처가 이메일이면 답장이 바로 신청자에게 간다
        ...(EMAIL_RE.test(a.contact) ? { reply_to: a.contact } : {}),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error('[notify] resend 응답', res.status, await res.text());
  } catch (err) {
    console.error('[notify] 메일 실패:', (err as Error).message);
  }
}
