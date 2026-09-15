#!/usr/bin/env bash
#
# Deploy เว็บไซต์ชุมชนบ้านต้นโพธิ์ขึ้น HostAtom Cloud VPS
#
#   DEPLOY_HOST=root@1.2.3.4 ./scripts/deploy.sh
#
# build ที่เครื่องตัวเองแล้วส่งไฟล์ขึ้นไป ไม่ build บนเซิร์ฟเวอร์
# เพราะ VPS แผนเริ่มต้นมี RAM 2GB ซึ่ง next build อาจกินจนเว็บที่รันอยู่ล่มไปด้วย

set -euo pipefail

DEPLOY_HOST="${DEPLOY_HOST:?ต้องตั้ง DEPLOY_HOST เช่น DEPLOY_HOST=root@1.2.3.4}"
REMOTE_DIR="${REMOTE_DIR:-/srv/bantonpoo/current}"
SERVICE="${SERVICE:-bantonpoo}"
SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://bantonpoo.phuwish.com}"
# ค่าเริ่มต้นคือกันไม่ให้ Google เก็บดัชนี ต้องตั้ง SITE_NOINDEX=0 เองเมื่อจะเปิดเว็บจริง
NOINDEX="${SITE_NOINDEX:-1}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

cd "$ROOT"

echo "▸ ตรวจโค้ดก่อน"
npx tsc --noEmit
npx eslint .

# หน้าสินค้าและบทความถูกสร้างเป็นไฟล์สแตติกตอน build โดยอ่านจากฐานข้อมูล
# จึงต้อง build โดยต่อกับฐานข้อมูล "ของเซิร์ฟเวอร์" ไม่ใช่ของเครื่องเรา
# ไม่งั้นเว็บที่ขึ้นไปจะมีเนื้อหาชุดที่อยู่ในเครื่องพัฒนา
echo "▸ เปิดอุโมงค์ SSH ไปยังฐานข้อมูลของเซิร์ฟเวอร์"
TUNNEL_PORT=${TUNNEL_PORT:-15432}
ssh -f -N -L "${TUNNEL_PORT}:127.0.0.1:5432" "$DEPLOY_HOST"
TUNNEL_PID=$(pgrep -f "ssh -f -N -L ${TUNNEL_PORT}:127.0.0.1:5432" | head -1)
trap 'rm -rf "$STAGE"; [ -n "${TUNNEL_PID:-}" ] && kill "$TUNNEL_PID" 2>/dev/null' EXIT
sleep 2

BUILD_DATABASE_URI="${BUILD_DATABASE_URI:-postgres://bantonpoo:${DB_PASSWORD:?ต้องตั้ง DB_PASSWORD ของฐานข้อมูลบนเซิร์ฟเวอร์}@127.0.0.1:${TUNNEL_PORT}/bantonpoo}"

echo "▸ build (SITE_URL=$SITE_URL, SITE_NOINDEX=$NOINDEX)"
# แท็ก <meta name="robots"> ถูกสร้างตอน build จึงต้องส่งค่าเข้ามาตรงนี้ด้วย
# ไม่ใช่ตั้งแค่บนเซิร์ฟเวอร์
NEXT_PUBLIC_SITE_URL="$SITE_URL" \
  SITE_NOINDEX="$NOINDEX" \
  DATABASE_URI="$BUILD_DATABASE_URI" \
  PAYLOAD_SECRET="${PAYLOAD_SECRET:-build-time-placeholder-secret-0123456789abcdef}" \
  npx next build

echo "▸ รวมไฟล์ที่ต้องอัปโหลด"
# standalone ไม่ได้รวม .next/static กับ public มาให้ ต้องคัดลอกเอง
cp -r .next/standalone/. "$STAGE/"
mkdir -p "$STAGE/.next"
cp -r .next/static "$STAGE/.next/static"
cp -r public "$STAGE/public"
echo "  ขนาดรวม $(du -sh "$STAGE" | cut -f1)"

echo "▸ ส่งขึ้น $DEPLOY_HOST:$REMOTE_DIR"
# --delete ลบไฟล์เก่าที่ไม่มีแล้วออก แต่ต้องไม่แตะโฟลเดอร์รูปที่อัปโหลดผ่าน CMS
rsync -az --delete \
  --exclude 'uploads' \
  --exclude '.env*' \
  "$STAGE/" "$DEPLOY_HOST:$REMOTE_DIR/"

echo "▸ รีสตาร์ตบริการ"
ssh "$DEPLOY_HOST" "chown -R bantonpoo:bantonpoo $REMOTE_DIR && systemctl restart $SERVICE"

echo "▸ ตรวจว่าเว็บตอบกลับ"
sleep 4
CODE="$(ssh "$DEPLOY_HOST" "curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/")"
if [ "$CODE" != "200" ]; then
  echo "✗ เว็บตอบ HTTP $CODE — ดู log ด้วย: ssh $DEPLOY_HOST journalctl -u $SERVICE -n 50"
  exit 1
fi

echo "✓ deploy สำเร็จ — $SITE_URL"
[ "$NOINDEX" = "1" ] && echo "  (โหมดทดสอบ: กันไม่ให้ Google เก็บดัชนีอยู่)"
