#!/usr/bin/env bash
# Cập nhật danava.com.vn trên cPanel lên bản mới nhất mà GitHub Actions đã build (nhánh `deploy`).
#
#   cd ~/danava.com.vn && bash deploy.sh
#
# Server KHÔNG build Next.js (glibc của hosting quá cũ). Quy trình: push lên `main`
# → GitHub Actions test + build → nhánh `deploy` → script này kéo về và khởi động lại.
# Giữ nguyên: biến môi trường cPanel, database MySQL, ảnh upload trong ~/danava-data.
#
# Tùy chọn:  WAIT=0 bash deploy.sh   (không chờ GitHub build xong bản mới nhất)
set -u

# git reset sẽ ghi đè chính file này khi đang chạy → chạy từ một bản sao tạm.
if [ -z "${DANAVA_DEPLOY_COPY:-}" ]; then
  tmp=$(mktemp) || exit 1
  cp "$0" "$tmp" && DANAVA_DEPLOY_COPY="$tmp" exec bash "$tmp" "$@"
  exit 1
fi
trap 'rm -f "$DANAVA_DEPLOY_COPY"' EXIT

APP_DIR="${APP_DIR:-$HOME/danava.com.vn}"
APP_ROOT="${APP_ROOT:-danava.com.vn}"
DOMAIN="${DOMAIN:-danava.com.vn}"
DATA="${DATA_DIR:-$HOME/danava-data}"
WAIT="${WAIT:-600}"

step() { printf '\n== %s ==\n' "$*"; }
fail() { printf 'LOI: %s\n' "$*"; exit 1; }

cd "$APP_DIR" || fail "khong vao duoc $APP_DIR"
[ -d .git ] || fail "$APP_DIR chua phai git repo."

step "1/5 Ban build tren GitHub"
main_sha=$(git ls-remote origin refs/heads/main | cut -c1-40)
[ -n "$main_sha" ] || fail "khong doc duoc nhanh main tren GitHub (kiem tra mang)."
echo "main moi nhat: ${main_sha:0:7}"
waited=0
while :; do
  git fetch -q origin deploy || fail "git fetch that bai."
  built=$(git show origin/deploy:BUILD.txt 2>/dev/null | grep -o '[0-9a-f]\{40\}' | head -1)
  [ "$built" = "$main_sha" ] && { echo "OK: ban build khop main (${built:0:7})"; break; }
  if [ "$waited" -ge "$WAIT" ]; then
    echo "CANH BAO: GitHub chua co ban build cua ${main_sha:0:7} (dang co: ${built:0:7})."
    echo "  -> Xem tab Actions tren GitHub: build co the dang chay hoac bi loi."
    echo "  -> Tiep tuc trien khai ban dang co: ${built:0:7}"
    break
  fi
  printf 'GitHub dang build %s... (da cho %ss / toi da %ss)\n' "${main_sha:0:7}" "$waited" "$WAIT"
  sleep 20; waited=$((waited + 20))
done

step "2/5 Cap nhat code"
before=$(git rev-parse --short HEAD 2>/dev/null || echo none)
git reset -q --hard origin/deploy || fail "git reset that bai."
echo "Truoc: $before  ->  Sau: $(git rev-parse --short HEAD)"
cat BUILD.txt

step "3/5 Thu muc du lieu"
mkdir -p "$DATA" tmp && chmod 700 "$DATA"
echo "$DATA"

step "4/5 Khoi dong lai app"
if command -v cloudlinux-selector >/dev/null 2>&1 \
  && cloudlinux-selector restart --json --interpreter=nodejs --app-root="$APP_ROOT" | grep -q '"success"'; then
  echo "OK: da khoi dong lai qua cloudlinux-selector"
else
  touch tmp/restart.txt && echo "OK: da yeu cau Passenger khoi dong lai (tmp/restart.txt)"
fi

step "5/5 Kiem tra qua ten mien that"
# Lần gọi đầu đánh thức app (Passenger khởi động khi có request).
ok=1
for path in / /kien-thuc/ /lien-he/; do
  code=$(curl -s -o /dev/null -m 60 -w '%{http_code}' "https://$DOMAIN$path")
  printf '%-14s %s\n' "$path" "$code"
  [ "$code" = 200 ] || ok=0
done
if [ "$ok" = 1 ]; then
  printf '\nXONG: https://%s  |  quan tri: https://%s/admin/\n' "$DOMAIN" "$DOMAIN"
else
  echo
  echo "CO TRANG LOI. 30 dong log cuoi:"
  tail -n 30 "$APP_DIR/stderr.log" 2>/dev/null || echo "(chua co stderr.log)"
  echo
  echo "Quay lai ban truoc:  cd $APP_DIR && git reset --hard $before && touch tmp/restart.txt"
  exit 1
fi
