# คู่มือขึ้นเซิร์ฟเวอร์ — Plesk (Node.js Toolkit)

สำหรับ **HostAtom Web Hosting (Plesk แบบแชร์)** โดเมน `bantonpoo.phuwish.com`
เข้าแผงควบคุมที่ `https://103.80.48.25:8443` ด้วยผู้ใช้ `phuwishs`

**เป็นโฮสต์แบบแชร์ ไม่มีสิทธิ์ root** ติดตั้งบริการเพิ่มเองไม่ได้ (เช่น PostgreSQL)
และ Plesk เป็นเจ้าของไฟล์ตั้งค่าของ nginx/Apache — ปล่อยให้ Plesk จัดการ proxy, TLS
และการรีสตาร์ต แล้วเราส่งแค่ไฟล์แอปขึ้นไป

---

## 0. สิ่งที่ต้องรู้ก่อน

| หัวข้อ | ค่าที่ใช้ |
| --- | --- |
| Node.js | 24.21.0 — ใช้ได้ (Next 16 ต้องการ ≥ 20.9) |
| ฐานข้อมูล | **SQLite** — ไฟล์เดียว ไม่ต้องมีเซิร์ฟเวอร์ฐานข้อมูล |
| ไฟล์เริ่มต้นแอป | `server.js` — มาจากบิลด์แบบ standalone **ไม่ใช่ `app.js`** |
| ขนาดที่อัปโหลด | ~76 MB ต่อครั้ง |

### ทำไมเป็น SQLite

Payload รองรับแค่ **MongoDB / PostgreSQL / SQLite** — ไม่รองรับ MySQL/MariaDB
ซึ่งเป็นตัวเดียวที่ Plesk แบบแชร์ให้มา และติดตั้ง PostgreSQL เองก็ไม่ได้เพราะไม่มีสิทธิ์ root

SQLite เหมาะกับเว็บนี้: ผู้ดูแลไม่กี่คน ปริมาณเขียนต่ำมาก และสำรองข้อมูลคือการคัดลอกไฟล์เดียว
ข้อแลกเปลี่ยนคือการเขียนพร้อมกันถูกจัดคิวทีละคำสั่ง ถ้าวันหนึ่งทราฟฟิกสูงขึ้นมาก
หรือมีคนแก้เนื้อหาพร้อมกันหลายคน ค่อยย้ายไป PostgreSQL

### สามที่อยู่ที่ต้องจดไว้

```bash
ssh phuwishs@103.80.48.25

pwd                                  # บ้านของ subscription
ls -d ~/bantonpoo.phuwish.com        # Application Root
```

| ตัวแปร | คืออะไร | ตัวอย่าง |
| --- | --- | --- |
| `REMOTE_DIR` | Application Root — โฟลเดอร์แอปที่ถูกเขียนทับทุกครั้งที่ deploy | `/var/www/vhosts/phuwish.com/bantonpoo.phuwish.com` |
| `REMOTE_DB` | ไฟล์ฐานข้อมูล — **ต้องอยู่นอก** `REMOTE_DIR` | `.../bantonpoo-data/bantonpoo.db` |
| `UPLOAD_DIR` | รูปที่อัปโหลดผ่าน CMS — **ต้องอยู่นอก** `REMOTE_DIR` | `.../bantonpoo-data/uploads` |

**สองอันหลังต้องอยู่นอกโฟลเดอร์แอป** เพราะ deploy คือการเขียนทับโฟลเดอร์นั้นทั้งก้อน
ถ้าเก็บไว้ข้างใน เนื้อหาและรูปทั้งหมดจะหายทุกครั้งที่อัปเดตเว็บ

---

## 1. เตรียมโฟลเดอร์ข้อมูล

```bash
ssh phuwishs@103.80.48.25

# แก้ให้ตรงกับผลของ ls ด้านบน
APP=~/bantonpoo.phuwish.com
mkdir -p "$APP/../bantonpoo-data/uploads"
cd "$APP/.." && pwd    # จดที่อยู่เต็มไว้ใช้ตอนตั้ง env
```

ได้สองค่านี้ไปใช้ต่อ

```
REMOTE_DB   <ที่อยู่เต็ม>/bantonpoo-data/bantonpoo.db
UPLOAD_DIR  <ที่อยู่เต็ม>/bantonpoo-data/uploads
```

> ไฟล์ฐานข้อมูลยังไม่ต้องสร้างเอง — `npm run deploy` รอบแรกจะสร้างให้พร้อมตารางทั้งหมด

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
DATABASE_URI          file:<ที่อยู่เต็มจากหัวข้อ 1>/bantonpoo-data/bantonpoo.db
PAYLOAD_SECRET        <openssl rand -hex 32>
NEXT_PUBLIC_SITE_URL  https://bantonpoo.phuwish.com
SITE_NOINDEX          1
UPLOAD_DIR            <ที่อยู่เต็มจากหัวข้อ 1>/bantonpoo-data/uploads
HOSTNAME              127.0.0.1
```

- **`DATABASE_URI` ต้องขึ้นต้นด้วย `file:` และเป็นที่อยู่เต็ม** ไม่ใช่เส้นทางสัมพัทธ์
  เพราะแอปถูกรันจากโฟลเดอร์ที่ต่างไปตามที่ Passenger กำหนด
- **`HOSTNAME=127.0.0.1`** — `server.js` ของ Next อ่านตัวแปรนี้ไปผูกกับเน็ตเวิร์ก
  ถ้าระบบตั้งเป็นชื่อเครื่องไว้ แอปจะผูกพลาดแล้วไม่ขึ้นเลย

สร้าง `PAYLOAD_SECRET` ด้วย `openssl rand -hex 32` **เก็บไว้ให้ดี** เปลี่ยนแล้วทุกคนจะหลุดจากระบบ

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
export DEPLOY_HOST=phuwishs@103.80.48.25
export REMOTE_DIR=<Application Root จากหัวข้อ 0>
export REMOTE_DB=<ที่อยู่เต็ม>/bantonpoo-data/bantonpoo.db
export PAYLOAD_SECRET=<ค่าเดียวกับที่ตั้งใน Plesk>

npm run deploy
```

สคริปต์ทำตามลำดับนี้

```
ตรวจ typecheck + lint + มีไฟล์ migration ครบ
  →  ส่งซอร์ส (ไม่รวม node_modules) ขึ้น bantonpoo-src/ บนเซิร์ฟเวอร์
  →  npm ci ที่นั่น (เฉพาะครั้งแรกหรือเมื่อ package-lock เปลี่ยน)
  →  payload migrate            สร้าง/ปรับตารางในไฟล์ฐานข้อมูล
  →  คัดลอกไฟล์ฐานข้อมูลลงมาอ่าน (อ่านอย่างเดียว ไม่เขียนกลับ)
  →  next build                 สร้างหน้าสินค้า/บทความจากเนื้อหาจริง
  →  rsync ขึ้น Application Root (ไม่แตะ uploads, *.db, .env*, tmp)
  →  touch tmp/restart.txt      Passenger รีสตาร์ตแอปให้เอง
  →  curl โดเมนจริง ต้องได้ 200
```

**ทำไมต้องมีโฟลเดอร์ซอร์สแยกบนเซิร์ฟเวอร์** — SQLite ไม่มีโพรโทคอลเครือข่ายให้ต่อจาก
ระยะไกล ไฟล์อยู่ที่ไหนก็ต้องรัน migration ที่นั่น โฟลเดอร์ `bantonpoo-src/` จึงมีไว้
รัน `payload migrate` อย่างเดียว ไม่ได้ถูกใช้เสิร์ฟเว็บ และไม่มีการ build บนเซิร์ฟเวอร์

**ไฟล์ฐานข้อมูลของเซิร์ฟเวอร์ไม่เคยถูกเขียนทับจากเครื่องเรา** สคริปต์คัดลอกลงมาอ่าน
อย่างเดียวแล้วลบสำเนาทิ้งเมื่อจบ เนื้อหาที่ชุมชนแก้ไว้จึงไม่มีทางหายจากการ deploy

> ถ้าไม่ได้แก้ฟิลด์ใน CMS เลย ข้ามขั้น migrate ให้เร็วขึ้นได้ด้วย `SKIP_MIGRATE=1 npm run deploy`

> **ถ้าแอปไม่รีสตาร์ต** — Plesk บางรุ่นไม่ได้ใช้ Passenger ให้กดปุ่ม **Restart App**
> ในหน้า Node.js แทน ถ้าเป็นแบบนั้นจริง บอกได้ จะเปลี่ยนสคริปต์ไปเรียก
> `plesk ext nodejs --restart-app` ให้

## 5. ครั้งแรกเท่านั้น — สร้างผู้ใช้และใส่เนื้อหาตั้งต้น

หลัง deploy รอบแรกผ่าน ตารางครบแล้วแต่ยังไม่มีข้อมูล

**1. สร้างบัญชีผู้ดูแลคนแรก** — เปิด `https://bantonpoo.phuwish.com/admin`
จะเจอจอ "สร้างผู้ใช้คนแรก" กรอกอีเมลและรหัสผ่าน บัญชีนี้ได้สิทธิ์ `admin` ทันที
จอนี้จะหายไปเองเมื่อมีผู้ใช้แล้ว คนต่อไปต้องให้ผู้ดูแลเชิญเข้ามา

**2. ใส่เนื้อหาตั้งต้น** (ข้ามได้ถ้าจะกรอกเองทั้งหมด)

รันบนเซิร์ฟเวอร์ ในโฟลเดอร์ซอร์สที่ `npm run deploy` ส่งขึ้นไปให้แล้ว

```bash
ssh $DEPLOY_HOST
cd ~/bantonpoo-src        # แก้ตามที่อยู่จริง
DATABASE_URI="file:<REMOTE_DB>" \
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

## 7. การเปลี่ยนโครงฐานข้อมูล (migration)

ทุกครั้งที่ **เพิ่ม ลบ หรือเปลี่ยนชนิดฟิลด์** ใน `src/collections/*` หรือ `src/globals/*`
โครงตารางในฐานข้อมูลต้องเปลี่ยนตาม

| สภาพแวดล้อม | วิธีปรับโครง |
| --- | --- |
| เครื่องพัฒนา | Payload ปรับให้อัตโนมัติตอน `npm run dev` (`push: true`) |
| เซิร์ฟเวอร์จริง | ต้องมีไฟล์ migration และรัน `payload migrate` (`push: false`) — `npm run deploy` ทำให้อัตโนมัติ |

**ทำไมแยกกัน** — `push` เดาการเปลี่ยนแปลงเอง ซึ่งสะดวกมากตอนพัฒนา
แต่บนฐานข้อมูลที่มีข้อมูลจริง การเดาผิดครั้งเดียวอาจลบคอลัมน์ที่ยังมีข้อมูลอยู่
migration เป็นไฟล์ SQL ที่อ่านตรวจก่อนได้ และเก็บไว้ใน git ตามประวัติโค้ด

### ขั้นตอนหลังแก้ฟิลด์

```bash
# 1. ที่เครื่องพัฒนา — ให้ Payload สร้างไฟล์ migration จากส่วนต่าง
npm run migrate:create ชื่อสั้น-อธิบายการเปลี่ยน

# 2. อ่านไฟล์ที่ได้ใน src/migrations/ ก่อนเสมอ
#    ระวังคำสั่ง DROP COLUMN / DROP TABLE ที่ทำให้ข้อมูลหาย
#    ถ้าเป็นการ "เปลี่ยนชื่อฟิลด์" Payload จะมองเป็นลบของเก่า+เพิ่มของใหม่
#    ต้องแก้ไฟล์เองให้เป็น ALTER TABLE ... RENAME COLUMN แทน

# 3. commit ไฟล์ migration ไปพร้อมกับโค้ดที่แก้
git add src/migrations && git commit

# 4. deploy ตามปกติ — scripts/deploy.sh ส่งซอร์สขึ้นไปแล้วรัน migrate บนเซิร์ฟเวอร์ให้เอง
npm run deploy
```

> **`migrate:create` เทียบกับฐานข้อมูลที่ต่ออยู่** ถ้ารันโดยต่อกับฐานข้อมูลพัฒนา
> ที่ `push` ปรับโครงไปแล้ว จะได้ migration เปล่า — ต้องเทียบกับไฟล์ที่ยังเป็นโครงเก่า
> หรือสร้างไฟล์เปล่าขึ้นมาใหม่ เช่น
>
> ```bash
> DATABASE_URI="file:/tmp/diff.db" NODE_ENV=production npm run migrate:create ชื่อ
> ```
>
> **อย่ารัน `npm run migrate` กับฐานข้อมูลพัฒนาของตัวเอง** — ไฟล์นั้นถูกสร้างด้วย
> `push` จึงมีตารางครบอยู่แล้ว การรัน migration ทับจะล้มเพราะพยายามสร้างตารางซ้ำ
> ถ้าอยากเริ่มใหม่ให้ลบไฟล์ `bantonpoo.db` แล้วรัน `npm run migrate && npm run seed`

### ตรวจสถานะ

```bash
# ดูว่า migration ไหนรันไปแล้วบ้างบนเซิร์ฟเวอร์
ssh $DEPLOY_HOST
cd ~/bantonpoo-src
DATABASE_URI="file:<REMOTE_DB>" NODE_ENV=production npm run migrate:status
```

### ถ้า migration ล้มกลางทาง

1. **สำรองก่อนเสมอ** — `scp $DEPLOY_HOST:<REMOTE_DB> ./backup-$(date +%F).db`
2. อ่านข้อความผิดพลาดว่าค้างที่คำสั่งไหน
3. Payload ห่อแต่ละ migration ไว้ใน transaction เดียว ปกติจึงย้อนกลับเองทั้งก้อน
   ฐานข้อมูลควรอยู่ในสภาพก่อนรัน
4. แก้ไฟล์ migration แล้วรันใหม่ · ถ้าต้องกู้จริงก็แค่ `scp` ไฟล์สำรองกลับขึ้นไปทับ
   (ปิดแอปใน Plesk ก่อน แล้วค่อยเปิดใหม่)

---

---

## 8. สำรองข้อมูล

**ข้อดีใหญ่ของ SQLite** — ทั้งเว็บอยู่ในโฟลเดอร์ `bantonpoo-data/` เดียว
(ไฟล์ฐานข้อมูล + รูปที่อัปโหลด) และอยู่ในบ้านของ subscription
**Plesk Backup Manager จึงสำรองให้ครบทั้งหมดโดยไม่ต้องตั้งอะไรเพิ่ม**

ตั้งที่ **Tools & Settings → Backup Manager** ให้สำรองรายวัน และ **ส่งออกไปเก็บนอกเครื่อง**
(FTP/Google Drive) อย่างน้อยสัปดาห์ละครั้ง — เก็บบนเครื่องเดียวกันอย่างเดียวไม่พอ

ดึงสำเนาลงมาเก็บที่เครื่องตัวเองก่อนทำอะไรเสี่ยง

```bash
scp $DEPLOY_HOST:<REMOTE_DB> ./backup-$(date +%F).db
```

## 9. เมื่อจะเปลี่ยนเป็นเว็บจริง

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
| ต่อฐานข้อมูลไม่ได้ | `DATABASE_URI` ต้องขึ้นต้นด้วย `file:` และเป็นที่อยู่เต็ม |
| เนื้อหาหายหลัง deploy | `REMOTE_DB` อยู่ข้างใน Application Root — ต้องย้ายออกมาข้างนอก |
| migration ล้มบนเซิร์ฟเวอร์ | `npm ci` ในโฟลเดอร์ซอร์สยังไม่สำเร็จ — เข้า SSH ไปรันเองแล้วดูข้อความ |
| อัปโหลดรูปไม่ผ่าน | โฟลเดอร์ `UPLOAD_DIR` ยังไม่ได้สร้าง หรือเจ้าของไฟล์ผิด |
| รูปหายหลัง deploy | `UPLOAD_DIR` อยู่ข้างใน Application Root — ต้องย้ายออกมาข้างนอก |
| แก้ฟิลด์ใน CMS แล้ว deploy ล้ม | ยังไม่ได้สร้าง migration — ดูหัวข้อ 7 |
| ลิงก์ในเว็บเป็น `http://` | ยังไม่ได้เปิด redirect เป็น https ใน SSL It! |
| ปุ่มแชร์ส่งลิงก์ผิดโดเมน | `NEXT_PUBLIC_SITE_URL` ผิด และต้อง **build ใหม่** ไม่ใช่แค่รีสตาร์ต |
| เข้า `/admin` แล้วขึ้นจอสร้างผู้ใช้ทั้งที่เคยมีบัญชี | ต่อฐานข้อมูลผิดตัว — ตรวจ `DATABASE_URI` |
