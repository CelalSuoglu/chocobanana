/**
 * Privacy policy text. Reviewed by the shop owner before publishing; this is
 * not legal advice. Keep it in sync with what the site actually does.
 * Locales without a translation show English.
 */
export type PrivacySection = { heading: string; body: string[] };
export type PrivacyPolicy = { title: string; updated: string; intro: string; sections: PrivacySection[] };

const UPDATED = "2026-10-16";

const en: PrivacyPolicy = {
  title: "Privacy Policy",
  updated: `Last updated: ${UPDATED}`,
  intro:
    "This policy explains what Chocobanana (thechocobananaclub.com and the Chocobanana iOS and Android apps) collects, why, and the choices you have. The website and the apps share one account system, so this policy covers both.",
  sections: [
    {
      heading: "What we collect",
      body: [
        "Account details you give us: first and last name, email address, phone number, delivery address and a password (stored only as a secure hash).",
        "Orders: items, amounts, the delivery address used for that order, order number and fulfillment status.",
        "Payments are handled by Stripe. We never see or store your full card number; we receive the payment result and, for Mail Club, a Stripe customer and subscription reference.",
        "Messages you send through the contact form, and your email if you join our mailing list.",
        "In the app, only if you turn notifications on: a device notification token, the device platform and your language, so we can send order updates.",
        "Basic technical data needed to run the site, such as your chosen language and currency (cookies) and your shopping cart (stored on your device).",
      ],
    },
    {
      heading: "How we use it",
      body: [
        "To create and secure your account, process and deliver your orders, send order and account emails (verification, password reset, receipts), provide rewards and discounts, answer your messages and, if you opted in, send our newsletter or order notifications.",
        "We do not sell your personal information and we do not use it for third-party advertising or tracking across other companies' apps and websites.",
      ],
    },
    {
      heading: "Service providers",
      body: [
        "Stripe (payments), Vercel (website hosting), Neon (database), Resend (email delivery), Apple Push Notification service and Google Firebase Cloud Messaging (app notifications, only if enabled). They process data only to provide these services to us.",
      ],
    },
    {
      heading: "How long we keep it",
      body: [
        "Account data is kept while your account exists. Paid order records are kept as long as tax and accounting rules require, even after an account is deleted, without being linked to the deleted account.",
      ],
    },
    {
      heading: "Your choices",
      body: [
        "You can view and update your profile and address in My Account at any time.",
        "You can delete your account from My Account → Account settings → Delete account, on the website or in the app. This removes your profile, addresses, reward codes, notification devices and mailing-list entry, and stops Mail Club billing.",
        "You can turn app notifications off in your phone's settings and unsubscribe from emails using the link in any email.",
        "For any other privacy request, contact us at the address below.",
      ],
    },
    {
      heading: "Children",
      body: ["Chocobanana is not directed to children under 13 and we do not knowingly collect their personal information."],
    },
    {
      heading: "Contact",
      body: ["Email: thechocobananaclub@gmail.com"],
    },
  ],
};

const tr: PrivacyPolicy = {
  title: "Gizlilik Politikası",
  updated: `Son güncelleme: ${UPDATED}`,
  intro:
    "Bu politika, Chocobanana'nın (thechocobananaclub.com ve Chocobanana iOS ve Android uygulamaları) hangi bilgileri neden topladığını ve senin seçeneklerini açıklar. Web sitesi ve uygulamalar aynı hesap sistemini kullandığı için bu politika ikisini de kapsar.",
  sections: [
    {
      heading: "Topladığımız bilgiler",
      body: [
        "Bize verdiğin hesap bilgileri: ad, soyad, e-posta, telefon, teslimat adresi ve şifre (yalnızca güvenli bir özet olarak saklanır).",
        "Siparişler: ürünler, tutarlar, o sipariş için kullanılan adres, sipariş numarası ve kargo durumu.",
        "Ödemeler Stripe tarafından alınır. Kart numaranın tamamını görmeyiz ve saklamayız; ödeme sonucunu ve Mail Club için Stripe müşteri/abonelik referansını alırız.",
        "İletişim formundan gönderdiğin mesajlar ve bültene katılırsan e-posta adresin.",
        "Uygulamada, yalnızca bildirimleri açarsan: sipariş güncellemelerini gönderebilmek için cihaz bildirim anahtarı, cihaz türü ve dil tercihin.",
        "Sitenin çalışması için gereken temel bilgiler: seçtiğin dil ve para birimi (çerezler) ve sepetin (cihazında saklanır).",
      ],
    },
    {
      heading: "Bilgileri nasıl kullanıyoruz",
      body: [
        "Hesabını oluşturmak ve korumak, siparişlerini işlemek ve teslim etmek, sipariş ve hesap e-postaları (doğrulama, şifre sıfırlama, fatura) göndermek, ödül ve indirimleri sağlamak, mesajlarını yanıtlamak ve izin verdiysen bülten veya sipariş bildirimleri göndermek için.",
        "Kişisel bilgilerini satmayız, üçüncü taraf reklamları veya başka şirketlerin uygulama ve sitelerinde izleme için kullanmayız.",
      ],
    },
    {
      heading: "Hizmet sağlayıcılar",
      body: [
        "Stripe (ödeme), Vercel (site barındırma), Neon (veritabanı), Resend (e-posta gönderimi), Apple Push Notification service ve Google Firebase Cloud Messaging (yalnızca açıksa uygulama bildirimleri). Bu şirketler bilgileri yalnızca bu hizmetleri bize sağlamak için işler.",
      ],
    },
    {
      heading: "Ne kadar saklıyoruz",
      body: [
        "Hesap bilgileri hesabın var olduğu sürece saklanır. Ödenmiş sipariş kayıtları, hesap silinse bile vergi ve muhasebe kurallarının gerektirdiği süre boyunca, silinen hesapla bağlantısı kaldırılarak saklanır.",
      ],
    },
    {
      heading: "Seçeneklerin",
      body: [
        "Profilini ve adresini Hesabım sayfasından istediğin zaman görebilir ve güncelleyebilirsin.",
        "Hesabını web sitesinde veya uygulamada Hesabım → Hesap ayarları → Hesabı sil yoluyla silebilirsin. Bu işlem profilini, adreslerini, ödül kodlarını, bildirim cihazlarını ve bülten kaydını siler; Mail Club ödemelerini durdurur.",
        "Uygulama bildirimlerini telefonunun ayarlarından kapatabilir, e-postalardaki bağlantıyla bültenden çıkabilirsin.",
        "Diğer gizlilik talepleri için aşağıdaki adresten bize yazabilirsin.",
      ],
    },
    {
      heading: "Çocuklar",
      body: ["Chocobanana 13 yaşından küçük çocuklara yönelik değildir ve bu yaştaki çocukların kişisel bilgilerini bilerek toplamayız."],
    },
    {
      heading: "İletişim",
      body: ["E-posta: thechocobananaclub@gmail.com"],
    },
  ],
};

export function getPrivacyPolicy(locale: string): PrivacyPolicy {
  return locale === "tr" ? tr : en;
}
