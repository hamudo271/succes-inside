#!/usr/bin/env bash
# 홈 히어로 배경 루프 — 인터뷰 본편에서 현장 컷 5개를 5초씩 잘라 1초 페이드로 잇고,
# 마지막 컷이 첫 컷으로 다시 페이드되게 만들어 끊김 없이 돈다. 결과: public/hero.mp4, public/hero.webm
#
#   SRC=/path/to/sources ./scripts/hero-video.sh
#
# SRC 안에 <유튜브ID>.mp4 — 아래 CLIPS의 구간만 잘라 받은 1080p 파일이 있어야 한다. 받는 법:
#   yt-dlp -f "299/303/298/302" --download-sections "*08:21-08:30" -o "%(id)s.%(ext)s" "https://www.youtube.com/watch?v=<ID>"
#   유튜브가 PO 토큰 없는 요청을 URL당 20MB에서 끊으므로 bgutil-ytdlp-pot-provider(+node 서버)를 붙여야 받아진다.
#   (pip install yt-dlp bgutil-ytdlp-pot-provider / git clone Brainicism/bgutil-ytdlp-pot-provider → server: npm ci && npx tsc && node build/main.js)
#
# 컷은 아래 CLIPS 에서 고른다. 자막 띠(아래)와 워터마크·광고(위)는 crop 으로 잘라낸다.
set -euo pipefail
cd "$(dirname "$0")/.."
SRC="${SRC:?SRC 디렉터리를 지정하세요}"
OUT=public
TMP="$(mktemp -d)"

# id  받은구간  파일안오프셋(초)  위쪽crop비율 — 5초씩. 순서: 정비 베이 → 바버샵 커트 → 스시 카운터 → 헬스장 기구 → 정비사 손
# 위쪽 crop 은 컷별로 줄 수 있다. 채널 워터마크(깃발+성공인사이드)가 5~20% 자리에, 자막이 79%부터 찍혀 있어 기본은 22%.
CLIPS=(
  "i66hU39qSV4 08:21-08:30 4.0 0.22"   # H모터스 — 리프트 늘어선 정비 베이
  "qfUTitMnmpw 10:04-10:13 4.0 0.22"   # 바버샵 — 청록 벽, 뒤에서 본 커트
  "p5kbu3ZT7SE 07:17-07:26 2.0 0.22"   # 스시집 — 얼음 카운터에서 손질하는 와이드
  "I-0GfsdV31g 24:35-24:44 3.5 0.22"   # 헬스장 — 기구 사이를 훑는 팬
  "KwIeEEfWSGs 09:06-09:15 1.5 0.22"   # 정비사 — 작업대 위 손 클로즈업
)
DUR=5; FADE=1; FPS=24; W=1600
CROP_H=${CROP_H:-0.56}   # 위쪽 crop 아래로 56%만 남긴다 (22%+56%=78%, 자막 위에서 끝난다). 1600×504

# 1) 컷마다 같은 규격의 중간 파일 — 크롭·축소·색보정(채도 -35%, 대비 +5%, 살짝 어둡게)과 약한 노이즈 제거를 여기서 굽는다
#    (어두운 현장 컷의 그레인이 용량을 먹는다 — hqdn3d 로 살짝 걷어내면 절반 가까이 준다)
i=0; INPUTS=(); FILTER=""
for c in "${CLIPS[@]}"; do
  read -r id _range start top <<<"$c"
  f="$SRC/$id.mp4"; [ -f "$f" ] || f="$SRC/$id.webm"
  ffmpeg -loglevel error -y -ss "$start" -t "$DUR" -i "$f" \
    -vf "fps=$FPS,crop=iw:ih*$CROP_H:0:ih*$top,scale=$W:-2,hue=s=0.65,eq=contrast=1.05:brightness=-0.03,hqdn3d=2:1.5:4:4,setsar=1,format=yuv420p" \
    -c:v libx264 -preset fast -crf 14 -an "$TMP/c$i.mp4"
  i=$((i+1))
done
cp "$TMP/c0.mp4" "$TMP/c$i.mp4"          # 첫 컷을 끝에 한 번 더 — 루프 이음새용
N=$((i+1))

# 2) xfade 체인. 컷 k 는 k*(DUR-FADE) 초에 시작한다. 마지막 컷(=첫 컷)이 FADE 초 지난 지점에서 자르면
#    첫 프레임과 끝 프레임이 같은 그림이라 loop 가 이어진다.
for ((k=0;k<N;k++)); do INPUTS+=(-i "$TMP/c$k.mp4"); FILTER+="[$k:v]settb=AVTB,setpts=PTS-STARTPTS[v$k];"; done
prev="v0"
for ((k=1;k<N;k++)); do
  off=$(( k*(DUR-FADE) ))
  FILTER+="[$prev][v$k]xfade=transition=fade:duration=$FADE:offset=$off[x$k];"; prev="x$k"
done
end=$(( (N-1)*(DUR-FADE) + FADE ))
FILTER+="[$prev]trim=start=$FADE:end=$end,setpts=PTS-STARTPTS[out]"
ffmpeg -loglevel error -y "${INPUTS[@]}" -filter_complex "$FILTER" -map "[out]" \
  -c:v libx264 -preset fast -crf 12 -an "$TMP/master.mp4"

# 3) 배포용 두 벌. 키프레임 2초 간격, 오디오 없음, faststart.
ffmpeg -loglevel error -y -i "$TMP/master.mp4" -c:v libx264 -preset slow -crf "${CRF_MP4:-32}" -profile:v high -level 4.0 \
  -pix_fmt yuv420p -g $((FPS*2)) -keyint_min $((FPS*2)) -sc_threshold 0 -movflags +faststart -an "$OUT/hero.mp4"
ffmpeg -loglevel error -y -i "$TMP/master.mp4" -c:v libvpx-vp9 -crf "${CRF_WEBM:-46}" -b:v 0 -deadline good -cpu-used 1 -row-mt 1 \
  -g $((FPS*2)) -pix_fmt yuv420p -an "$OUT/hero.webm"

[ -n "${MASTER:-}" ] && cp "$TMP/master.mp4" "$MASTER"   # CRF 실험용으로 마스터를 남기고 싶을 때
echo "루프 길이 $((end-FADE))초"; ls -la "$OUT/hero.mp4" "$OUT/hero.webm"
rm -rf "$TMP"
