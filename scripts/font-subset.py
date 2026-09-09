"""
Pretendard 서브셋 — 사이트가 실제로 쓰는 글자만 담아 자체 호스팅한다.

    python3 scripts/font-subset.py        (fonttools, brotli 필요)

왜: CDN의 동적 서브셋은 26KB짜리 블록 단위로 내려온다. 페이지가 그 블록에서 몇 글자만
써도 블록 전체를 받는다. 그래서 한글 페이지 한 장에 13~16개 블록, 340~410KB가 붙는다.
소스에 실제로 쓰인 글자만 모으면 한 파일 170KB 남짓으로 끝난다.

안전장치: globals.css에 CDN @import를 먼저 두고 이 파일을 뒤에 선언한다. 겹치는 범위는
나중 선언이 이긴다 — 우리 글자는 로컬에서, 없는 글자(관리자가 새로 쓴 칼럼 등)는 CDN
블록에서 온다. 어느 쪽이든 같은 Pretendard라 글꼴은 바뀌지 않고, 최악이라도 용량만 는다.

콘텐츠를 많이 고친 뒤에는 다시 돌려서 새 글자를 담으면 된다.
"""
import glob
import os
import subprocess
import sys

SRC_GLOBS = ('app/**/*.tsx', 'app/**/*.ts', 'app/**/*.css', 'lib/**/*.ts')
FONT_URL = ('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9'
            '/packages/pretendard/dist/web/variable/woff2/PretendardVariable.woff2')
OUT = 'public/fonts/pretendard-subset.woff2'
CSS = 'app/globals.css'
MARK_A, MARK_B = '/* FONT-SUBSET:START */', '/* FONT-SUBSET:END */'

# 소스에 없더라도 늘 넣어두는 것 — 라틴, 라틴1, 호환 자모, 자주 쓰는 문장부호
BASE = set(range(0x20, 0x7F)) | set(range(0xA0, 0x100)) | set(range(0x3131, 0x3164)) | {
    0x2013, 0x2014, 0x2018, 0x2019, 0x201C, 0x201D, 0x2026, 0x2022, 0x00B7, 0x20A9,
    0x2192, 0x2190, 0x00D7, 0x00F7, 0x00B1, 0x2264, 0x2265, 0x2260, 0x203B, 0x00B0,
    0x00A9, 0x00AE, 0x2122, 0x301C, 0xFF5E, 0x3001, 0x3002,
}


def collect() -> set[int]:
    used = set()
    for pat in SRC_GLOBS:
        for f in glob.glob(pat, recursive=True):
            used |= set(open(f, encoding='utf-8').read())
    return BASE | {ord(c) for c in used if ord(c) > 0x1F}


def to_ranges(cps: list[int]) -> str:
    """이어지는 코드포인트를 U+AC00-AC03 꼴로 묶는다 — CSS가 짧아진다."""
    out, i = [], 0
    while i < len(cps):
        j = i
        while j + 1 < len(cps) and cps[j + 1] == cps[j] + 1:
            j += 1
        out.append(f'U+{cps[i]:04X}' if i == j else f'U+{cps[i]:04X}-{cps[j]:04X}')
        i = j + 1
    return ','.join(out)


def main() -> None:
    cps = sorted(collect())
    han = sum(1 for c in cps if 0xAC00 <= c <= 0xD7A3)
    print(f'글자 {len(cps)}자 (한글 음절 {han}자)')

    os.makedirs('public/fonts', exist_ok=True)
    src = '/tmp/PretendardVariable.woff2'
    if not os.path.exists(src):
        print('원본 내려받는 중…')
        subprocess.run(['curl', '-sfL', '-o', src, FONT_URL], check=True)

    uni = '/tmp/pretendard-unicodes.txt'
    open(uni, 'w').write('\n'.join(f'U+{c:04X}' for c in cps))
    subprocess.run([
        sys.executable, '-m', 'fontTools.subset', src,
        f'--unicodes-file={uni}', f'--output-file={OUT}', '--flavor=woff2',
        '--layout-features=*',      # 커닝 등 모든 기능 유지 — 렌더링이 달라지지 않게
        '--name-IDs=*', '--notdef-outline',
    ], check=True)

    face = (f"{MARK_A}\n@font-face{{font-family:'Pretendard Variable';font-style:normal;"
            f"font-weight:45 920;font-display:swap;\n"
            f"  src:url('/fonts/pretendard-subset.woff2') format('woff2');\n"
            f"  unicode-range:{to_ranges(cps)}}}\n{MARK_B}")
    css = open(CSS, encoding='utf-8').read()
    a, b = css.index(MARK_A), css.index(MARK_B) + len(MARK_B)
    open(CSS, 'w', encoding='utf-8').write(css[:a] + face + css[b:])
    print(f'{OUT}  {os.path.getsize(OUT) / 1024:.0f} KB')
    print(f'{CSS}  @font-face 갱신 완료')


if __name__ == '__main__':
    main()
