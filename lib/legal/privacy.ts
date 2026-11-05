/**
 * Privacy policy. Written for PIPEDA (Canada), Quebec Law 25, the EU/UK GDPR
 * and Turkey's KVKK. Keep it in sync with what the site actually does.
 * Not legal advice. Locales without a translation show English.
 */
import { BUSINESS } from "@/lib/legal/business";

export type PrivacySection = { heading: string; body: string[] };
export type PrivacyPolicy = {
  title: string;
  updated: string;
  intro: string;
  sections: PrivacySection[];
  lang: "en" | "tr" | "fr" | "de";
};

const UPDATED = "2026-11-05";
const PROVIDERS =
  "Stripe (payments), Vercel (website hosting), Neon (database), Resend (email delivery), Apple Push Notification service and Google Firebase Cloud Messaging (app notifications, only if you turn them on)";

function contact(pending: string): string[] {
  return [
    `${BUSINESS.tradeName} — ${BUSINESS.sellerName}`,
    BUSINESS.mailingAddress || pending,
    `Email: ${BUSINESS.email}`,
  ];
}

const en = (): PrivacyPolicy => ({
  lang: "en",
  title: "Privacy Policy",
  updated: `Last updated: ${UPDATED}`,
  intro:
    "This policy explains what Chocobanana (thechocobananaclub.com and the Chocobanana iOS and Android apps) collects, why, how long we keep it and the choices you have. The website and the apps share one account system, so this policy covers both.",
  sections: [
    {
      heading: "Who is responsible",
      body: [
        `${BUSINESS.tradeName}, run by ${BUSINESS.sellerName} in ${BUSINESS.country}, is responsible for your personal information. Our person in charge of privacy is ${BUSINESS.privacyOfficer}, reachable at ${BUSINESS.email}.`,
      ],
    },
    {
      heading: "What we collect",
      body: [
        "Account details you give us: first and last name, email address, phone number, delivery address and a password (stored only as a secure hash).",
        "Orders: items, amounts, the delivery address used, order number and fulfilment status. If you check out as a guest we keep the same order details without an account.",
        "Payments are handled by Stripe. We never see or store your full card number; we receive the payment result and a Stripe customer reference.",
        "Messages you send through the contact form or the withdrawal form, and your email if you join our mailing list.",
        "In the app, only if you turn notifications on: a device notification token, the device platform and your language.",
        "Technical data needed to run the site: your chosen language and currency, your sign-in session (cookies) and your shopping cart (stored on your device). Our host also keeps short-lived server logs (such as IP address and browser type) for security.",
      ],
    },
    {
      heading: "Why we use it and on what basis",
      body: [
        "To take, deliver and support your orders, and to manage your account (needed to perform our contract with you).",
        "To send order and account emails such as confirmations, invoices, verification and password reset (contract).",
        "To keep accounting and tax records (legal obligation).",
        "To protect the site and prevent fraud (our legitimate interest).",
        "To send our newsletter, only after you opt in and confirm your email (consent). You can withdraw consent at any time with the unsubscribe link in every email.",
        "We do not sell or rent your personal information, do not share it for advertising, and do not use advertising or analytics trackers.",
      ],
    },
    {
      heading: "Cookies",
      body: [
        "We use only cookies that the site needs to work: language and currency choice, your sign-in session and security checks. We do not use advertising, analytics or social media cookies, so we do not ask for cookie consent. Your cart is saved in your browser's storage on your device.",
      ],
    },
    {
      heading: "Who we share it with",
      body: [
        `Service providers that run the shop for us: ${PROVIDERS}. They may only use your information to provide their service to us.`,
        "Postal services receive your name and address on the envelope. We may disclose information if the law requires it.",
      ],
    },
    {
      heading: "Where it is stored",
      body: [
        "We are based in Canada and our service providers store data mainly in the United States and Canada. If you live in the EU, the UK or Türkiye, your information is therefore transferred outside your country. We rely on the safeguards these providers offer, such as the EU Standard Contractual Clauses and, where available, the EU–US Data Privacy Framework.",
      ],
    },
    {
      heading: "How long we keep it",
      body: [
        "Account data is kept while your account exists. Order and invoice records are kept for as long as tax law requires (in Canada, six years), even after an account is deleted, without being linked to the deleted account.",
        "Newsletter data is kept until you unsubscribe. Contact and withdrawal messages are kept for up to two years, then deleted.",
      ],
    },
    {
      heading: "Security",
      body: [
        "We use encrypted connections (HTTPS), hashed passwords and access limited to the shop owner. If a breach ever creates a real risk of significant harm, we will tell you and the relevant authority as the law requires.",
      ],
    },
    {
      heading: "Your rights",
      body: [
        "You can ask to see, correct or delete your information, get a copy in a portable format, object to or restrict some uses, and withdraw consent at any time.",
        "You can update your profile and address in My Account, and delete your account from My Account → Account settings → Delete account, on the website or in the app.",
        "For any other request, email us. We answer within 30 days.",
        "You can also complain to a privacy authority: in Canada the Office of the Privacy Commissioner of Canada (or the Commission d'accès à l'information in Quebec); in the EU your local data protection authority; in the UK the ICO; in Türkiye the KVKK.",
      ],
    },
    {
      heading: "Children",
      body: ["Chocobanana is not directed to children under 13 and we do not knowingly collect their personal information. If you think a child has given us information, contact us and we will delete it."],
    },
    {
      heading: "Changes",
      body: ["If we change this policy we will update the date above, and tell you by email if the change is significant."],
    },
    {
      heading: "Contact",
      body: contact("Mailing address available on request by email"),
    },
  ],
});

const tr = (): PrivacyPolicy => ({
  lang: "tr",
  title: "Gizlilik Politikası",
  updated: `Son güncelleme: ${UPDATED}`,
  intro:
    "Bu politika Chocobanana'nın (thechocobananaclub.com ve Chocobanana iOS ve Android uygulamaları) hangi bilgileri neden topladığını, ne kadar sakladığını ve seçeneklerini açıklar. Web sitesi ve uygulamalar aynı hesap sistemini kullandığı için ikisini de kapsar. Türkiye'de yaşayan kullanıcılar için bu metin 6698 sayılı KVKK kapsamında aydınlatma metni niteliğindedir.",
  sections: [
    {
      heading: "Veri sorumlusu",
      body: [
        `Kişisel verilerinden ${BUSINESS.country}'da faaliyet gösteren ${BUSINESS.tradeName} (${BUSINESS.sellerName}) sorumludur. Gizlilikten sorumlu kişi ${BUSINESS.privacyOfficer}; ${BUSINESS.email} adresinden ulaşabilirsin.`,
      ],
    },
    {
      heading: "Topladığımız bilgiler",
      body: [
        "Bize verdiğin hesap bilgileri: ad, soyad, e-posta, telefon, teslimat adresi ve şifre (yalnızca güvenli bir özet olarak saklanır).",
        "Siparişler: ürünler, tutarlar, kullanılan adres, sipariş numarası ve kargo durumu. Misafir olarak alışveriş yaparsan aynı sipariş bilgileri hesapsız saklanır.",
        "Ödemeler Stripe tarafından alınır. Kart numaranın tamamını görmeyiz ve saklamayız; ödeme sonucunu ve Stripe müşteri referansını alırız.",
        "İletişim veya cayma formuyla gönderdiğin mesajlar ve bültene katılırsan e-posta adresin.",
        "Uygulamada, yalnızca bildirimleri açarsan: cihaz bildirim anahtarı, cihaz türü ve dil tercihin.",
        "Sitenin çalışması için gereken teknik bilgiler: dil ve para birimi tercihin, oturumun (çerezler) ve sepetin (cihazında saklanır). Barındırma sağlayıcımız güvenlik için kısa süreli sunucu kayıtları (IP adresi, tarayıcı türü gibi) tutar.",
      ],
    },
    {
      heading: "Neden kullanıyoruz ve hukuki sebep",
      body: [
        "Siparişlerini almak, teslim etmek ve desteklemek, hesabını yönetmek (sözleşmenin ifası).",
        "Onay, fatura, doğrulama ve şifre sıfırlama gibi sipariş ve hesap e-postaları göndermek (sözleşmenin ifası).",
        "Muhasebe ve vergi kayıtlarını tutmak (yasal yükümlülük).",
        "Siteyi korumak ve dolandırıcılığı önlemek (meşru menfaat).",
        "Bülten göndermek, yalnızca izin verip e-postanı onayladıktan sonra (açık rıza). Her e-postadaki bağlantıyla istediğin zaman çıkabilirsin.",
        "Kişisel bilgilerini satmayız, kiralamayız, reklam için paylaşmayız; reklam veya analiz izleyicisi kullanmayız.",
      ],
    },
    {
      heading: "Çerezler",
      body: [
        "Yalnızca sitenin çalışması için gereken çerezleri kullanırız: dil ve para birimi tercihi, oturum ve güvenlik kontrolleri. Reklam, analiz veya sosyal medya çerezi kullanmadığımız için çerez onayı istemeyiz. Sepetin cihazındaki tarayıcı depolamasında tutulur.",
      ],
    },
    {
      heading: "Kimlerle paylaşıyoruz",
      body: [
        `Mağazayı bizim için çalıştıran hizmet sağlayıcılar: ${PROVIDERS}. Bu şirketler bilgileri yalnızca bize hizmet vermek için kullanabilir.`,
        "Posta hizmeti zarftaki adını ve adresini görür. Yasa gerektirirse bilgi paylaşabiliriz.",
      ],
    },
    {
      heading: "Nerede saklanıyor",
      body: [
        "Kanada'dayız ve hizmet sağlayıcılarımız verileri ağırlıklı olarak ABD ve Kanada'da saklar. Türkiye, AB veya Birleşik Krallık'ta yaşıyorsan bilgilerin yurt dışına aktarılır. Bu aktarım, siparişini yerine getirmek için gereklidir ve sağlayıcıların sunduğu standart sözleşme maddeleri gibi güvencelere dayanır.",
      ],
    },
    {
      heading: "Ne kadar saklıyoruz",
      body: [
        "Hesap bilgileri hesabın var olduğu sürece saklanır. Sipariş ve fatura kayıtları, hesap silinse bile vergi yasalarının gerektirdiği süre boyunca (Kanada'da altı yıl), silinen hesapla bağlantısı kaldırılarak saklanır.",
        "Bülten bilgileri çıkana kadar, iletişim ve cayma mesajları en fazla iki yıl saklanır, sonra silinir.",
      ],
    },
    {
      heading: "Güvenlik",
      body: [
        "Şifreli bağlantı (HTTPS), şifrelerin güvenli özetlenmesi ve yalnızca mağaza sahibinin erişimi kullanılır. Bir veri ihlali ciddi zarar riski doğurursa yasanın gerektirdiği şekilde sana ve ilgili kuruma bildiririz.",
      ],
    },
    {
      heading: "Hakların",
      body: [
        "Bilgilerini görmeyi, düzeltmeyi veya silmeyi, taşınabilir bir kopyasını almayı, bazı kullanımlara itiraz etmeyi veya kısıtlamayı ve rızanı istediğin zaman geri çekmeyi talep edebilirsin (KVKK m.11 dahil).",
        "Profilini ve adresini Hesabım sayfasından güncelleyebilir, hesabını Hesabım → Hesap ayarları → Hesabı sil yoluyla silebilirsin.",
        "Diğer talepler için bize e-posta gönder; 30 gün içinde yanıt veririz.",
        "Ayrıca bir veri koruma kurumuna şikâyette bulunabilirsin: Türkiye'de Kişisel Verileri Koruma Kurumu, Kanada'da Office of the Privacy Commissioner of Canada, AB'de yerel veri koruma otoriten, Birleşik Krallık'ta ICO.",
      ],
    },
    {
      heading: "Çocuklar",
      body: ["Chocobanana 13 yaşından küçük çocuklara yönelik değildir ve bu yaştaki çocukların bilgilerini bilerek toplamayız. Bir çocuğun bilgi verdiğini düşünüyorsan bize yaz, sileriz."],
    },
    {
      heading: "Değişiklikler",
      body: ["Bu politikayı değiştirirsek yukarıdaki tarihi güncelleriz; önemli bir değişiklikse e-postayla haber veririz."],
    },
    {
      heading: "İletişim",
      body: contact("Posta adresi e-postayla talep edildiğinde bildirilir"),
    },
  ],
});

const fr = (): PrivacyPolicy => ({
  lang: "fr",
  title: "Politique de confidentialité",
  updated: `Dernière mise à jour : ${UPDATED}`,
  intro:
    "Cette politique explique quels renseignements Chocobanana (thechocobananaclub.com et les applications iOS et Android Chocobanana) recueille, pourquoi, combien de temps nous les conservons et quels sont vos choix. Le site et les applications partagent un même système de compte ; cette politique couvre les deux.",
  sections: [
    {
      heading: "Responsable",
      body: [
        `${BUSINESS.tradeName}, exploité par ${BUSINESS.sellerName} au ${BUSINESS.country}, est responsable de vos renseignements personnels. La personne responsable de la protection des renseignements personnels est ${BUSINESS.privacyOfficer}, joignable à ${BUSINESS.email}.`,
      ],
    },
    {
      heading: "Ce que nous recueillons",
      body: [
        "Les renseignements de compte que vous fournissez : prénom et nom, courriel, téléphone, adresse de livraison et mot de passe (conservé uniquement sous forme chiffrée irréversible).",
        "Les commandes : articles, montants, adresse utilisée, numéro de commande et statut d'expédition. En commande invitée, ces renseignements sont conservés sans compte.",
        "Les paiements sont traités par Stripe. Nous ne voyons ni ne conservons votre numéro de carte complet ; nous recevons le résultat du paiement et une référence client Stripe.",
        "Les messages envoyés par le formulaire de contact ou de rétractation, et votre courriel si vous vous abonnez à l'infolettre.",
        "Dans l'application, seulement si vous activez les notifications : un jeton de notification, la plateforme de l'appareil et votre langue.",
        "Les données techniques nécessaires au site : langue et devise choisies, session de connexion (témoins) et panier (stocké sur votre appareil). Notre hébergeur conserve brièvement des journaux serveur (adresse IP, type de navigateur) pour la sécurité.",
      ],
    },
    {
      heading: "Pourquoi et sur quelle base",
      body: [
        "Prendre, livrer et suivre vos commandes et gérer votre compte (exécution du contrat).",
        "Envoyer les courriels de commande et de compte : confirmation, facture, vérification, réinitialisation (exécution du contrat).",
        "Tenir les registres comptables et fiscaux (obligation légale).",
        "Protéger le site et prévenir la fraude (intérêt légitime).",
        "Envoyer l'infolettre, seulement après votre consentement et la confirmation de votre courriel. Vous pouvez le retirer à tout moment via le lien de désabonnement.",
        "Nous ne vendons ni ne louons vos renseignements, ne les partageons pas à des fins publicitaires et n'utilisons aucun traceur publicitaire ou analytique.",
      ],
    },
    {
      heading: "Témoins (cookies)",
      body: [
        "Nous utilisons uniquement les témoins nécessaires au fonctionnement du site : langue et devise, session de connexion et vérifications de sécurité. Nous n'utilisons aucun témoin publicitaire, analytique ou de réseaux sociaux ; aucun consentement n'est donc demandé. Votre panier est conservé dans le stockage de votre navigateur.",
      ],
    },
    {
      heading: "Avec qui nous les partageons",
      body: [
        `Les fournisseurs qui exploitent la boutique pour nous : ${PROVIDERS}. Ils ne peuvent utiliser vos renseignements que pour nous fournir leur service.`,
        "Les services postaux reçoivent votre nom et votre adresse sur l'enveloppe. Nous pouvons communiquer des renseignements si la loi l'exige.",
      ],
    },
    {
      heading: "Où ils sont conservés",
      body: [
        "Nous sommes au Canada et nos fournisseurs conservent les données principalement aux États-Unis et au Canada. Vos renseignements peuvent donc être communiqués hors du Québec et hors de votre pays. Nous nous appuyons sur les garanties offertes par ces fournisseurs, comme les clauses contractuelles types de l'UE et, lorsqu'il est disponible, le cadre de protection des données UE–États-Unis.",
      ],
    },
    {
      heading: "Durée de conservation",
      body: [
        "Les données de compte sont conservées tant que le compte existe. Les commandes et factures sont conservées le temps exigé par la loi fiscale (six ans au Canada), même après la suppression du compte, sans lien avec celui-ci.",
        "Les données d'infolettre sont conservées jusqu'au désabonnement ; les messages de contact et de rétractation jusqu'à deux ans.",
      ],
    },
    {
      heading: "Sécurité",
      body: [
        "Connexions chiffrées (HTTPS), mots de passe hachés et accès limité à la propriétaire de la boutique. Si un incident présente un risque de préjudice sérieux, nous vous aviserons, ainsi que l'autorité compétente, comme la loi l'exige.",
      ],
    },
    {
      heading: "Vos droits",
      body: [
        "Vous pouvez demander l'accès à vos renseignements, leur rectification ou leur suppression, une copie dans un format portable, vous opposer à certains usages ou les limiter, et retirer votre consentement à tout moment.",
        "Vous pouvez modifier votre profil dans Mon compte et supprimer votre compte via Mon compte → Paramètres du compte → Supprimer le compte.",
        "Pour toute autre demande, écrivez-nous ; nous répondons dans les 30 jours.",
        "Vous pouvez aussi porter plainte auprès d'une autorité : au Québec, la Commission d'accès à l'information ; au Canada, le Commissariat à la protection de la vie privée ; dans l'UE, votre autorité locale (en France, la CNIL) ; au Royaume-Uni, l'ICO.",
      ],
    },
    {
      heading: "Enfants",
      body: ["Chocobanana ne s'adresse pas aux enfants de moins de 13 ans et nous ne recueillons pas sciemment leurs renseignements. Si vous pensez qu'un enfant nous en a fourni, écrivez-nous et nous les supprimerons."],
    },
    {
      heading: "Modifications",
      body: ["Si nous modifions cette politique, nous mettrons à jour la date ci-dessus et vous préviendrons par courriel en cas de changement important."],
    },
    {
      heading: "Contact",
      body: contact("Adresse postale communiquée sur demande par courriel"),
    },
  ],
});

const de = (): PrivacyPolicy => ({
  lang: "de",
  title: "Datenschutzerklärung",
  updated: `Zuletzt aktualisiert: ${UPDATED}`,
  intro:
    "Diese Erklärung beschreibt, welche Daten Chocobanana (thechocobananaclub.com und die Chocobanana-Apps für iOS und Android) erhebt, warum, wie lange wir sie speichern und welche Rechte du hast. Website und Apps nutzen dasselbe Kontosystem; die Erklärung gilt für beides.",
  sections: [
    {
      heading: "Verantwortlicher",
      body: [
        `Verantwortlich ist ${BUSINESS.tradeName}, betrieben von ${BUSINESS.sellerName} in ${BUSINESS.country}. Ansprechpartnerin für Datenschutz: ${BUSINESS.privacyOfficer}, ${BUSINESS.email}.`,
      ],
    },
    {
      heading: "Welche Daten wir erheben",
      body: [
        "Kontodaten, die du angibst: Vor- und Nachname, E-Mail, Telefonnummer, Lieferadresse und Passwort (nur als sicherer Hash gespeichert).",
        "Bestellungen: Artikel, Beträge, verwendete Adresse, Bestellnummer und Versandstatus. Bei Gastbestellungen speichern wir dieselben Bestelldaten ohne Konto.",
        "Zahlungen wickelt Stripe ab. Wir sehen oder speichern nie deine vollständige Kartennummer; wir erhalten das Zahlungsergebnis und eine Stripe-Kundenreferenz.",
        "Nachrichten über das Kontakt- oder Widerrufsformular und deine E-Mail, wenn du den Newsletter abonnierst.",
        "In der App, nur wenn du Benachrichtigungen einschaltest: ein Geräte-Token, die Plattform und deine Sprache.",
        "Technisch notwendige Daten: gewählte Sprache und Währung, Anmeldesitzung (Cookies) und Warenkorb (auf deinem Gerät gespeichert). Unser Hoster speichert kurzzeitig Server-Logs (z. B. IP-Adresse, Browsertyp) zur Sicherheit.",
      ],
    },
    {
      heading: "Zwecke und Rechtsgrundlagen",
      body: [
        "Bestellungen annehmen, liefern und betreuen sowie dein Konto verwalten (Vertragserfüllung, Art. 6 Abs. 1 lit. b DSGVO).",
        "Bestell- und Konto-E-Mails wie Bestätigung, Rechnung, Verifizierung und Passwort-Zurücksetzung (Art. 6 Abs. 1 lit. b DSGVO).",
        "Buchhaltungs- und Steueraufzeichnungen (rechtliche Pflicht, Art. 6 Abs. 1 lit. c DSGVO).",
        "Schutz der Website und Betrugsvermeidung (berechtigtes Interesse, Art. 6 Abs. 1 lit. f DSGVO).",
        "Newsletter nur nach Einwilligung und Bestätigung deiner E-Mail (Art. 6 Abs. 1 lit. a DSGVO). Du kannst sie jederzeit über den Abmeldelink widerrufen.",
        "Wir verkaufen oder vermieten deine Daten nicht, geben sie nicht für Werbung weiter und nutzen keine Werbe- oder Analyse-Tracker.",
      ],
    },
    {
      heading: "Cookies",
      body: [
        "Wir verwenden nur technisch notwendige Cookies: Sprache und Währung, Anmeldesitzung und Sicherheitsprüfungen. Wir nutzen keine Werbe-, Analyse- oder Social-Media-Cookies und fragen deshalb keine Cookie-Einwilligung ab. Dein Warenkorb liegt im Speicher deines Browsers.",
      ],
    },
    {
      heading: "Empfänger",
      body: [
        `Dienstleister, die den Shop für uns betreiben: ${PROVIDERS}. Sie dürfen deine Daten nur zur Erbringung ihres Dienstes für uns nutzen.`,
        "Postdienste erhalten Name und Adresse auf dem Umschlag. Wenn das Gesetz es verlangt, können wir Daten herausgeben.",
      ],
    },
    {
      heading: "Übermittlung in Drittländer",
      body: [
        "Wir sitzen in Kanada, für das ein Angemessenheitsbeschluss der EU besteht. Unsere Dienstleister speichern Daten hauptsächlich in den USA und Kanada. Für die USA stützen wir uns auf das EU-US Data Privacy Framework, soweit der Anbieter zertifiziert ist, sonst auf EU-Standardvertragsklauseln.",
      ],
    },
    {
      heading: "Speicherdauer",
      body: [
        "Kontodaten speichern wir, solange dein Konto besteht. Bestell- und Rechnungsdaten bewahren wir so lange auf, wie das Steuerrecht es verlangt (in Kanada sechs Jahre), auch nach Löschung des Kontos, ohne Verbindung zum gelöschten Konto.",
        "Newsletter-Daten bis zur Abmeldung; Kontakt- und Widerrufsnachrichten bis zu zwei Jahre.",
      ],
    },
    {
      heading: "Sicherheit",
      body: [
        "Verschlüsselte Verbindungen (HTTPS), gehashte Passwörter und Zugriff nur durch die Shop-Inhaberin. Führt eine Datenpanne zu einem hohen Risiko, informieren wir dich und die zuständige Behörde wie gesetzlich vorgeschrieben.",
      ],
    },
    {
      heading: "Deine Rechte",
      body: [
        "Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit und Widerspruch sowie auf Widerruf einer Einwilligung jederzeit.",
        "Profil und Adresse kannst du unter Mein Konto ändern und dein Konto unter Mein Konto → Kontoeinstellungen → Konto löschen löschen.",
        "Für andere Anfragen schreib uns; wir antworten innerhalb von 30 Tagen.",
        "Du kannst dich bei einer Datenschutzaufsichtsbehörde beschweren, insbesondere in deinem Wohnsitzland.",
      ],
    },
    {
      heading: "Kinder",
      body: ["Chocobanana richtet sich nicht an Kinder unter 13 Jahren; wir erheben wissentlich keine Daten von ihnen. Wenn ein Kind uns Daten gegeben hat, schreib uns und wir löschen sie."],
    },
    {
      heading: "Änderungen",
      body: ["Bei Änderungen aktualisieren wir das Datum oben und informieren dich bei wesentlichen Änderungen per E-Mail."],
    },
    {
      heading: "Kontakt",
      body: contact("Postanschrift auf Anfrage per E-Mail"),
    },
  ],
});

export function getPrivacyPolicy(locale: string): PrivacyPolicy {
  if (locale === "tr") return tr();
  if (locale === "fr") return fr();
  if (locale === "de") return de();
  return en();
}
