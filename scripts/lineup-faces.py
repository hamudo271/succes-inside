"""
교육과정 히어로의 '먼저 가본 사람들' 줄 — 누끼를 같은 규격으로 굽는다.

    python3 scripts/lineup-faces.py          (Pillow 필요)

왜 필요한가: 누끼 원본은 크롭 범위가 제각각이다. 어떤 사진은 머리 폭의 2배까지만,
어떤 사진은 3.8배까지 몸이 들어 있다. 그래서 '이미지 높이'를 맞추면 얼굴 크기가 달라져
한 줄로 세웠을 때 어색해진다.

그래서 (1) 실루엣에서 머리 폭을 재고 (2) 머리 폭이 같아지도록 각자 배율을 잡고
(3) 정수리를 프레임 맨 위에 붙인 뒤 (4) 가장 짧은 사람 기준으로 모두 같은 높이로 자른다.
결과: 머리 크기·프레이밍이 모두 같아 CSS에서는 높이 하나만 주면 된다.

사람을 바꾸려면 PICKS만 고치면 된다. 단, 머리 폭 대비 세로가 2.4배 이상인 누끼여야
어깨 아래까지 남는다(비율은 실행할 때 출력된다).
"""
import os
import numpy as np
from PIL import Image

SRC = '프로필 이미지 생성'
OUT = 'public/faces'
CANVAS_H = 460          # 2배 해상도 — 화면에는 230px로 놓는다
HEAD_PAD = 0.0          # 정수리 위 여백 비율(필요하면 키운다)

# (원본 파일명, 내보낼 이름, 보정) — 정장 / 뷰티 / 요식 / 정비, 실루엣이 서로 다르게
#
# 보정: 실루엣 폭은 머리숱과 모자에 흔들린다(단발머리는 넓게, 각진 얼굴은 좁게 재진다).
# 그래서 자동 측정 뒤 눈으로 보고 얼굴 크기가 같아지도록 미세 조정한다. 1.0이 기본.
PICKS = [
    # 회계사는 아래 '사업계획서 완성 워크숍' 카드에도 쓰여 한 페이지에 두 번 나왔다 — 교체.
    ('달려라휘트니스', 'line-fitness', 1.00),
    ('미용학원',    'line-salon',    1.03),
    # 양미희 — 조회수 3위 인터뷰(aGcBkc2lg3A, 10.5만)의 주인공. 가운데(메인) 자리.
    # 원래 이 자리에 있던 로바다가쿠(스시집)는 아래 과정 카드에도 쓰여 한 페이지에 두 번 나왔다.
    ('ChatGPT Image 2026년 9월 3일 오후 03_35_48', 'line-yangmihee', 1.12),
    ('정비소',      'line-mechanic', 0.92),
]


def head_width(alpha: np.ndarray) -> int:
    """정수리부터 목까지 중 가장 넓은 폭. 어깨가 벌어지기 전(위 36%)까지만 본다."""
    h = alpha.shape[0]
    widths = []
    for y in range(0, int(h * 0.36)):
        xs = np.where(alpha[y])[0]
        widths.append(0 if len(xs) == 0 else xs.max() - xs.min() + 1)
    return max(widths)


def load(name: str):
    im = Image.open(os.path.join(SRC, f'{name}.png')).convert('RGBA')
    im = im.crop(im.getchannel('A').getbbox())       # 투명 여백 제거 → 맨 위가 정수리
    return im, head_width(np.array(im.getchannel('A')) > 128)


def main():
    loaded = [(out, *load(src), src, adj) for src, out, adj in PICKS]

    # 머리 폭을 얼마로 맞출 수 있는가 — 가장 '짧게 잘린' 사람이 상한을 정한다
    head_target = CANVAS_H / min(im.height * adj / hw for _, im, hw, _, adj in loaded)
    print(f'맞출 머리 폭: {head_target:.0f}px  (캔버스 {CANVAS_H}px)')

    for out, im, hw, src, adj in loaded:
        scale = head_target * adj / hw
        w, h = round(im.width * scale), round(im.height * scale)
        big = im.resize((w, h), Image.LANCZOS)

        canvas = Image.new('RGBA', (w, CANVAS_H), (0, 0, 0, 0))
        canvas.alpha_composite(big, (0, round(CANVAS_H * HEAD_PAD)))   # 정수리를 맨 위에
        canvas = canvas.crop(canvas.getchannel('A').getbbox()[0::2] and
                             (canvas.getchannel('A').getbbox()[0], 0,
                              canvas.getchannel('A').getbbox()[2], CANVAS_H))  # 좌우만 트림

        p = f'{OUT}/{out}.webp'
        canvas.save(p, 'WEBP', quality=84, method=6, alpha_quality=90)
        print(f'  {out:14} {str(canvas.size):10} 머리 {hw:3}→{round(hw*scale):3}  '
              f'보정 {adj:.2f}  {os.path.getsize(p)/1024:5.1f} KB  ← {src}')


if __name__ == '__main__':
    main()
