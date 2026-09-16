#!/usr/bin/env bash
#
# Deploy เว็บไซต์ชุมชนบ้านต้นโพธิ์ขึ้นเซิร์ฟเวอร์
#
#   DEPLOY_HOST=phuwishs@103.80.48.25 \
#   REMOTE_DIR=/var/www/vhosts/.../bantonpoo.phuwish.com \
#   REMOTE_DB=/var/www/vhosts/.../bantonpoo-data/bantonpoo.db \
#   ./scripts/deploy.sh
#
# build ที่เครื่องตัวเองแล้วส่งเฉพาะผลลัพธ์ขึ้นไป (~76MB)
# ไม่ต้องมี node_modules ในโฟลเดอร์แอปบนเซิร์ฟเวอร์เลย
#
# ฐานข้อมูลเป็น SQLite ซึ่งเป็น "ไฟล์" ไม่ใช่เซิร์ฟเวอร์ จึงทำอุโมงค์ SSH เข้าไปไม่ได้
# ลำดับจึงเป็น: ปรับโครงบนเซิร์ฟเวอร์ → คัดลอกไฟล์ลงมาอ่านตอน build → ส่งบิลด์ขึ้นไป
# ไม่มีขั้นตอนไหนเขียนทับฐานข้อมูลของเซิร์ฟเวอร์ เนื้อหาที่ชุมชนแก้ไว้จึงปลอดภัยเสมอ
#
# รีสตาร์ตแอปได้สองแบบ ตั้งด้วย RESTART_MODE
#   passenger (ค่าเริ่มต้น) — Plesk/Phusion Passenger รีสตาร์ตเมื่อไฟล์ tmp/restart.txt เปลี่ยน
#   systemd                — VPS เปล่าที่ตั้ง service เอง

set -euo pipefail

DEPLOY_HOST="${DEPLOY_HOST:?ต้องตั้ง DEPLOY_HOST เช่น DEPLOY_HOST=phuwishs@103.80.48.25}"
REMOTE_DIR="${REMOTE_DIR:?ต้องตั้ง REMOTE_DIR เป็น Application Root บนเซิร์ฟเวอร์}"
REMOTE_DB="${REMOTE_DB:?ต้องตั้ง REMOTE_DB เป็นที่อยู่เต็มของไฟล์ฐานข้อมูลบนเซิร์ฟเวอร์}"
# โฟลเดอร์ซอร์สบนเซิร์ฟเวอร์ ใช้รัน migration อย่างเดียว (ดู docs/deploy-plesk.md)
REMOTE_SRC="${REMOTE_SRC:-$(dirname "$REMOTE_DIR")/bantonpoo-src}"
RESTART_MODE="${RESTART_MODE:-passenger}"
SERVICE="${SERVICE:-bantonpoo}"
SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://bantonpoo.phuwish.com}"
# Passenger สุ่มพอร์ตเอง จึงตรวจผ่านโดเมนจริง ไม่ใช่ 127.0.0.1:3000
HEALTH_URL="${HEALTH_URL:-$SITE_URL}"
# ค่าเริ่มต้นคือกันไม่ให้ Google เก็บดัชนี ต้องตั้ง SITE_NOINDEX=0 เองเมื่อจะเปิดเว็บจริง
NOINDEX="${SITE_NOINDEX:-1}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STAGE="$(mktemp -d)"
DBDIR="$(mktemp -d)"
BUILD_DB="$DBDIR/build.db"
trap 'rm -rf "$STAGE" "$DBDIR"' EXIT

cd "$ROOT"

echo "▸ ตรวจโค้ดก่อน"
npx tsc --noEmit
npx eslint .

# ลืมสร้าง migration หลังแก้ฟิลด์เป็นสาเหตุที่ deploy ล้มบ่อยที่สุด
if [ -z "$(ls -A "$ROOT/src/migrations"/*.ts 2>/dev/null)" ]; then
  echo "✗ ไม่พบไฟล์ migration — รัน 'npm run migrate:create <ชื่อ>' ก่อน"
  exit 1
fi

# ------------------------------------------------------------------
# 1) ปรับโครงฐานข้อมูลบนเซิร์ฟเวอร์
#
# ต้องรันบนเซิร์ฟเวอร์ ไม่ใช่ที่เครื่องเรา เพราะ SQLite ไม่มีโพรโทคอลเครือข่าย
# ให้ต่อจากระยะไกล — ไฟล์อยู่ที่ไหนก็ต้องรันที่นั่น
# ------------------------------------------------------------------
if [ "${SKIP_MIGRATE:-0}" = "1" ]; then
  echo "▸ ข้ามขั้นปรับโครงฐานข้อมูล (SKIP_MIGRATE=1)"
else
  echo "▸ ส่งซอร์สสำหรับรัน migration ขึ้น $REMOTE_SRC"
  rsync -az --delete \
    --exclude 'node_modules' --exclude '.next' --exclude '.git' \
    --exclude 'public' --exclude '*.db*' --exclude '.env*' \
    "$ROOT/" "$DEPLOY_HOST:$REMOTE_SRC/"

  echo "▸ ปรับโครงฐานข้อมูลบนเซิร์ฟเวอร์"
  # ติดตั้ง dependency เฉพาะตอนที่ package-lock เปลี่ยน เพราะ npm ci ใช้เวลานาน
  ssh "$DEPLOY_HOST" "
    set -e
    cd '$REMOTE_SRC'
    if [ ! -d node_modules ] || [ package-lock.json -nt node_modules/.package-lock.json ]; then
      echo '  ติดตั้ง dependency (ครั้งแรก หรือ package-lock เปลี่ยน)'
      npm ci --ignore-scripts
    fi
    DATABASE_URI='file:$REMOTE_DB' NODE_ENV=production npx payload migrate
  "
fi

# ------------------------------------------------------------------
# 2) คัดลอกฐานข้อมูลลงมาอ่านตอน build
#
# หน้าสินค้าและบทความถูกสร้างเป็นไฟล์สแตติกตอน build โดยอ่านเนื้อหาจากฐานข้อมูล
# ถ้า build ด้วยฐานข้อมูลในเครื่องพัฒนา เว็บที่ขึ้นไปจะมีเนื้อหาชุดของเครื่องพัฒนา
# สำเนานี้ใช้อ่านอย่างเดียวและถูกลบทิ้งเมื่อจบ ไม่มีการเขียนกลับขึ้นเซิร์ฟเวอร์
# ------------------------------------------------------------------
echo "▸ คัดลอกฐานข้อมูลของเซิร์ฟเวอร์ลงมาอ่าน"
# .backup ของ sqlite3 คัดลอกได้อย่างปลอดภัยแม้มีคนกำลังแก้เนื้อหาอยู่
# ถ้าเซิร์ฟเวอร์ไม่มีคำสั่ง sqlite3 ให้ตกไปใช้ cp ธรรมดา
ssh "$DEPLOY_HOST" "
  set -e
  if command -v sqlite3 >/dev/null 2>&1; then
    sqlite3 '$REMOTE_DB' \".backup '/tmp/bantonpoo-build.db'\"
  else
    cp '$REMOTE_DB' /tmp/bantonpoo-build.db
  fi
"
scp -q "$DEPLOY_HOST:/tmp/bantonpoo-build.db" "$BUILD_DB"
ssh "$DEPLOY_HOST" "rm -f /tmp/bantonpoo-build.db"
echo "  ได้สำเนาขนาด $(du -h "$BUILD_DB" | cut -f1)"

echo "▸ build (SITE_URL=$SITE_URL, SITE_NOINDEX=$NOINDEX)"
# แท็ก <meta name="robots"> ถูกสร้างตอน build จึงต้องส่งค่าเข้ามาตรงนี้ด้วย
# ไม่ใช่ตั้งแค่บนเซิร์ฟเวอร์
NEXT_PUBLIC_SITE_URL="$SITE_URL" \
  SITE_NOINDEX="$NOINDEX" \
  DATABASE_URI="file:$BUILD_DB" \
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
# --delete ลบไฟล์เก่าที่ไม่มีแล้วออก แต่ต้องไม่แตะฐานข้อมูล รูปที่อัปโหลด และไฟล์ตั้งค่า
rsync -az --delete \
  --exclude 'uploads' \
  --exclude '*.db*' \
  --exclude '.env*' \
  --exclude 'tmp' \
  "$STAGE/" "$DEPLOY_HOST:$REMOTE_DIR/"

echo "▸ รีสตาร์ตแอป ($RESTART_MODE)"
if [ "$RESTART_MODE" = "passenger" ]; then
  # Passenger อ่านเวลาแก้ไขของไฟล์นี้ แตะแล้วจะรีสตาร์ตแอปในคำขอถัดไป
  ssh "$DEPLOY_HOST" "
    set -e
    mkdir -p '$REMOTE_DIR/tmp'
    touch '$REMOTE_DIR/tmp/restart.txt'
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
    echo "  ดู log: ssh $DEPLOY_HOST tail -n 50 $(dirname "$REMOTE_DIR")/logs/error_log"
    echo "  หรือกดปุ่ม Restart App ในหน้า Node.js ของ Plesk"
  else
    echo "  ดู log: ssh $DEPLOY_HOST journalctl -u $SERVICE -n 50"
  fi
  exit 1
fi

echo "✓ deploy สำเร็จ — $SITE_URL"
[ "$NOINDEX" = "1" ] && echo "  (โหมดทดสอบ: กันไม่ให้ Google เก็บดัชนีอยู่)"
