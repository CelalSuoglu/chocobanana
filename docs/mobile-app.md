# Chocobanana iOS & Android uygulaması

Uygulama, canlı siteyi (`https://thechocobananaclub.com`) açan bir **Capacitor** kabuğudur.
Site, uygulama ve yönetim paneli **aynı** veritabanını, hesapları, ürünleri ve siparişleri kullanır.
Sitede yaptığın her değişiklik (ve paneldeki her güncelleme) uygulamaya mağaza güncellemesi
gerekmeden yansır. Yalnızca `mobile/` klasöründeki yerel kabuk değişirse yeni sürüm yüklemen gerekir.

## Neler eklendi

| Alan | Dosyalar |
| --- | --- |
| Yerel kabuk (yapılandırma, çevrimdışı sayfası, ikon/açılış görselleri) | `mobile/` |
| Uygulama algılama (yalnızca görünüm; yetki vermez) | `lib/native/app-context.ts` |
| Alt sekme menüsü, sayfa geçişi, yükleniyor çubuğu, bağlantı uyarısı, klavye | `components/app/app-shell.tsx`, `components/app/app-tab-bar.tsx`, `app/globals.css` (sonda, `html[data-app]` ile sınırlı) |
| Bildirim izni kartı (Hesap sayfası, yalnızca uygulamada) | `components/app/push-settings-card.tsx` |
| Cihaz kaydı API'si | `app/api/push/devices/route.ts` |
| Gönderim (APNs + FCM, gizli anahtarlar sadece sunucuda) | `lib/push/*` |
| Panelden kargo durumu değişince müşteriye bildirim | `lib/owner/actions.ts` |
| Veritabanı tablosu | `prisma/schema.prisma` (`PushDevice`), `prisma/migrations/20261016150000_push_devices` |
| 10 dilde metinler | `messages/*.json` → `app` |

Web sitesi ziyaretçileri için hiçbir şey değişmez: uygulamaya özel her şey,
uygulamanın tarayıcı kimliğine eklediği `ChocobananaApp/1.0` işaretine bağlıdır.

## 1. Web tarafını yayına al

```bash
npm install
npx prisma migrate deploy     # PushDevice tablosunu ekler (Preview ve Production veritabanında)
npm run build                 # yerelde derleme kontrolü
```
Ardından her zamanki gibi Vercel'e yayınla. Bildirim kullanacaksan Vercel → Settings →
Environment Variables'a `.env.example` sonundaki `APNS_*` ve `FCM_SERVICE_ACCOUNT_JSON`
değişkenlerini ekle. Eklemezsen her şey çalışır, yalnızca bildirim gönderilmez.

## 2. Uygulamayı ilk kez oluştur (Mac'te, bir kez)

Gerekenler: Node 20+, **Xcode 16+** (iOS), **Android Studio** (Android).

```bash
cd mobile
npm install
node scripts/write-app-url.mjs
npx cap add ios --packagemanager SPM
npx cap add android
npm run assets          # ikon ve açılış ekranlarını logo'dan üretir
npx cap sync
```

Test sürümünü Preview sitesine bağlamak için (Production "coming soon" kapalıyken):
```bash
CHOCO_APP_URL=https://<preview-adresin>.vercel.app npm run sync
```
Not: Vercel Preview'da "Deployment Protection" açıksa uygulama giriş ekranına takılır;
test için kapat ya da "Protection Bypass" kullan.

## 3. Telefonda dene

**iPhone:** `npm run ios` → Xcode açılır → *Signing & Capabilities* → Team olarak Apple ID'ni seç →
iPhone'u kabloyla bağla → ▶︎. (Ücretsiz Apple ID ile 7 gün geçerli kurulum yapılır;
iPhone'da Ayarlar → Genel → VPN ve Aygıt Yönetimi'nden geliştiriciye güven.)

**Android:** telefonda Geliştirici seçenekleri → USB hata ayıklama'yı aç → `npm run android` →
Android Studio'da ▶︎. Ya da *Build → Build APK(s)* ile APK üretip telefona at.

### Test listesi
- [ ] Açılış ekranı, ardından site; alt sekmeler (Ana sayfa, Sticker, Kulüp, Sepet, Hesap)
- [ ] Çentik/Dynamic Island ve alt çubuk içeriği kapatmıyor
- [ ] Mevcut hesapla giriş, çıkış, şifremi unuttum
- [ ] Sepete ekle → ödeme adımı → Stripe test kartı `4242 4242 4242 4242` → başarı sayfası uygulama içinde
- [ ] Panelde siparişin görünmesi; durumu değiştirince sitede ve uygulamada güncellenmesi
- [ ] Form doldururken klavye alanı kapatmıyor, sekme çubuğu gizleniyor
- [ ] Android geri tuşu önceki sayfaya dönüyor, ana sayfada uygulamadan çıkıyor
- [ ] Uçak modu: uygulama açıkken uyarı bandı; kapalıyken açınca çevrimdışı sayfası ve "Tekrar dene"
- [ ] Instagram / e‑posta bağlantıları sistem tarayıcısında açılıyor
- [ ] (Bildirim kurulduysa) Hesap → Bildirimleri aç → izin → panelden durumu "SHIPPED" yap → bildirim gelir, dokununca Hesap açılır

## 4. Bildirimler

- İzin **yalnızca** kullanıcı Hesap → "Bildirimleri aç"a dokunduğunda istenir.
- Yalnızca sipariş durumu bildirimi gönderilir (Hazırlanıyor, Kargoda, Teslim edildi, İptal).
- **iOS:** Apple Developer → Keys → yeni anahtar (Apple Push Notifications service) → `.p8` dosyası.
  Xcode → Signing & Capabilities → **+ Push Notifications**. Sonra `APNS_*` değişkenleri.
  Xcode'dan kurulan sürüm için `APNS_ENVIRONMENT=development`, TestFlight/App Store için `production`.
- **Android:** Firebase'de proje → Android uygulaması ekle (`com.thechocobananaclub.app`) →
  `google-services.json` dosyasını `mobile/android/app/` içine koy → `npm run sync`.
  Firebase → Service accounts → yeni özel anahtar → `FCM_SERVICE_ACCOUNT_JSON`.
  Bu dosya olmadan Android'de bildirim kartı hiç gösterilmez (çökme önlenir).
- iOS'ta APNs'e doğrudan gönderildiği için iOS'a Firebase eklemen gerekmez.

## 5. Bilinen sınırlar

- **Apple Pay / Google Pay**, Stripe Checkout uygulama içi görünümde açıldığında görünmez; kartla ödeme çalışır.
- E‑posta doğrulama ve şifre sıfırlama bağlantıları telefonda tarayıcıda açılır (işlem tamamlanır,
  sonra uygulamada giriş yapılır). Bağlantıların doğrudan uygulamayı açması için ileride
  Universal Links / App Links eklenebilir.
- Ürün düzenleme paneli henüz yok (ürünler `lib/catalog/*` içinde). Eklendiğinde uygulama ek iş gerektirmeden kullanır.
- "Coming soon" açıkken uygulama geri sayımı atlar ve tam mağazayı (ödeme dahil) açar. Uygulama işareti tarayıcı kimliğinden okunduğu için teknik bilgisi olan biri bunu taklit ederek mağazayı web'de de erken açabilir.

## Mağaza durumu (16 Ekim 2026)

Yapıldı:
- Uygulama içinden **hesap silme**: Hesabım → Hesap ayarları → Hesabı sil (şifre onaylı; Stripe aboneliği ve kayıtlı kartlar iptal edilir, siparişler hesapsız saklanır).
- **Gizlilik politikası** sayfası: `/en/privacy`, `/tr/privacy` (diğer dillerde İngilizce). Metni yayından önce kendin oku; hukuki danışmanlık değildir.
- iOS projesi **UIScene** yapısına geçirildi (iOS 27 zorunluluğu), bildirim kaydı bağlantıları eklendi.
- Uygulama yeniden canlı siteye (`https://thechocobananaclub.com`) bağlandı; yerel test izni kaldırıldı.
- `ITSAppUsesNonExemptEncryption = false` (şifreleme sorusu otomatik "Hayır").
- Yalnızca iPhone (iPad ekran görüntüsü gerekmez). Sürüm 1.0, build 1.
- iOS bildirimleri, Xcode'da **+ Capability → Push Notifications** eklenene kadar uygulamada gösterilmez.

Yerel test için yeniden `localhost`'a bağlamak istersen: `CHOCO_APP_URL=http://localhost:3000 npm run sync`
ve geçici olarak Info.plist'e `NSAppTransportSecurity → NSAllowsLocalNetworking = YES` ekle. Mağazaya göndermeden önce
ikisini de geri al (`npm run sync`).

## App Store'a gönderme adımları

1. **Siteyi yayına al** (uygulama canlı siteyi açtığı için önce bu):
   `npx prisma migrate deploy` (Production veritabanına) → değişiklikleri Vercel'e yayınla →
   telefonda `thechocobananaclub.com/en/privacy` ve Hesabım → Hesabı sil'in göründüğünü kontrol et.
   "Coming soon" geri sayımı yalnızca web sitesinde görünür; uygulama her zaman tam mağazayı açar
   (`lib/site-access.ts`, `lib/site-access-server.ts`). Böylece Apple incelemesi de tam mağazayı görür.
2. **Apple Developer Program** üyeliği (yıllık 99 USD). Onaylanınca Xcode → Signing → Team olarak yeni takımı seç.
3. **App Store Connect → Apps → +**: ad "Chocobanana", dil, Bundle ID `com.thechocobananaclub.app`, SKU (örn. `chocobanana-ios`).
4. Xcode üstte cihaz olarak **Any iOS Device (arm64)** seç → **Product → Archive** → Organizer'da **Distribute App → App Store Connect → Upload**.
5. App Store Connect'te önce **TestFlight** ile kendi iPhone'unda dene (kablo gerekmez).
6. Mağaza sayfası:
   - Gizlilik politikası URL: `https://thechocobananaclub.com/en/privacy`
   - Destek URL: `https://thechocobananaclub.com/en/contact`
   - Kategori: Shopping. Yaş derecesi anketi: tüm yanıtlar "Yok".
   - Ekran görüntüleri: 6.9" iPhone (1320×2868 veya 1290×2796). Sanal iPhone 17 Pro Max'te Cmd+S ile alınabilir.
   - Açıklama, anahtar kelimeler, tanıtım metni.
7. **App Privacy** formu (Veri toplanıyor; izleme için kullanılmıyor; hepsi kullanıcının kimliğine bağlı):
   - İletişim bilgileri: Ad, E-posta, Telefon, Fiziksel adres → Uygulama işlevi
   - Satın alımlar: Satın alma geçmişi → Uygulama işlevi
   - Kullanıcı içeriği: Müşteri desteği (iletişim formu) → Uygulama işlevi
   - Tanımlayıcılar: Kullanıcı kimliği → Uygulama işlevi; Cihaz kimliği yalnızca bildirimleri açarsan
   - Ödeme bilgisi Stripe'ta işlenir; uygulama kart numarası toplamaz.
8. **App Review Information**: test hesabı e‑posta + şifre (doğrulanmış bir müşteri hesabı) ve not:
   "Physical goods are sold; payment is processed by Stripe. Account deletion: Account → Account settings → Delete account."
9. **Submit for Review**.

## Android (Google Play) için not
Google Play her yıl hedef SDK şartını yükseltir; yeni uygulamalar için güncel şartı Play Console'da kontrol et.
Şu an `mobile/android/variables.gradle` → `targetSdkVersion = 35`. Gerekirse 36'ya çıkarıp Android Studio'da derle.

## 6. Mağaza yayını için gerekenler (özet)
**Apple App Store**
- Apple Developer Program üyeliği (yıllık 99 USD), Team ID
- Benzersiz Bundle ID: `com.thechocobananaclub.app` (istersen değiştir: `mobile/capacitor.config.ts`)
- App Store Connect'te uygulama kaydı, gizlilik politikası URL'si, destek URL'si
- Ekran görüntüleri (6.9" ve 6.5" iPhone; iPad destekleyeceksen iPad), açıklama, anahtar kelimeler, kategori
- App Privacy (veri toplama) formu: e‑posta, ad, adres, sipariş geçmişi, cihaz kimliği (bildirim)
- **Hesap silme:** eklendi (Hesabım → Hesap ayarları → Hesabı sil).
- İnceleme için bir test hesabı (e‑posta + şifre) ve Stripe test modunun açık olduğu bir ortam ya da notu
- Fiziksel ürün sattığın için Apple'ın uygulama içi satın alma zorunluluğu yok; Stripe kullanımı uygundur.

**Google Play**
- Google Play Console geliştirici hesabı (bir kerelik 25 USD), kimlik doğrulama
- İmzalama anahtarı (Android Studio → Generate Signed Bundle) — `.jks` dosyasını ve şifresini **güvenli** sakla
- `.aab` paketi, 512×512 ikon, 1024×500 öne çıkan görsel, telefon ekran görüntüleri
- Veri güvenliği formu, gizlilik politikası URL'si, içerik derecelendirme anketi, hedef kitle
- Yeni kişisel hesaplarda yayından önce 12 test kullanıcısıyla 14 günlük kapalı test şartı
- Hesap silme: uygulama içinde ve web'de Hesabım → Hesabı sil (Play Console'a web adresi olarak `/en/account` verilebilir)
