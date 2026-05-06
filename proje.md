# SmartCoach Teknik Mimari Dokümanı

## 1) Amaç
Bu doküman, online fitness koçlarının öğrenci takibini tek bir platformda yönetmesini sağlayan SmartCoach ürününün teknik mimari yapısını tanımlar.

Ana hedef: WhatsApp + Excel + Drive gibi dağınık süreci tek sistemde toplamak ve ölçeklenebilir bir SaaS temeli kurmak.

## 2) Ürün Kapsamı (MVP)
- Koç paneli: öğrenci listesi, check-in durumu, ilerleme takibi
- Öğrenci paneli: haftalık check-in, kilo/ölçü girişi, fotoğraf yükleme
- Öğrenci profil geçmişi: başlangıç verisi + zaman serisi grafikler + fotoğraflar
- Koç tanıtım sayfası ve başvuru formu
- Rol bazlı yetkilendirme (Koç / Öğrenci)

## 3) Önerilen Yüksek Seviye Mimari

### 3.1 Katmanlar
1. Sunum Katmanı (Frontend)
   - Web uygulaması (koç + öğrenci panelleri)
   - Responsive arayüz (mobil öncelikli)

2. Uygulama Katmanı (Backend API)
   - Kimlik doğrulama ve yetkilendirme
   - İş kuralları (check-in, ölçü, paket, başvuru)
   - Bildirim ve görev planlama

3. Veri Katmanı
   - İlişkisel veritabanı (işlemsel veriler)
   - Nesne depolama (ilerleme fotoğrafları)
   - Cache (oturum/sık erişilen sorgular)

4. Entegrasyon Katmanı
   - E-posta/SMS/Push servisleri
   - Ödeme altyapısı (ileriki faz)
   - Analitik/log altyapısı

### 3.2 Önerilen Teknoloji Stack'i
- Frontend: Next.js (React + TypeScript)
- Backend: NestJS veya Next.js API Routes (TypeScript)
- Veritabanı: PostgreSQL
- ORM: Prisma
- Dosya Depolama: S3 uyumlu storage (AWS S3, Cloudflare R2 vb.)
- Cache/Queue: Redis + BullMQ
- Kimlik: JWT + Refresh Token veya NextAuth tabanlı oturum
- Deployment: Vercel (frontend) + Render/Fly.io/AWS (backend/db)
- Gözlemleme: Sentry + OpenTelemetry + merkezi log

## 4) Domain Model (Temel Varlıklar)
- User
  - id, email, passwordHash, role (coach/student), status, createdAt
- CoachProfile
  - userId, fullName, bio, specialty, socialLinks
- StudentProfile
  - userId, coachId, startDate, goal, notes, active
- CheckIn
  - id, studentId, weekStart, mood, complianceScore, notes, submittedAt
- BodyMetric
  - id, studentId, date, weight, waist, chest, arm, leg, bodyFat(optional)
- ProgressPhoto
  - id, studentId, date, type(front/side/back), fileUrl, visibility
- CoachingPackage
  - id, coachId, title, durationWeeks, price, description, isActive
- ApplicationLead
  - id, coachId, fullName, email, phone, goal, source, status
- Notification
  - id, userId, channel, template, status, sentAt

## 5) Ana Akışlar

### 5.1 Öğrenci Check-in Akışı
1. Öğrenci haftalık formu doldurur.
2. Ölçü/kilo girdilerini ekler.
3. Fotoğrafları yükler (pre-signed upload URL).
4. Backend doğrulama yapar ve verileri transaction ile kaydeder.
5. Koça bildirim düşer (dashboard + opsiyonel e-posta/push).

### 5.2 Koç Değerlendirme Akışı
1. Koç dashboard'da bekleyen check-in'leri görür.
2. Öğrenci detay sayfasında zaman serisi grafikleri inceler.
3. Geri bildirim notu bırakır.
4. Sistem öğrenciye geri bildirim bildirimi gönderir.

### 5.3 Başvuru (Lead) Akışı
1. Ziyaretçi koç tanıtım sayfasından başvuru yapar.
2. Başvuru `ApplicationLead` olarak kaydedilir.
3. Koça anlık bildirim gider.
4. Koç lead durumunu panelden yönetir (new/qualified/converted).

## 6) API Tasarım Prensipleri
- REST tabanlı, kaynak odaklı endpoint yapısı
- Versiyonlama: `/api/v1/...`
- Idempotency: kritik POST operasyonlarında destek
- Pagination/Filtering: öğrenci listeleri ve geçmiş verilerde zorunlu
- Validation: schema tabanlı doğrulama (Zod/class-validator)
- Rate limiting: auth, upload, form endpoint'lerinde koruma

Örnek endpoint grupları:
- `POST /api/v1/auth/login`
- `GET /api/v1/coach/students`
- `POST /api/v1/students/{id}/checkins`
- `POST /api/v1/uploads/presign`
- `GET /api/v1/students/{id}/timeline`
- `POST /api/v1/public/{coachSlug}/applications`

## 7) Güvenlik Mimarisi
- Parola saklama: Argon2/bcrypt hash
- Token güvenliği: kısa ömürlü access token + rotation'lı refresh token
- RBAC: coach ve student erişim sınırları
- Veri izolasyonu: koç sadece kendi öğrencilerini görebilir
- Dosya güvenliği: private bucket + süreli erişim URL
- KVKK/GDPR uyumu: açık rıza, veri silme talebi, audit log
- WAF + brute force koruması + IP throttling

## 8) Ölçeklenebilirlik ve Performans
- Read-heavy ekranlar için cache (dashboard sayaçları, özet sorgular)
- Fotoğraf ve statik içerikler için CDN
- Ağır işlemler için queue (rapor üretimi, bildirim gönderimi)
- N+1 sorgularını engelleyen query optimizasyonu
- Index stratejisi:
  - `student_id + date`
  - `coach_id + active`
  - `week_start + submitted_at`

## 9) Gözlemleme ve Operasyon
- Uygulama logları: requestId ile izlenebilirlik
- Hata takibi: Sentry (frontend + backend)
- Metrikler:
  - haftalık check-in tamamlama oranı
  - günlük aktif koç/öğrenci
  - lead -> öğrenci dönüşüm oranı
  - API hata oranı ve yanıt süreleri
- Alarm kuralları:
  - 5xx oranı eşik üstü
  - upload başarısızlık artışı
  - kuyruk birikmesi

## 10) Release Planı (Fazlı Geliştirme)

### Faz 1 - MVP (4-6 hafta)
- Auth + rol yapısı
- Koç/öğrenci paneli temel ekranlar
- Check-in + ölçü + fotoğraf yükleme
- Öğrenci detay zaman akışı

### Faz 2 - Operasyonel Güçlendirme
- Bildirim sistemi
- Koç tanıtım sayfası + lead yönetimi
- Dashboard KPI kartları

### Faz 3 - Ticarileşme
- Paket/satış altyapısı
- Otomatik ilerleme raporları
- Ödeme entegrasyonu

## 11) Teknik Riskler ve Önlemler
- Risk: Fotoğraf depolama maliyeti artışı
  - Önlem: görsel optimizasyon, lifecycle policy, arşivleme
- Risk: Koç başına yoğun veri sorguları
  - Önlem: özet tablolar, cache katmanı, arka plan hesaplamaları
- Risk: Düşük öğrenci check-in disiplini
  - Önlem: otomatik hatırlatma ve gamification öğeleri
- Risk: Veri gizliliği ihlali
  - Önlem: sıkı RBAC, audit log, düzenli güvenlik testleri

## 12) Başarı Kriterleri (North Star + KPI)
- North Star: Haftalık tamamlanan check-in sayısı
- KPI'lar:
  - 4. haftada koç başına aktif öğrenci oranı
  - Haftalık check-in completion rate > %70
  - Lead -> ödeme yapan öğrenci dönüşümü
  - Koç başına panelde geçirilen süre ve tekrar giriş oranı

---

Bu mimari, hızlı MVP çıkışı ile uzun vadeli SaaS ölçeklenmesini birlikte hedefler. İstersen bir sonraki adımda bunu doğrudan "teknik görev listesi + sprint backlog" formatına çevirebilirim.