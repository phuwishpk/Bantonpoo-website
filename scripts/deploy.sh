#!/usr/bin/env bash
#
# Deploy เว็บไซต์ชุมชนบ้านต้นโพธิ์ขึ้นเซิร์ฟเวอร์
#
#   DEPLOY_HOST=root@1.2.3.4 REMOTE_DIR=/var/www/vhosts/.../bantonpoo.phuwish.com ./scripts/deploy.sh
#
# build ที่เครื่องตัวเองแล้วส่งเฉพาะผลลัพธ์ขึ้นไป (~68MB)
# ไม่ต้องมีซอร์สหรือ node_modules บนเซิร์ฟเวอร์เลย และไม่กิน RAM ของเครื่องจริงตอน build
#
# รองรับสองแบบ ตั้งด้วย RESTART_MODE
#   passenger (ค่าเริ่มต้น) — Plesk/Phusion Passenger รีสตาร์ตเมื่อไฟล์ tmp/restart.txt เปลี่ยน
#   systemd                — VPS เปล่าที่ตั้ง service เอง

set -euo pipefail

DEPLOY_HOST="${DEPLOY_HOST:?ต้องตั้ง DEPLOY_HOST เช่น DEPLOY_HOST=root@1.2.3.4}"
REMOTE_DIR="${REMOTE_DIR:?ต้องตั้ง REMOTE_DIR เป็น Application Root บนเซิร์ฟเวอร์}"
RESTART_MODE="${RESTART_MODE:-passenger}"
SERVICE="${SERVICE:-bantonpoo}"
SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://bantonpoo.phuwish.com}"
# Passenger สุ่มพอร์ตเอง จึงตรวจผ่านโดเมนจริง ไม่ใช่ 127.0.0.1:3000
HEALTH_URL="${HEALTH_URL:-$SITE_URL}"
# ค่าเริ่มต้นคือกันไม่ให้ Google เก็บดัชนี ต้องตั้ง SITE_NOINDEX=0 เองเมื่อจะเปิดเว็บจริง
NOINDEX="${SITE_NOINDEX:-1}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

cd "$ROOT"

echo "▸ ตรวจโค้ดก่อน"
npx tsc --noEmit
npx eslint .

# ลืมสร้าง migration หลังแก้ฟิลด์เป็นสาเหตุที่ deploy ล้มบ่อยที่สุด
# ตรวจตั้งแต่ต้นดีกว่าไปพังตอนฐานข้อมูลของจริงถูกแตะไปแล้ว
if [ ! -d "$ROOT/src/migrations" ] || [ -z "$(ls -A "$ROOT/src/migrations"/*.ts 2>/dev/null)" ]; then
  echo "✗ ไม่พบไฟล์ migration — รัน 'npm run migrate:create <ชื่อ>' ก่อน"
  exit 1
fi

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

# ต้องปรับโครงฐานข้อมูลก่อน build เสมอ เพราะ build อ่านเนื้อหาจากฐานข้อมูลตัวนี้
# ถ้าสคีมายังเป็นของเก่า build จะล้มตอนอ่านฟิลด์ที่เพิ่งเพิ่มเข้ามา
#
# รันจากเครื่องเราผ่านอุโมงค์ ไม่ใช่บนเซิร์ฟเวอร์ เพราะสิ่งที่อัปโหลดขึ้นไปเป็น
# บิลด์แบบ standalone ซึ่งไม่มีทั้งคำสั่ง payload และไฟล์ migration ติดไปด้วย
echo "▸ ปรับโครงฐานข้อมูลของเซิร์ฟเวอร์ (migrate)"
DATABASE_URI="$BUILD_DATABASE_URI" \
  PAYLOAD_SECRET="${PAYLOAD_SECRET:-build-time-placeholder-secret-0123456789abcdef}" \
  NODE_ENV=production \
  npx payload migrate

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

echo "▸ รีสตาร์ตแอป ($RESTART_MODE)"
if [ "$RESTART_MODE" = "passenger" ]; then
  # Passenger อ่านเวลาแก้ไขของไฟล์นี้ แตะแล้วจะรีสตาร์ตแอปในคำขอถัดไป
  # ต้องคืนเจ้าของไฟล์ให้ผู้ใช้ของโดเมน ไม่งั้นแอปอ่านไฟล์ที่เพิ่งอัปโหลดไม่ได้
  ssh "$DEPLOY_HOST" "
    set -e
    OWNER=\$(stat -c '%U:%G' '$REMOTE_DIR')
    chown -R \"\$OWNER\" '$REMOTE_DIR'
    mkdir -p '$REMOTE_DIR/tmp'
    touch '$REMOTE_DIR/tmp/restart.txt'
    chown \"\$OWNER\" '$REMOTE_DIR/tmp' '$REMOTE_DIR/tmp/restart.txt'
  "
else
  ssh "$DEPLOY_HOST" "chown -R bantonpoo:bantonpoo '$REMOTE_DIR' && systemctl restart $SERVICE"
fi

echo "▸ ตรวจว่าเว็บตอบกลับ ($HEALTH_URL)"
sleep 6
CODE="$(curl -s -o /dev/null -w '%{http_code}' -L "$HEALTH_URL" || echo 000)"
if [ "$CODE" != "200" ]; then
  echo "✗ เว็บตอบ HTTP $CODE"
  if [ "$RESTART_MODE" = "passenger" ]; then
    echo "  ดู log: ssh $DEPLOY_HOST tail -n 50 $REMOTE_DIR/../logs/error_log"
    echo "  หรือกดปุ่ม Restart App ในหน้า Node.js ของ Plesk"
  else
    echo "  ดู log: ssh $DEPLOY_HOST journalctl -u $SERVICE -n 50"
  fi
  exit 1
fi

echo "✓ deploy สำเร็จ — $SITE_URL"
[ "$NOINDEX" = "1" ] && echo "  (โหมดทดสอบ: กันไม่ให้ Google เก็บดัชนีอยู่)"
