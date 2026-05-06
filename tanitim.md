# SmartCoach - Ikinci Adim Cikti Notu

## Yapilanlar
- `apps/web` altindaki otomatik olusan ic `.git` klasoru kaldirildi.
- Proje tek repo duzenine gecirildi.
- Kimlik dogrulama altyapisi kuruldu (`next-auth` + credentials provider).
- Rol bazli erisim kontrolu eklendi (`COACH` ve `STUDENT`).
- Korumali sayfalar olusturuldu:
  - `/coach`
  - `/student`
- Giris sayfasi eklendi: `/login`
- Cikis aksiyonu eklendi.
- Seed script eklendi ve demo kullanicilar tanimlandi.

## Demo Giris Bilgileri
- Coach: `coach@smartcoach.app` / `Coach123!`
- Student: `student@smartcoach.app` / `Student123!`

## Komutlar
- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:seed`
- `npm run dev`

## Ucuncu Adim - Check-in Akisi (Tamamlandi)
- Ogrenci paneline haftalik check-in formu eklendi.
- Olcu ve kilo alanlari eklendi (kilo, bel, gogus, kol, bacak, yag orani).
- Form gonderimi ile `CheckIn` ve `BodyMetric` kayitlari ayni anda DB'ye yaziliyor.
- Koc paneline ogrencilerin son check-in ve son kilo ozeti eklendi.
- Kayit sonrasi panel verileri otomatik yenileniyor.

## Dorduncu Adim - Fotograf Yukleme (Tamamlandi)
- Ogrenci paneline ilerleme fotografi yukleme formu eklendi.
- Dosya tipleri sinirlandi: JPG, PNG, WEBP (maksimum 5 MB).
- Yuklenen dosyalar `public/uploads/progress` altina kaydediliyor.
- Her yukleme `ProgressPhoto` tablosuna isleniyor.
- Ogrenci panelinde son yuklenen fotograflar listeleniyor.
- Koc panelinde her ogrenci icin son fotograf gorunuyor.

## Besinci Adim - Upload Dayaniklilik Iyilestirmesi (Tamamlandi)
- Server Action body limiti `8mb` olarak ayarlandi (`next.config.ts`).
- Fotograf yukleme formu client component'e tasindi.
- Dosya secim aninda istemci tarafinda boyut kontrolu eklendi.
- Buyuk dosya seciminde istek atmadan net hata mesaji gosteriliyor.
- Server tarafinda da dogrulama ve basari/hata geri bildirimi eklendi.

## Altyapi Stabilizasyonu - DB Baglanti Sorunu Cozuldu
- Gelistirme ortami gecici local Postgres bagimliligindan cikarildi.
- Veritabani gelistirme icin SQLite'a tasindi (`DATABASE_URL=file:./dev.db`).
- Prisma client adapter yapisi SQLite ile uyumlu hale getirildi.
- `NEXTAUTH_URL` ortami eklendi, next-auth warning'i giderildi.
- `db push` ve `db:seed` sonrasi panel ekranlari baglanti hatasi vermeden aciliyor.

## Sonraki Adim - Public Landing + Giris Akisi (Tamamlandi)
- Ana sayfa artik once koc tanitim ve paketleri gosteriyor.
- Header'da sag ustte sabit `Giris Yap` butonu var.
- Giris yapmamis kullanici landing sayfasinda kaliyor, dogrudan login'e zorlanmiyor.
- Giris yapan kullanici rolune gore otomatik `/coach` veya `/student` paneline yonleniyor.
- Login sayfasi daha duzenli iki kolonlu yapiya tasindi (bilgi alani + form).

## Devam Adimi - Landing Basvuru (Lead) Akisi
- Public landing'e gercek bir "Kocluk Basvurusu" formu eklendi.
- Form gonderimi `ApplicationLead` tablosuna kayit atiyor.
- Basvuru alanlari: ad soyad, e-posta, telefon, secilen paket, hedef notu.
- Koc paneline "Yeni Basvurular" bolumu eklendi.
- Landing'den gelen lead'ler panelde son kayitlar olarak gorunuyor.

## Sonraki Adim - Koc Paneli Analitik Gorunum (Tamamlandi)
- Koc paneli "operasyon paneli" formatina tasindi.
- KPI kartlari eklendi: aktif ogrenci, haftalik check-in, ortalama uyum, yeni basvuru.
- Her ogrenci icin kilo trend ve uyum trend mini grafikleri eklendi.
- Son check-in notlari ve son ilerleme fotograflari ogrenci kartina entegre edildi.
- Koc artik ogrencinin tum kritik kayitlarini tek ekranda duzenli gorebiliyor.

## Devam Adimi - Koc Aksiyonlari (Tamamlandi)
- Koc paneline lead durum guncelleme eklendi (`NEW/QUALIFIED/CONVERTED/LOST`).
- Koc, ogrencinin son check-in kaydina dogrudan geri bildirim yazabiliyor.
- Ogrenci panelinde check-in kartlarinda koc geri bildirimi gorunur hale geldi.
- Kocun aksiyonlari kaydedildiginde ilgili ekranlar otomatik yenileniyor.

## Sonraki Adim - Lead Donusum Akisi (Tamamlandi)
- Koc paneline "Ogrenciye Donustur" aksiyonu eklendi.
- Basvuru lead'i tek tikla ogrenci hesabina donusturulebiliyor.
- Eger e-posta daha once ogrenci olarak varsa mevcut kayit yeniden aktive ediliyor.
- Donusum sonrasi lead durumu otomatik `CONVERTED` yapiliyor.

## Sonraki Adim - Koc Verimlilik Araclari (Tamamlandi)
- Koc paneline ogrenci bazli "program yaz / kaydet" alani eklendi.
- Kaydedilen program ogrenci panelinde dogrudan gorunur hale getirildi.
- Koc icin fotograf araci eklendi: tiklayip buyutme, yan yana karsilastirma.
- Ogrenci kartlari analiz + program + fotograf aksiyonlarini tek yerde topluyor.

## Son Guncelleme - Koc Kontrol Merkezi Yapisi
- Dashboard artik "gunluk operasyon" odakli: check-in gonderen/gondermeyen, bekleyenler, bugun gelenler.
- Ogrenci yonetim listesi renk durum mantigiyla hizli karar vermeye gore duzenlendi.
- "Check-in Inbox" bolumu eklendi: geri bildirim bekleyen kayitlar tek yerde.
- "Problemli Ogrenciler" bolumu eklendi: check-in yok, kilo durmus, foto eksik riskleri.
- Kontenjan takibi eklendi: maksimum / mevcut / bos kontenjan.
- Ogrenci profil sayfasi eklendi (`/coach/students/[studentId]`): temel bilgiler, grafikler, foto timeline, check-in gecmisi.

## UI Revizyonu - Dark SaaS Dashboard
- Koc paneli koyu tema, kart tabanli modern SaaS arayuzune tasindi.
- Sol sidebar + ust navbar + ana icerik olacak sekilde layout guncellendi.
- Stat kartlari, operasyon kutulari, progress bar ve modern ogrenci listesi guclendirildi.
- Applications, Check-ins, Students gibi alanlar tek dashboard akisinda daha okunakli hale geldi.
Bu projeyi teknik detaylara girmeden ürün perspektifinden betimlemek gerekir. Yani “nasıl kodlanacak” değil, nasıl bir ürün ve nasıl bir deneyim sunacak sorusuna odaklanmak gerekir.

Ürünün Temel Tanımı

Bu proje, online koçluk yapan fitness antrenörlerinin öğrencilerini daha kolay yönetmesini sağlayan bir koçluk yönetim platformudur.

Bugün birçok online koç şu araçları birlikte kullanır:

WhatsApp (iletişim)
Excel (takip)
Google Drive (fotoğraflar)
PDF programları (antrenman planı)

Bu platformun amacı bu dağınık yapıyı tek bir sistemde toplamak.

Koç tüm öğrencilerini, ilerlemelerini ve iletişimini tek panelden yönetebilir.

Platformun Çalışma Mantığı

Sistem iki ana kullanıcıya hizmet eder:

Koç
Öğrenci

Koç öğrencileri yönetir, öğrenci ise kendi gelişimini sisteme girer.

Koç Tarafındaki Deneyim

Koç sisteme girdiğinde karşısında bir yönetim paneli görür.

Bu panelde:

tüm öğrenciler listelenir
hangi öğrencinin check-in gönderdiği görülür
öğrencilerin kilo ve ölçü değişimleri takip edilir
yüklenen ilerleme fotoğrafları görüntülenir

Koç bir öğrenciyi seçtiğinde o öğrencinin tüm geçmişi tek sayfada bulunur:

başlangıç bilgileri
haftalık check-in verileri
kilo grafiği
ilerleme fotoğrafları

Bu sayede koç öğrencinin gelişimini hızlı şekilde değerlendirebilir.

Öğrenci Tarafındaki Deneyim

Öğrenci sisteme giriş yaptığında kendisine ait bir panel görür.

Bu panelde:

haftalık check-in formu
kilo girişi
ölçü girişi
ilerleme fotoğrafları yükleme

bulunur.

Öğrenci ayrıca kendi gelişimini görebilir:

kilo değişimi
ölçü değişimi
eski ve yeni fotoğrafların karşılaştırması

Bu da öğrencinin motivasyonunu artırır.

Koçun Tanıtım Sayfası

Platform aynı zamanda koç için bir tanıtım sayfası sağlar.

Bu sayfada:

koçun biyografisi
başarı hikayeleri
referans öğrenciler
koçluk paketleri

yer alır.

Potansiyel öğrenciler bu sayfadan koçu tanıyabilir ve koçluk başvurusu yapabilir.

Platformun Sağladığı Temel Değer

Bu sistemin temel değeri şudur:

Koçların bugün kullandığı dağınık araçları tek bir platformda birleştirmek.

Böylece koç:

öğrenci takibini daha düzenli yapar
öğrencilerle daha profesyonel çalışır
ilerlemeyi görsel olarak analiz edebilir
operasyonel yükünü azaltır

Öğrenci ise:

gelişimini daha net takip eder
koçuyla daha düzenli iletişim kurar
motivasyonunu artıran bir ilerleme kaydı görür.
Platformun Hedef Kitlesi

Bu ürün özellikle şu koçlar için uygundur:

online koçluk yapan fitness antrenörleri
birden fazla öğrenciyi aynı anda yöneten koçlar
öğrenci takibini Excel veya mesajlaşma uygulamalarıyla yapan kişiler

Örnek olarak uzaktan koçluk veren isimler arasında Gokalaf ve Güray Aydın gibi antrenörler bulunur.

Ürünün Uzun Vadeli Vizyonu

İlk aşamada platform sadece öğrenci yönetim sistemi olarak konumlanır.

Zamanla sistem şu alanlara genişleyebilir:

koçluk paketlerinin satışı
otomatik ilerleme raporları
dönüşüm (before/after) paylaşım araçları
koçlar için topluluk ve öğrenci havuzu

Uzun vadede platform, online fitness koçlarının işlerini yönetebilecekleri bir dijital işletim sistemi haline gelebilir.

İstersen bir sonraki adımda şu konuyu da birlikte netleştirebiliriz:

Bu ürünün gerçekten satılmasını sağlayacak “killer feature” ne olmalı?

Çünkü bu tarz SaaS projelerinde başarıyı genellikle tek bir çok güçlü özellik belirler.