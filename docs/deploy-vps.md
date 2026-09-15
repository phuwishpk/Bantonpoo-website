# คู่มือขึ้นเซิร์ฟเวอร์ — HostAtom Cloud VPS

สำหรับโดเมน **`bantonpoo.phuwish.com`**

ทำครั้งเดียวตอนตั้งเครื่อง (หัวข้อ 1–7) จากนั้นการอัปเดตเว็บเหลือคำสั่งเดียว (หัวข้อ 8)

**สมมติฐาน** — VPS ลง Ubuntu 24.04 LTS และเข้า SSH ด้วย root ได้
ถ้าใช้ระบบปฏิบัติการอื่น คำสั่งติดตั้งแพ็กเกจจะต่างออกไป แต่ขั้นตอนเหมือนกัน

---

## 1. เตรียมเครื่องและความปลอดภัยพื้นฐาน

```bash
ssh root@<ไอพีของ VPS>

apt update && apt upgrade -y
apt install -y ufw fail2ban git curl rsync

# สร้างผู้ใช้สำหรับรันเว็บ ไม่รันด้วย root
adduser --system --group --home /srv/bantonpoo bantonpoo

# เปิดเฉพาะพอร์ตที่ต้องใช้จริง
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

systemctl enable --now fail2ban
```

> **PostgreSQL ต้องไม่เปิดออกอินเทอร์เน็ต** ค่าเริ่มต้นของ Ubuntu ฟังเฉพาะ `127.0.0.1` อยู่แล้ว
> และ `ufw` ข้างบนก็ไม่ได้เปิดพอร์ต 5432 — อย่าเปิดเพิ่มถ้าไม่จำเป็น

## 2. ติดตั้ง Node.js 22 LTS

Next.js 16 ต้องการ Node 20.9 ขึ้นไป — เลือก 22 LTS เพราะรองรับยาวกว่า

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
node -v          # ต้องขึ้น v22.x
```

## 3. ติดตั้ง PostgreSQL

```bash
apt install -y postgresql postgresql-contrib

sudo -u postgres psql <<'SQL'
CREATE USER bantonpoo WITH PASSWORD 'เปลี่ยนรหัสผ่านนี้ด้วย';
CREATE DATABASE bantonpoo OWNER bantonpoo;
GRANT ALL PRIVILEGES ON DATABASE bantonpoo TO bantonpoo;
SQL
```

สร้างรหัสผ่านที่เดายากด้วย `openssl rand -base64 24`

> **ทำไมไม่ใช้ MariaDB** — Payload รองรับแค่ MongoDB, Postgres และ SQLite
> ไม่รองรับ MySQL/MariaDB บน VPS ที่ควบคุมเองได้ **Postgres คือตัวเลือกที่ถูกต้อง**
> เพราะเป็น adapter ที่ Payload ทดสอบและรองรับดีที่สุด

## 4. โครงไฟล์บนเซิร์ฟเวอร์

```
/srv/bantonpoo/
├── current/          โค้ดที่รันอยู่ (อัปโหลดทับทุกครั้งที่ deploy)
├── uploads/          รูปที่อัปโหลดผ่าน CMS  ← ห้ามลบตอน deploy
└── backups/          ไฟล์สำรอง
```

```bash
mkdir -p /srv/bantonpoo/{current,uploads,backups}
chown -R bantonpoo:bantonpoo /srv/bantonpoo
```

**`uploads/` แยกออกจาก `current/` โดยตั้งใจ** เพราะ deploy คือการเขียนทับ `current/`
ถ้าเก็บรูปไว้ข้างในจะหายทุกครั้งที่อัปเดตเว็บ

## 5. ตัวแปรสภาพแวดล้อม

```bash
cat > /etc/bantonpoo.env <<'ENV'
NODE_ENV=production
PORT=3000
HOSTNAME=127.0.0.1
NEXT_PUBLIC_SITE_URL=https://bantonpoo.phuwish.com

# โดเมนนี้ใช้ทดสอบ จึงกันไม่ให้ Google เก็บดัชนี
# เมื่อจะเปิดเป็นเว็บจริง ให้ลบบรรทัดนี้แล้ว deploy ใหม่
SITE_NOINDEX=1

# ---- เฟสถัดไปตอนติดตั้ง Payload ----
# DATABASE_URI=postgres://bantonpoo:<password>@127.0.0.1:5432/bantonpoo
# PAYLOAD_SECRET=<openssl rand -hex 32>
ENV

chmod 600 /etc/bantonpoo.env
chown bantonpoo:bantonpoo /etc/bantonpoo.env
```

> ⚠️ **`SITE_NOINDEX` และ `NEXT_PUBLIC_SITE_URL` ถูกอ่านตอน build ไม่ใช่ตอนรัน**
> ทั้ง `robots.txt` และแท็ก `<meta name="robots">` ถูกสร้างตั้งแต่ตอน build
> เปลี่ยนค่าแล้วต้อง **deploy ใหม่** ไม่ใช่แค่ `systemctl restart`
> สคริปต์ `scripts/deploy.sh` ส่งค่าให้ตอน build ให้เรียบร้อยแล้ว

## 6. systemd — ให้เว็บรันตลอดและกลับมาเองเมื่อล่ม

```bash
cat > /etc/systemd/system/bantonpoo.service <<'UNIT'
[Unit]
Description=Bantonpoo community website
After=network.target postgresql.service

[Service]
Type=simple
User=bantonpoo
Group=bantonpoo
WorkingDirectory=/srv/bantonpoo/current
EnvironmentFile=/etc/bantonpoo.env
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5

# จำกัดสิทธิ์ให้เขียนได้เฉพาะโฟลเดอร์ที่จำเป็น
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/srv/bantonpoo/uploads

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable bantonpoo
```

## 7. nginx + ใบรับรอง TLS

**ชี้โดเมนก่อน** — ที่ผู้ให้บริการ DNS ของ `phuwish.com` เพิ่มเรกคอร์ด

```
ชนิด  ชื่อ         ค่า
A     bantonpoo    <ไอพีของ VPS>
```

รอให้ DNS กระจาย (`dig bantonpoo.phuwish.com +short` ต้องได้ไอพีที่ถูก) แล้วค่อยทำต่อ

```bash
apt install -y nginx certbot python3-certbot-nginx

cat > /etc/nginx/sites-available/bantonpoo <<'NGINX'
server {
    listen 80;
    server_name bantonpoo.phuwish.com;

    # ขนาดไฟล์อัปโหลดสูงสุด — ต้องพอสำหรับรูปถ่ายจากกล้องมือถือ
    client_max_body_size 25M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;

        # Next ใช้ header ชุดนี้ตัดสินว่าเป็น https หรือไม่
        # ถ้าไม่ส่งไป ลิงก์ที่สร้างขึ้นจะกลายเป็น http:// ทั้งหมด
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # ไฟล์ที่มีลายเซ็นในชื่ออยู่แล้ว แคชได้ยาว
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
NGINX

ln -s /etc/nginx/sites-available/bantonpoo /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# ขอใบรับรองฟรีจาก Let's Encrypt และตั้งต่ออายุอัตโนมัติ
certbot --nginx -d bantonpoo.phuwish.com --redirect --agree-tos -m <อีเมลคุณ>
systemctl status certbot.timer     # ต้องขึ้น active
```

## 8. Deploy จากเครื่องตัวเอง

**สร้างไฟล์ที่เครื่องเรา ไม่ build บนเซิร์ฟเวอร์** เพราะ VPS แผนเริ่มต้นมี RAM 2GB
และ 1 vCore ซึ่ง `next build` อาจกินจนเครื่องค้างและทำให้เว็บที่รันอยู่ล่มไปด้วย

```bash
export DEPLOY_HOST=root@<ไอพีของ VPS>
export DB_PASSWORD=<รหัสผ่าน PostgreSQL บนเซิร์ฟเวอร์>

npm run deploy
```

> ⚠️ **ทำไมต้องใส่รหัสฐานข้อมูลตอน build**
> หน้าสินค้าและบทความถูกสร้างเป็นไฟล์สแตติกตั้งแต่ตอน build โดยอ่านเนื้อหาจากฐานข้อมูล
> ถ้า build ด้วยฐานข้อมูลในเครื่องพัฒนา เว็บที่ขึ้นไปจะมีเนื้อหาชุดของเครื่องพัฒนา
> สคริปต์จึงเปิดอุโมงค์ SSH ไปยัง PostgreSQL บนเซิร์ฟเวอร์ให้อัตโนมัติ แล้วปิดเมื่อเสร็จ

สคริปต์จะทำตามลำดับนี้ให้เอง

```
ตรวจ typecheck + lint  →  build แบบ standalone (พร้อม SITE_NOINDEX)
                       →  รวมไฟล์ที่ต้องใช้จริง
                       →  rsync ขึ้น /srv/bantonpoo/current
                       →  systemctl restart bantonpoo
                       →  ตรวจว่าเว็บตอบ 200
```

## 9. สำรองข้อมูล

```bash
cat > /usr/local/bin/bantonpoo-backup <<'SH'
#!/bin/bash
set -euo pipefail
DATE=$(date +%F)
DIR=/srv/bantonpoo/backups

sudo -u postgres pg_dump bantonpoo | gzip > "$DIR/db-$DATE.sql.gz"
tar czf "$DIR/uploads-$DATE.tar.gz" -C /srv/bantonpoo uploads

# เก็บย้อนหลัง 30 วัน
find "$DIR" -name '*.gz' -mtime +30 -delete
SH

chmod +x /usr/local/bin/bantonpoo-backup
echo "15 3 * * * root /usr/local/bin/bantonpoo-backup" > /etc/cron.d/bantonpoo-backup
```

> สำรองไว้บนเครื่องเดียวกันยังไม่พอ ถ้า VPS เสียหายก็หายไปพร้อมกัน
> ควรตั้ง `rsync` ดึงโฟลเดอร์ `backups/` มาเก็บที่อื่นอีกชุดอย่างน้อยสัปดาห์ละครั้ง

## 10. ตรวจหลัง deploy

```bash
curl -I https://bantonpoo.phuwish.com                 # 200 และ redirect จาก http แล้ว
curl -s https://bantonpoo.phuwish.com/robots.txt      # ต้องขึ้น Disallow: / ตอนเป็นโดเมนทดสอบ
curl -s https://bantonpoo.phuwish.com/ | grep 'meta name="robots"'
systemctl status bantonpoo
journalctl -u bantonpoo -n 50 --no-pager
```

## 11. เมื่อจะเปลี่ยนเป็นเว็บจริง

1. ลบบรรทัด `SITE_NOINDEX=1` ออกจาก `/etc/bantonpoo.env`
2. แก้ `NEXT_PUBLIC_SITE_URL` เป็นโดเมนจริง
3. `./scripts/deploy.sh` ใหม่ (ต้อง build ใหม่ เพราะแท็ก meta ถูกสร้างตอน build)
4. ส่ง sitemap เข้า Google Search Console

---

## ปัญหาที่พบบ่อย

| อาการ | สาเหตุและทางแก้ |
| --- | --- |
| ลิงก์ในเว็บเป็น `http://` ทั้งที่เปิด https | nginx ไม่ได้ส่ง `X-Forwarded-Proto` — ตรวจ config หัวข้อ 7 |
| ปุ่มแชร์ส่งลิงก์ผิดโดเมน | `NEXT_PUBLIC_SITE_URL` ผิด และต้อง **build ใหม่** ไม่ใช่แค่รีสตาร์ต |
| รูปที่อัปโหลดหายหลัง deploy | เก็บรูปไว้ใน `current/` — ต้องอยู่ใน `uploads/` (หัวข้อ 4) |
| `502 Bad Gateway` | บริการไม่ได้รัน — `journalctl -u bantonpoo -n 50` |
| เครื่องค้างตอน deploy | เผลอ build บนเซิร์ฟเวอร์ — ต้อง build ที่เครื่องตัวเอง |
| เว็บขึ้นไม่ได้หลังแก้ฟิลด์ใน CMS | ยังไม่ได้รัน migration — ดูหัวข้อ "การเปลี่ยนโครงฐานข้อมูล" |
| เนื้อหาบนเว็บไม่ตรงกับที่แก้ในหลังบ้าน | build ด้วยฐานข้อมูลผิดตัว — ตรวจว่าตั้ง `DB_PASSWORD` แล้วและอุโมงค์ SSH เปิดได้ |
| แก้เนื้อหาแล้วเว็บไม่เปลี่ยน | hook revalidate ไม่ทำงาน — ดู `journalctl -u bantonpoo` |
| `robots.txt` ยังขึ้น `Allow: /` | ตั้ง `SITE_NOINDEX` แล้วแต่ไม่ได้ build ใหม่ — รัน `npm run deploy` อีกครั้ง |
