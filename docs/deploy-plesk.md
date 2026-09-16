# คู่มือขึ้นเซิร์ฟเวอร์ — Plesk (Node.js Toolkit)

สำหรับ **HostAtom Cloud VPS ที่ลง Plesk ไว้** โดเมน `bantonpoo.phuwish.com`

**ทำไมใช้ผ่าน Plesk ไม่ใช่ตั้ง systemd + nginx เอง** — Plesk เป็นเจ้าของไฟล์ตั้งค่า
ของ nginx/Apache ถ้าไปแก้เองจะถูกเขียนทับเมื่อ Plesk sync ค่าครั้งถัดไป
ปล่อยให้ Plesk จัดการ proxy, TLS และการรีสตาร์ต แล้วเราส่งแค่ไฟล์แอปขึ้นไป จะไม่ชนกัน

> คู่มือสำหรับ VPS เปล่าที่ไม่มี Plesk อยู่ที่ [deploy-vps.md](./deploy-vps.md)
> ใช้เมื่อจะย้ายไปเครื่องที่ไม่มีแผงควบคุมเท่านั้น

---

## 0. สิ่งที่ต้องรู้ก่อน

| หัวข้อ | ค่าที่ใช้ |
| --- | --- |
| Node.js | 24.21.0 — ใช้ได้ (Next 16 ต้องการ ≥ 20.9) |
| ฐานข้อมูล | PostgreSQL ที่ติดตั้งเองผ่าน SSH — **Plesk ให้มาแค่ MariaDB ซึ่ง Payload ใช้ไม่ได้** |
| ไฟล์เริ่มต้นแอป | `server.js` — มาจากบิลด์แบบ standalone **ไม่ใช่ `app.js`** |
| ขนาดที่อัปโหลด | ~68 MB ต่อครั้ง ไม่ต้องมีซอร์สหรือ `node_modules` บนเซิร์ฟเวอร์ |

**หาที่อยู่จริงของ Application Root ก่อน** — ที่แผงควบคุมขึ้นเป็น `/bantonpoo.phuwish.com`
ซึ่งเป็นเส้นทางเทียบกับบ้านของ subscription ไม่ใช่เส้นทางเต็ม

```bash
ssh root@<ไอพี>
ls -d /var/www/vhosts/*/bantonpoo.phuwish.com
# ตัวอย่างผลลัพธ์: /var/www/vhosts/phuwish.com/bantonpoo.phuwish.com
```

จดค่านี้ไว้ จะเรียกว่า `$APP_ROOT` ตลอดคู่มือนี้

---

## 1. ติดตั้ง PostgreSQL

**Plesk ของ HostAtom มาพร้อม MariaDB เท่านั้น ซึ่ง Payload ใช้ไม่ได้**
(รองรับแค่ MongoDB / PostgreSQL / SQLite) หน้า *Databases → Add Database* ของ Plesk
จึงใช้สร้างฐานข้อมูลให้เว็บนี้ไม่ได้ ต้องติดตั้ง PostgreSQL แยกผ่าน SSH

ไม่ชนกับ MariaDB ของ Plesk เพราะคนละพอร์ต (5432 กับ 3306) และ Plesk ไม่ได้ใช้ Postgres อยู่แล้ว

```bash
ssh root@<ไอพี>

apt update
apt install -y postgresql postgresql-contrib

# ต้องฟังเฉพาะ 127.0.0.1 — ถ้าเห็น 0.0.0.0 ให้แก้ listen_addresses ใน postgresql.conf
ss -lntp | grep 5432

# สร้างผู้ใช้และฐานข้อมูล (เปลี่ยนรหัสผ่านก่อนรัน)
sudo -u postgres psql <<'SQL'
CREATE USER bantonpoo WITH PASSWORD 'เปลี่ยนรหัสผ่านนี้';
CREATE DATABASE bantonpoo OWNER bantonpoo;
SQL

# ตรวจว่าต่อได้จริง
PGPASSWORD='เปลี่ยนรหัสผ่านนี้' psql -h 127.0.0.1 -U bantonpoo -d bantonpoo -c '\conninfo'
```

สร้างรหัสผ่านที่เดายากด้วย `openssl rand -base64 24`

> **PostgreSQL ต้องไม่เปิดออกอินเทอร์เน็ต** ค่าเริ่มต้นฟังเฉพาะ `127.0.0.1` อยู่แล้ว
> อย่าเปิดพอร์ต 5432 ใน Plesk Firewall — เราต่อผ่านอุโมงค์ SSH ตอน deploy อยู่แล้ว

### สำรองข้อมูล — ต้องตั้งเอง

**Plesk Backup Manager จะไม่สำรอง PostgreSQL ให้** เพราะไม่ได้เป็นคนจัดการ
ต้องตั้ง cron เอง ไม่งั้นเนื้อหาทั้งเว็บไม่มีสำรองเลย

```bash
ssh root@<ไอพี>

cat > /usr/local/bin/bantonpoo-backup <<'SH'
#!/bin/bash
set -euo pipefail
DIR=/var/backups/bantonpoo
mkdir -p "$DIR"
sudo -u postgres pg_dump bantonpoo | gzip > "$DIR/db-$(date +%F).sql.gz"
find "$DIR" -name '*.sql.gz' -mtime +30 -delete
SH

chmod +x /usr/local/bin/bantonpoo-backup
echo "15 3 * * * root /usr/local/bin/bantonpoo-backup" > /etc/cron.d/bantonpoo-backup
/usr/local/bin/bantonpoo-backup && ls -lh /var/backups/bantonpoo
```

ส่วนโฟลเดอร์รูป (`bantonpoo-uploads`) อยู่ในบ้านของ subscription อยู่แล้ว
**Plesk Backup Manager สำรองให้เอง** — ตั้งค่าที่ Tools & Settings → Backup Manager

## 2. ตั้งค่าในหน้า Node.js

**Websites & Domains → bantonpoo.phuwish.com → Node.js**

| ช่อง | ตั้งเป็น |
| --- | --- |
| Node.js Version | `24.21.0` (ไม่ต้องแก้) |
| Package Manager | `npm` (ไม่ต้องแก้) |
| Application Mode | `production` (ไม่ต้องแก้) |
| Application Root | `/bantonpoo.phuwish.com` (ไม่ต้องแก้) |
| Document Root | `/bantonpoo.phuwish.com/public` |
| Application Startup File | **`server.js`** |

> **ถ้าตั้ง Document Root เป็น `public/` แล้วหน้าเว็บพัง** (CSS ไม่มา หรือ 404 ทั้งเว็บ)
> ให้ย้อนกลับเป็น `/bantonpoo.phuwish.com` — บิลด์แบบ standalone เสิร์ฟไฟล์สแตติกเองได้อยู่แล้ว
> ค่านี้ต่างกันไปตามว่า Plesk ตั้ง Passenger ไว้อย่างไร ลองแล้วดูผลจริงเป็นหลัก

### Custom environment variables → กด [specify]

```
DATABASE_URI          postgres://bantonpoo:<รหัสผ่าน>@127.0.0.1:5432/bantonpoo
PAYLOAD_SECRET        <openssl rand -hex 32>
NEXT_PUBLIC_SITE_URL  https://bantonpoo.phuwish.com
SITE_NOINDEX          1
UPLOAD_DIR            <APP_ROOT ด้านบน>/../bantonpoo-uploads
HOSTNAME              127.0.0.1
```

เหตุผลของสองตัวท้าย

- **`UPLOAD_DIR` ต้องอยู่นอก Application Root** เพราะ deploy คือการเขียนทับโฟลเดอร์นั้นทั้งก้อน
  ถ้าเก็บรูปไว้ข้างใน รูปที่ชุมชนอัปโหลดจะหายทุกครั้งที่อัปเดตเว็บ
- **`HOSTNAME=127.0.0.1`** — `server.js` ของ Next อ่านตัวแปรนี้ไปผูกกับเน็ตเวิร์ก
  ถ้าระบบตั้งเป็นชื่อเครื่องไว้ แอปจะผูกพลาดแล้วไม่ขึ้นเลย

สร้างโฟลเดอร์รูปและคืนเจ้าของให้ผู้ใช้ของโดเมน

```bash
ssh root@<ไอพี>
APP_ROOT=/var/www/vhosts/phuwish.com/bantonpoo.phuwish.com   # แก้ตามของจริง
OWNER=$(stat -c '%U:%G' "$APP_ROOT")
mkdir -p "$APP_ROOT/../bantonpoo-uploads"
chown "$OWNER" "$APP_ROOT/../bantonpoo-uploads"
```

## 3. ใบรับรอง TLS

**Websites & Domains → SSL/TLS Certificates → SSL It!**

1. ออกใบรับรอง Let's Encrypt (ติ๊ก `www` ด้วยถ้ามี)
2. เปิด **Redirect from http to https**
3. เปิดต่ออายุอัตโนมัติ

ต้องทำก่อน deploy เพราะ `NEXT_PUBLIC_SITE_URL` เป็น `https://` — ถ้ายังไม่มีใบรับรอง
ลิงก์แชร์และ canonical URL จะชี้ไปที่อยู่ที่เปิดไม่ได้

## 4. Deploy ครั้งแรก

จากเครื่องตัวเอง

```bash
export DEPLOY_HOST=root@<ไอพี>
export REMOTE_DIR=/var/www/vhosts/phuwish.com/bantonpoo.phuwish.com   # APP_ROOT
export DB_PASSWORD=<รหัสผ่าน PostgreSQL>

npm run deploy
```

สคริปต์ทำตามลำดับนี้

```
ตรวจ typecheck + lint + มีไฟล์ migration ครบ
  →  เปิดอุโมงค์ SSH ไปยัง PostgreSQL ของเซิร์ฟเวอร์
  →  payload migrate            สร้าง/ปรับตารางให้ตรงกับโค้ด
  →  next build                 อ่านเนื้อหาจากฐานข้อมูลของเซิร์ฟเวอร์
  →  rsync ขึ้น Application Root (ไม่แตะ uploads และ .env*)
  →  touch tmp/restart.txt      Passenger รีสตาร์ตแอปให้เอง
  →  curl โดเมนจริง ต้องได้ 200
```

**build ที่เครื่องเรา ไม่ใช่บนเซิร์ฟเวอร์** ถึงแม้ RAM จะพอ เพราะ `next build` กิน CPU หนัก
พอสมควร และเว็บที่รันอยู่จะช้าลงระหว่างนั้น อีกทั้งไม่ต้องเอาซอร์สกับ `node_modules`
(~700MB) ขึ้นไปวางบนเครื่องจริงให้เป็นภาระ

> **ถ้าแอปไม่รีสตาร์ต** — Plesk บางรุ่นไม่ได้ใช้ Passenger ให้กดปุ่ม **Restart App**
> ในหน้า Node.js แทน ถ้าเป็นแบบนั้นจริง บอกได้ จะเปลี่ยนสคริปต์ไปเรียก
> `plesk ext nodejs --restart-app` ให้

## 5. ครั้งแรกเท่านั้น — สร้างผู้ใช้และใส่เนื้อหาตั้งต้น

หลัง deploy รอบแรกผ่าน ตารางครบแล้วแต่ยังไม่มีข้อมูล

**1. สร้างบัญชีผู้ดูแลคนแรก** — เปิด `https://bantonpoo.phuwish.com/admin`
จะเจอจอ "สร้างผู้ใช้คนแรก" กรอกอีเมลและรหัสผ่าน บัญชีนี้ได้สิทธิ์ `admin` ทันที
จอนี้จะหายไปเองเมื่อมีผู้ใช้แล้ว คนต่อไปต้องให้ผู้ดูแลเชิญเข้ามา

**2. ใส่เนื้อหาตั้งต้น** (ข้ามได้ถ้าจะกรอกเองทั้งหมด)

```bash
ssh -f -N -L 15432:127.0.0.1:5432 $DEPLOY_HOST
DATABASE_URI="postgres://bantonpoo:$DB_PASSWORD@127.0.0.1:15432/bantonpoo" \
  PAYLOAD_SECRET=<ค่าเดียวกับที่ตั้งใน Plesk> \
  NODE_ENV=production \
  npx tsx scripts/seed.ts
```

> ⚠️ `seed.ts` **ล้างเนื้อหาเดิมทิ้งก่อนเสมอ** (ไม่แตะบัญชีผู้ใช้)
> ใช้ได้เฉพาะตอนติดตั้งครั้งแรก อย่ารันซ้ำหลังชุมชนเริ่มกรอกข้อมูลจริง
>
> **ต้องใส่ `NODE_ENV=production`** ไม่งั้น Payload จะเข้าโหมดพัฒนาแล้วปรับโครง
> ฐานข้อมูลของเซิร์ฟเวอร์เองอัตโนมัติ ซึ่งเป็นสิ่งที่เราตั้งใจปิดไว้บนเครื่องจริง

**3. deploy อีกรอบ** เพื่อสร้างหน้าสินค้าและบทความเป็นไฟล์สแตติกจากเนื้อหาที่เพิ่งใส่

```bash
npm run deploy
```

## 6. ตรวจหลัง deploy

```bash
curl -I https://bantonpoo.phuwish.com                      # 200 และ redirect จาก http
curl -s https://bantonpoo.phuwish.com/robots.txt           # ต้องเป็น Disallow: / ตอนเป็นโดเมนทดสอบ
curl -s https://bantonpoo.phuwish.com/ | grep 'meta name="robots"'
CHECK_BASE_URL=https://bantonpoo.phuwish.com npm run check:public
```

`check:public` ตรวจว่าไม่มีลิงก์หลังบ้านหรือที่อยู่ฟิลด์หลุดไปถึงผู้เข้าชมทั่วไป
ควรรันทุกครั้งหลัง deploy

ดู log เมื่อมีปัญหา

```bash
ssh $DEPLOY_HOST "tail -n 80 $REMOTE_DIR/../logs/error_log"
```

## 7. สำรองข้อมูล

ตั้งไว้แล้วสองชั้นตั้งแต่หัวข้อ 1 — cron `pg_dump` รายวันสำหรับฐานข้อมูล
และ Plesk Backup Manager สำหรับโฟลเดอร์รูป

เหลืออีกอย่างที่ต้องทำเอง: **ส่งไฟล์สำรองออกไปเก็บนอกเครื่อง** อย่างน้อยสัปดาห์ละครั้ง
เก็บไว้บนเครื่องเดียวกันอย่างเดียว ถ้า VPS เสียหายก็หายไปพร้อมกัน

สำรองด่วนด้วยมือก่อนทำอะไรเสี่ยง

```bash
ssh $DEPLOY_HOST /usr/local/bin/bantonpoo-backup
```

## 8. เมื่อจะเปลี่ยนเป็นเว็บจริง

1. ลบ `SITE_NOINDEX` ออกจาก Custom environment variables (หรือตั้งเป็น `0`)
2. แก้ `NEXT_PUBLIC_SITE_URL` เป็นโดเมนจริง
3. `npm run deploy` ใหม่ — **ต้อง build ใหม่** เพราะ `robots.txt` และแท็ก
   `<meta name="robots">` ถูกสร้างตั้งแต่ตอน build ไม่ใช่ตอนรัน
4. ส่ง sitemap เข้า Google Search Console

---

## ปัญหาที่พบบ่อย

| อาการ | สาเหตุและทางแก้ |
| --- | --- |
| แอปไม่ขึ้นเลย / 503 | Startup File ยังเป็น `app.js` — ต้องเป็น `server.js` |
| แอปขึ้นแล้วล่มทันที | ไม่ได้ตั้ง `HOSTNAME=127.0.0.1` แอปผูกเน็ตเวิร์กพลาด |
| CSS ไม่มา / 404 ทั้งเว็บ | Document Root ชี้ผิด — ลองย้อนกลับเป็น Application Root |
| ต่อฐานข้อมูลไม่ได้ | `DATABASE_URI` ชี้พอร์ต 3306 (MariaDB ของ Plesk) — ต้องเป็น 5432 |
| อัปโหลดรูปไม่ผ่าน | โฟลเดอร์ `UPLOAD_DIR` ยังไม่ได้สร้าง หรือเจ้าของไฟล์ผิด |
| รูปหายหลัง deploy | `UPLOAD_DIR` อยู่ข้างใน Application Root — ต้องย้ายออกมาข้างนอก |
| แก้ฟิลด์ใน CMS แล้ว deploy ล้ม | ยังไม่ได้สร้าง migration — ดู [deploy-vps.md หัวข้อ 9](./deploy-vps.md) |
| ลิงก์ในเว็บเป็น `http://` | ยังไม่ได้เปิด redirect เป็น https ใน SSL It! |
| ปุ่มแชร์ส่งลิงก์ผิดโดเมน | `NEXT_PUBLIC_SITE_URL` ผิด และต้อง **build ใหม่** ไม่ใช่แค่รีสตาร์ต |
| เข้า `/admin` แล้วขึ้นจอสร้างผู้ใช้ทั้งที่เคยมีบัญชี | ต่อฐานข้อมูลผิดตัว — ตรวจ `DATABASE_URI` |
