'use client';
import type { ReactNode } from 'react';

/** 되돌릴 수 없는 삭제는 한 번 더 묻는다. 서버 컴포넌트 폼 안에서 쓰는 작은 클라이언트 버튼. */
export default function ConfirmSubmit({
  message, className, title, children,
}: { message: string; className?: string; title?: string; children: ReactNode }) {
  return (
    <button type="submit" className={className} title={title}
            onClick={e => { if (!window.confirm(message)) e.preventDefault(); }}>
      {children}
    </button>
  );
}
