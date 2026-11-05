/**
 * Shipping Policy, Refund Policy and Accessibility Statement, with notes for
 * customers in Canada, the USA, the EU and Türkiye. Must stay consistent with
 * lib/legal/terms.ts. Not legal advice. Other locales show English.
 */
import { BUSINESS } from "@/lib/legal/business";
import type { LegalDoc } from "@/lib/legal/terms";

type Lang = "en" | "tr" | "fr" | "de";
const UPDATED = "2026-11-05";

function pick(locale: string): Lang {
  return locale === "tr" || locale === "fr" || locale === "de" ? locale : "en";
}

const updatedLabel: Record<Lang, string> = {
  en: "Last updated",
  tr: "Son güncelleme",
  fr: "Dernière mise à jour",
  de: "Zuletzt aktualisiert",
};

/* ---------------------------------------------------------------- shipping */

const shipping: Record<Lang, Omit<LegalDoc, "lang" | "updated">> = {
  en: {
    title: "Shipping Policy",
    intro: "How and when your mail travels, what it costs, and what happens if it gets lost.",
    sections: [
      { heading: "Where we ship", body: ["Canada, the United States, Australia, France, Germany and Türkiye. We do not ship to the United Kingdom for now."] },
      { heading: "How we ship", body: ["Everything travels by standard letter mail with Canada Post and the local postal service of your country, usually without tracking."] },
      { heading: "When we mail", body: [
        "Sticker sheets: within 5 business days of your order.",
        "Snail Mail Club: envelopes are mailed during the first 10 days of each month. Orders paid by the 20th join that month's mailing; later orders start with the next month. One envelope per paid month.",
      ] },
      { heading: "How long it takes", body: [
        "Usual delivery time after mailing: Canada 2–9 business days, United States 6–12 business days, Australia, France, Germany and Türkiye 10–25 business days. Postal delays can happen, especially in December.",
      ] },
      { heading: "Shipping costs", body: [
        "Snail Mail Club prices include standard postage.",
        "Sticker sheets ship free within Canada. Postage of CA$1 per sheet to the USA and CA$2 per sheet to other countries is shown and added at checkout.",
      ] },
      { heading: "Customs, duties and taxes", body: [
        "Orders sent outside Canada may be charged import taxes, duties or a postal handling fee by the destination country. We cannot calculate these in advance; they are paid by the recipient and are not included in our prices.",
      ] },
      { heading: "Lost or damaged mail", body: [
        "If your mail has not arrived 30 days after mailing (45 days outside Canada and the USA), or arrives damaged, email us with your order number. We will send a replacement or give you a full refund.",
        "Please double-check your address at checkout. If an address was entered incorrectly we will still try to help, but we may not be able to replace the item for free.",
      ] },
      { heading: "Canada", body: [
        "If we do not deliver within 30 days of the delivery date we gave you, you may cancel and receive a full refund, as provided by provincial consumer protection law.",
      ] },
      { heading: "United States", body: [
        "We only promise mailing times we can meet. If we cannot mail your order on time, we will tell you, give a new date, and let you cancel for a prompt full refund, as required by the FTC Mail, Internet or Telephone Order Merchandise Rule. Since 2025 the US may charge duties on low-value parcels; these are paid by the recipient.",
      ] },
      { heading: "European Union", body: [
        "Goods arrive from outside the EU, so VAT on import is collected on delivery by the postal service, usually with a small handling fee. The goods are at our risk until they reach you.",
      ] },
      { heading: "Türkiye", body: [
        "Parcels arrive from abroad, so customs duty and a postal handling fee may be charged on arrival; these are paid by the recipient. If we cannot deliver within 30 days, we tell you and, if you wish, refund you in full within 14 days.",
      ] },
    ],
  },
  tr: {
    title: "Kargo Politikası",
    intro: "Postanın nasıl ve ne zaman yola çıktığı, ücreti ve kaybolursa ne olacağı.",
    sections: [
      { heading: "Nereye gönderiyoruz", body: ["Kanada, ABD, Avustralya, Fransa, Almanya ve Türkiye. Şimdilik Birleşik Krallık'a gönderim yapmıyoruz."] },
      { heading: "Nasıl gönderiyoruz", body: ["Tüm gönderiler Canada Post ve ülkendeki posta hizmetiyle standart mektup postası olarak, genellikle takip numarasız gider."] },
      { heading: "Ne zaman postalıyoruz", body: [
        "Sticker sayfaları: siparişten sonraki 5 iş günü içinde.",
        "Snail Mail Club: zarflar her ayın ilk 10 gününde postalanır. Ayın 20'sine kadar ödenen siparişler o ayın gönderimine katılır; sonrakiler bir sonraki aydan başlar. Ödenen her ay için bir zarf.",
      ] },
      { heading: "Ne kadar sürer", body: [
        "Postalamadan sonra olağan süre: Kanada 2–9 iş günü, ABD 6–12 iş günü, Avustralya, Fransa, Almanya ve Türkiye 10–25 iş günü. Özellikle Aralık'ta gecikme olabilir.",
      ] },
      { heading: "Gönderim ücreti", body: [
        "Snail Mail Club fiyatlarına standart posta dahildir.",
        "Sticker sayfaları Kanada içinde ücretsizdir. ABD için sayfa başı CA$1, diğer ülkeler için sayfa başı CA$2 posta ücreti ödeme sırasında gösterilir ve eklenir.",
      ] },
      { heading: "Gümrük ve vergiler", body: [
        "Kanada dışına giden siparişlerde varış ülkesi ithalat vergisi, gümrük veya posta işlem ücreti alabilir. Bunları önceden hesaplayamayız; alıcı öder ve fiyatlarımıza dahil değildir.",
      ] },
      { heading: "Kaybolan veya hasarlı posta", body: [
        "Postalamadan 30 gün sonra (Kanada ve ABD dışında 45 gün) ulaşmadıysa veya hasarlı geldiyse sipariş numaranla bize yaz. Yenisini göndeririz ya da tamamını iade ederiz.",
        "Lütfen adresini ödeme sırasında kontrol et. Yanlış girilen adreslerde yine yardım etmeye çalışırız ama ücretsiz yenisini gönderemeyebiliriz.",
      ] },
      { heading: "Kanada", body: [
        "Bildirdiğimiz teslim tarihinden sonraki 30 gün içinde teslim edemezsek, eyalet tüketici yasası gereği siparişi iptal edip tam iade alabilirsin.",
      ] },
      { heading: "ABD", body: [
        "Sadece uyabileceğimiz postalama sürelerini söylüyoruz. Siparişini zamanında postalayamazsak haber verir, yeni tarih bildirir ve FTC kuralı gereği iptal edip hızlıca tam iade almana izin veririz. 2025'ten beri ABD düşük değerli paketlerden de gümrük alabilir; bunu alıcı öder.",
      ] },
      { heading: "Avrupa Birliği", body: [
        "Ürünler AB dışından geldiği için ithalat KDV'si teslimatta posta hizmeti tarafından, genellikle küçük bir işlem ücretiyle alınır. Ürün sana ulaşana kadar risk bize aittir.",
      ] },
      { heading: "Türkiye", body: [
        "Gönderiler yurt dışından geldiği için gümrük vergisi ve posta işlem ücreti alınabilir; bunlar alıcıya aittir. 30 gün içinde teslim edemezsek sana haber verir ve istersen ödemenin tamamını 14 gün içinde iade ederiz.",
      ] },
    ],
  },
  fr: {
    title: "Politique de livraison",
    intro: "Comment et quand votre courrier voyage, ce qu'il coûte, et ce qui se passe s'il se perd.",
    sections: [
      { heading: "Où nous livrons", body: ["Canada, États-Unis, Australie, France, Allemagne et Turquie. Nous ne livrons pas au Royaume-Uni pour le moment."] },
      { heading: "Comment nous expédions", body: ["Tout voyage par courrier standard avec Postes Canada et le service postal de votre pays, généralement sans suivi."] },
      { heading: "Quand nous postons", body: [
        "Planches de stickers : dans les 5 jours ouvrables suivant la commande.",
        "Snail Mail Club : les enveloppes sont postées pendant les 10 premiers jours du mois. Les commandes payées au plus tard le 20 rejoignent l'envoi du mois ; les suivantes commencent le mois suivant. Une enveloppe par mois payé.",
      ] },
      { heading: "Délais", body: [
        "Délai habituel après l'envoi : Canada 2 à 9 jours ouvrables, États-Unis 6 à 12, Australie, France, Allemagne et Turquie 10 à 25. Des retards postaux sont possibles, surtout en décembre.",
      ] },
      { heading: "Frais de livraison", body: [
        "Les forfaits Snail Mail Club incluent l'affranchissement standard.",
        "Les planches de stickers sont livrées gratuitement au Canada. Un affranchissement de 1 $ CA par planche vers les États-Unis et de 2 $ CA vers les autres pays est affiché et ajouté au paiement.",
      ] },
      { heading: "Douane, droits et taxes", body: [
        "Hors du Canada, le pays de destination peut percevoir des taxes, droits ou frais de traitement. Nous ne pouvons pas les calculer à l'avance ; ils sont à la charge du destinataire et ne sont pas inclus dans nos prix.",
      ] },
      { heading: "Courrier perdu ou endommagé", body: [
        "Si votre envoi n'est pas arrivé 30 jours après l'expédition (45 jours hors Canada et États-Unis) ou arrive endommagé, écrivez-nous avec votre numéro de commande : nous renvoyons l'article ou vous remboursons intégralement.",
        "Vérifiez votre adresse au paiement. En cas d'adresse mal saisie, nous essaierons d'aider, sans pouvoir toujours remplacer gratuitement.",
      ] },
      { heading: "Canada", body: [
        "Si nous ne livrons pas dans les 30 jours suivant la date de livraison annoncée, vous pouvez annuler et être remboursé intégralement, comme le prévoit la loi provinciale sur la protection du consommateur (y compris au Québec).",
      ] },
      { heading: "États-Unis", body: [
        "Si nous ne pouvons pas poster à temps, nous vous prévenons, donnons une nouvelle date et vous permettons d'annuler avec remboursement rapide, conformément à la règle de la FTC. Depuis 2025, les États-Unis peuvent percevoir des droits sur les petits colis, à la charge du destinataire.",
      ] },
      { heading: "Union européenne", body: [
        "Les articles proviennent de l'extérieur de l'UE : la TVA à l'importation est perçue à la livraison par le service postal, généralement avec de petits frais de traitement. Les marchandises voyagent à nos risques jusqu'à leur réception.",
      ] },
      { heading: "Turquie", body: [
        "Des droits de douane et frais postaux peuvent être perçus à l'arrivée, à la charge du destinataire. Si nous ne pouvons pas livrer sous 30 jours, nous vous prévenons et pouvons vous rembourser intégralement sous 14 jours.",
      ] },
    ],
  },
  de: {
    title: "Versandrichtlinie",
    intro: "Wie und wann deine Post reist, was sie kostet und was passiert, wenn sie verloren geht.",
    sections: [
      { heading: "Wohin wir liefern", body: ["Kanada, USA, Australien, Frankreich, Deutschland und Türkei. In das Vereinigte Königreich liefern wir derzeit nicht."] },
      { heading: "Wie wir versenden", body: ["Alles reist als Standardbrief mit Canada Post und dem Postdienst deines Landes, meist ohne Sendungsverfolgung."] },
      { heading: "Wann wir versenden", body: [
        "Stickerbögen: innerhalb von 5 Werktagen nach der Bestellung.",
        "Snail Mail Club: Umschläge gehen in den ersten 10 Tagen jedes Monats raus. Bis zum 20. bezahlte Bestellungen sind im selben Monat dabei; spätere beginnen im Folgemonat. Ein Umschlag pro bezahltem Monat.",
      ] },
      { heading: "Laufzeiten", body: [
        "Übliche Laufzeit nach Versand: Kanada 2–9 Werktage, USA 6–12, Australien, Frankreich, Deutschland und Türkei 10–25. Postverzögerungen sind möglich, besonders im Dezember.",
      ] },
      { heading: "Versandkosten", body: [
        "Snail Mail Club Preise enthalten Standardporto.",
        "Stickerbögen werden innerhalb Kanadas kostenlos versandt. Porto von CA$1 pro Bogen in die USA und CA$2 pro Bogen in andere Länder wird beim Bezahlen angezeigt und hinzugefügt.",
      ] },
      { heading: "Zoll und Einfuhrabgaben", body: [
        "Außerhalb Kanadas kann das Zielland Einfuhrumsatzsteuer, Zölle oder eine Postgebühr erheben. Diese können wir vorab nicht berechnen; sie trägt der Empfänger und sie sind nicht in unseren Preisen enthalten.",
      ] },
      { heading: "Verlorene oder beschädigte Post", body: [
        "Ist deine Sendung 30 Tage nach Versand (45 Tage außerhalb Kanadas und der USA) nicht angekommen oder beschädigt, schreib uns mit deiner Bestellnummer: Wir senden Ersatz oder erstatten den vollen Betrag.",
        "Bitte prüfe deine Adresse beim Bezahlen. Bei falsch eingegebenen Adressen helfen wir gern, können aber nicht immer kostenlos Ersatz senden.",
      ] },
      { heading: "Kanada", body: [
        "Liefern wir nicht innerhalb von 30 Tagen nach dem angegebenen Liefertermin, kannst du nach provinziellem Verbraucherschutzrecht stornieren und erhältst den vollen Betrag zurück.",
      ] },
      { heading: "USA", body: [
        "Können wir nicht rechtzeitig versenden, informieren wir dich, nennen einen neuen Termin und ermöglichen eine Stornierung mit schneller Erstattung gemäß der FTC-Regel. Seit 2025 können die USA auch auf kleine Pakete Zölle erheben; diese trägt der Empfänger.",
      ] },
      { heading: "Europäische Union", body: [
        "Die Ware kommt von außerhalb der EU, daher wird die Einfuhrumsatzsteuer bei Zustellung vom Postdienst erhoben, meist mit einer kleinen Bearbeitungsgebühr. Bis zur Übergabe an dich tragen wir das Versandrisiko.",
      ] },
      { heading: "Türkei", body: [
        "Bei Ankunft können Zoll- und Postgebühren anfallen, die der Empfänger trägt. Können wir nicht innerhalb von 30 Tagen liefern, informieren wir dich und erstatten auf Wunsch den vollen Betrag innerhalb von 14 Tagen.",
      ] },
    ],
  },
};

/* ------------------------------------------------------------------ refund */

const MODEL_FORM_EN =
  "Model withdrawal form (EU): To " + BUSINESS.tradeName + ", " + BUSINESS.email + ": I/We hereby give notice that I/We withdraw from my/our contract of sale of the following goods: … Ordered on / received on: … Name: … Address: … Date: …";

const refund: Record<Lang, Omit<LegalDoc, "lang" | "updated">> = {
  en: {
    title: "Refund Policy",
    intro: "Our promise is simple: every customer, wherever they live, can change their mind within 14 days. Below are the details and the extra rights that apply in your region.",
    sections: [
      { heading: "14 days to change your mind (everyone)", body: [
        "Sticker sheets: cancel within 14 days of receiving them. Send them back unused within 14 days of cancelling.",
        "Snail Mail Club: cancel within 14 days of paying for a full refund of every month not yet mailed. Envelopes received during those 14 days can be returned unused for a refund of that month.",
      ] },
      { heading: "Stopping a Club package later", body: [
        "After 14 days you can still stop a Club package at any time. We refund every month that has not been mailed yet (package price divided by the number of months). Packages never renew automatically.",
      ] },
      { heading: "How to cancel", body: [
        "Use the \"Withdraw from contract here\" button at the bottom of every page, or email " + BUSINESS.email + " with your name and order number. You do not need to give a reason. We confirm receipt by email.",
      ] },
      { heading: "How you are refunded", body: [
        "We refund within 14 days of your cancellation, to your original payment method, including the standard postage you paid. For items you send back we may wait until they arrive or you show proof of mailing. There is no restocking fee.",
        "Return postage for unwanted items is paid by you, except in Türkiye (see below) or when an item was faulty or wrong.",
      ] },
      { heading: "Faulty, damaged, wrong or lost", body: [
        "Tell us within 30 days of receiving it (or of the expected delivery), with a photo if you can. We replace it or refund you in full, including postage. These rights are in addition to your legal warranties.",
      ] },
      { heading: "Canada", body: [
        "You may also cancel under provincial law, for example if the required information was not given to you before you ordered (within 7 days of receiving your copy), if you did not receive a copy of the agreement within 15 days (within 30 days), or if goods were not delivered within 30 days of the promised date. If we do not refund within 15 days of such a cancellation, you can ask your credit card issuer to reverse the charge.",
      ] },
      { heading: "United States", body: [
        "This policy gives you more than US law requires. If we cannot ship on time we will offer you the choice to cancel for a prompt refund. You can also dispute a charge with your card issuer under the Fair Credit Billing Act.",
      ] },
      { heading: "European Union", body: [
        "You have a statutory right to withdraw within 14 days without giving any reason. The period starts on the day you (or someone you name) receive the goods; for Club packages, on the day of the contract. We refund all payments, including standard delivery costs, within 14 days of receiving your notice. You are only liable for any loss in value caused by handling beyond what is needed to check the goods.",
        MODEL_FORM_EN,
      ] },
      { heading: "Türkiye", body: [
        "6502 sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca 14 gün içinde gerekçe göstermeden cayma hakkın vardır. Cayma bildiriminden itibaren 14 gün içinde ödemenin tamamını iade ederiz. Ürünü cayma bildiriminden sonraki 14 gün içinde geri göndermen yeterlidir; iade posta masrafını biz karşılarız.",
      ] },
    ],
  },
  tr: {
    title: "İade Politikası",
    intro: "Sözümüz basit: nerede yaşarsan yaşa, 14 gün içinde fikrini değiştirebilirsin. Ayrıntılar ve bölgene özel ek haklar aşağıda.",
    sections: [
      { heading: "Herkes için 14 gün", body: [
        "Sticker sayfaları: teslim aldıktan sonraki 14 gün içinde iptal et; iptalden sonraki 14 gün içinde kullanılmamış olarak geri gönder.",
        "Snail Mail Club: ödemeden sonraki 14 gün içinde iptal edersen henüz postalanmamış her ayın tamamını iade ederiz. Bu 14 gün içinde aldığın zarfları kullanılmadan geri gönderirsen o ayın ücretini de iade ederiz.",
      ] },
      { heading: "Kulüp paketini sonra durdurmak", body: [
        "14 günden sonra da Kulüp paketini istediğin zaman durdurabilirsin. Henüz postalanmamış ayların ücretini (paket fiyatı ÷ ay sayısı) iade ederiz. Paketler hiçbir zaman otomatik yenilenmez.",
      ] },
      { heading: "Nasıl iptal edilir", body: [
        "Her sayfanın altındaki \"Sözleşmeden cayma\" butonunu kullan veya adın ve sipariş numaranla " + BUSINESS.email + " adresine yaz. Gerekçe göstermen gerekmez. Talebini e-postayla onaylarız.",
      ] },
      { heading: "İade nasıl yapılır", body: [
        "İptalinden itibaren 14 gün içinde, ödediğin standart posta dahil, ödeme yaptığın yönteme iade ederiz. Geri gönderilen ürünlerde ürün bize ulaşana veya gönderim belgesini paylaşana kadar bekleyebiliriz. Ek ücret alınmaz.",
        "İstenmeyen ürünlerin iade postası sana aittir; Türkiye'de (aşağıya bak) veya ürün kusurlu ya da yanlışsa bize aittir.",
      ] },
      { heading: "Kusurlu, hasarlı, yanlış veya kayıp", body: [
        "Teslimden (veya beklenen teslimattan) sonraki 30 gün içinde, mümkünse fotoğrafla bildir. Yenisini göndeririz veya posta dahil tamamını iade ederiz. Bu hakların yasal garantilerine ektir.",
      ] },
      { heading: "Kanada", body: [
        "Eyalet yasaları gereği de iptal edebilirsin: örneğin sipariş öncesinde gerekli bilgiler verilmediyse (kopyanı aldıktan sonraki 7 gün içinde), sözleşme kopyası 15 gün içinde gönderilmediyse (30 gün içinde) veya ürün söz verilen tarihten sonraki 30 gün içinde teslim edilmediyse. Böyle bir iptalden sonra 15 gün içinde iade etmezsek kart şirketinden ödemenin geri alınmasını isteyebilirsin.",
      ] },
      { heading: "ABD", body: [
        "Bu politika ABD yasasının istediğinden fazlasını verir. Zamanında gönderemezsek iptal edip hızlıca iade alma seçeneği sunarız. Ayrıca kart şirketine itiraz hakkın vardır.",
      ] },
      { heading: "Avrupa Birliği", body: [
        "14 gün içinde gerekçe göstermeden yasal cayma hakkın vardır. Süre ürünü teslim aldığın gün, Kulüp paketlerinde sözleşme günü başlar. Bildirimini aldıktan sonraki 14 gün içinde standart teslimat dahil tüm ödemeleri iade ederiz. Yalnızca ürünü incelemek için gerekenden fazla kullanımın yol açtığı değer kaybından sorumlusun.",
        MODEL_FORM_EN,
      ] },
      { heading: "Türkiye", body: [
        "6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca, ürünü teslim aldığın tarihten (Kulüp paketlerinde sözleşme tarihinden) itibaren 14 gün içinde gerekçe göstermeden ve cezai şart ödemeden cayma hakkın vardır. Cayma bildirimimize ulaştığı tarihten itibaren 14 gün içinde ödemenin tamamını, ödeme yaptığın yöntemle iade ederiz. Ürünü cayma bildiriminden sonraki 14 gün içinde geri göndermen yeterlidir; iade posta masrafını biz karşılarız. Şikâyetlerin için Tüketici Hakem Heyetlerine veya Tüketici Mahkemelerine başvurabilirsin.",
      ] },
    ],
  },
  fr: {
    title: "Politique de remboursement",
    intro: "Notre engagement est simple : où que vous viviez, vous pouvez changer d'avis dans les 14 jours. Voici les détails et les droits supplémentaires de votre région.",
    sections: [
      { heading: "14 jours pour changer d'avis (pour tous)", body: [
        "Planches de stickers : annulez dans les 14 jours suivant la réception et renvoyez-les inutilisées dans les 14 jours suivant l'annulation.",
        "Snail Mail Club : annulez dans les 14 jours suivant le paiement pour un remboursement de chaque mois non posté. Les enveloppes reçues pendant ces 14 jours peuvent être renvoyées inutilisées pour le remboursement du mois concerné.",
      ] },
      { heading: "Arrêter un forfait plus tard", body: [
        "Après 14 jours, vous pouvez toujours arrêter un forfait. Nous remboursons les mois non encore postés (prix du forfait divisé par le nombre de mois). Les forfaits ne se renouvellent jamais automatiquement.",
      ] },
      { heading: "Comment annuler", body: [
        "Utilisez le bouton « Se rétracter du contrat ici » en bas de chaque page, ou écrivez à " + BUSINESS.email + " avec votre nom et votre numéro de commande. Aucun motif n'est nécessaire. Nous accusons réception par courriel.",
      ] },
      { heading: "Comment vous êtes remboursé", body: [
        "Nous remboursons dans les 14 jours suivant votre annulation, sur votre moyen de paiement d'origine, y compris l'affranchissement standard payé. Pour les articles renvoyés, nous pouvons attendre leur réception ou une preuve d'envoi. Aucuns frais de restockage.",
        "Les frais de retour d'articles non désirés sont à votre charge, sauf en Turquie ou si l'article était défectueux ou erroné.",
      ] },
      { heading: "Défectueux, endommagé, erroné ou perdu", body: [
        "Prévenez-nous dans les 30 jours suivant la réception (ou la livraison prévue), avec une photo si possible. Nous remplaçons ou remboursons intégralement, port compris. Ces droits s'ajoutent à vos garanties légales.",
      ] },
      { heading: "Canada", body: [
        "Vous pouvez aussi annuler en vertu de la loi provinciale, par exemple si les renseignements exigés ne vous ont pas été fournis avant la commande, si vous n'avez pas reçu copie du contrat dans les 15 jours, ou si les biens n'ont pas été livrés dans les 30 jours suivant la date prévue. Au Québec, la Loi sur la protection du consommateur vous permet alors de demander à l'émetteur de votre carte d'annuler le paiement si nous ne remboursons pas dans les 15 jours.",
      ] },
      { heading: "États-Unis", body: [
        "Cette politique va au-delà du droit américain. Si nous ne pouvons pas expédier à temps, nous vous proposons d'annuler avec remboursement rapide. Vous pouvez aussi contester un débit auprès de l'émetteur de votre carte.",
      ] },
      { heading: "Union européenne", body: [
        "Vous disposez d'un droit légal de rétractation de 14 jours sans motif. Le délai court à compter de la réception des biens ; pour un forfait du Club, à compter de la conclusion du contrat. Nous remboursons tous les paiements, frais de livraison standard compris, dans les 14 jours suivant votre notification. Vous n'êtes responsable que de la dépréciation résultant de manipulations au-delà de ce qui est nécessaire pour examiner les biens.",
        "Modèle de formulaire de rétractation : À l'attention de " + BUSINESS.tradeName + ", " + BUSINESS.email + " : Je vous notifie par la présente ma rétractation du contrat portant sur la vente du bien ci-dessous : … Commandé le / reçu le : … Nom : … Adresse : … Date : …",
      ] },
      { heading: "Turquie", body: [
        "Selon la loi turque n° 6502, vous disposez de 14 jours pour vous rétracter sans motif. Nous remboursons intégralement sous 14 jours et prenons en charge les frais de retour.",
      ] },
    ],
  },
  de: {
    title: "Rückerstattungsrichtlinie",
    intro: "Unser Versprechen ist einfach: Egal wo du wohnst, du kannst es dir 14 Tage lang anders überlegen. Hier sind die Details und die zusätzlichen Rechte in deiner Region.",
    sections: [
      { heading: "14 Tage Bedenkzeit (für alle)", body: [
        "Stickerbögen: Widerruf innerhalb von 14 Tagen nach Erhalt; Rücksendung unbenutzt innerhalb von 14 Tagen nach dem Widerruf.",
        "Snail Mail Club: Widerruf innerhalb von 14 Tagen nach Zahlung; wir erstatten jeden noch nicht verschickten Monat. Innerhalb dieser 14 Tage erhaltene Umschläge können unbenutzt zurückgesendet werden; dann erstatten wir auch diesen Monat.",
      ] },
      { heading: "Club-Paket später beenden", body: [
        "Auch nach 14 Tagen kannst du ein Club-Paket jederzeit beenden. Wir erstatten die noch nicht verschickten Monate (Paketpreis geteilt durch die Anzahl der Monate). Pakete verlängern sich nie automatisch.",
      ] },
      { heading: "So widerrufst du", body: [
        "Nutze den Button „Vertrag hier widerrufen“ unten auf jeder Seite oder schreib an " + BUSINESS.email + " mit Name und Bestellnummer. Ein Grund ist nicht nötig. Wir bestätigen den Eingang per E-Mail.",
      ] },
      { heading: "So wird erstattet", body: [
        "Wir erstatten innerhalb von 14 Tagen nach deinem Widerruf über dein ursprüngliches Zahlungsmittel, einschließlich des bezahlten Standardportos. Bei Rücksendungen können wir warten, bis die Ware ankommt oder du den Versand nachweist. Keine Bearbeitungsgebühr.",
        "Die Rücksendekosten für nicht gewünschte Artikel trägst du, außer in der Türkei oder wenn der Artikel fehlerhaft oder falsch war.",
      ] },
      { heading: "Fehlerhaft, beschädigt, falsch oder verloren", body: [
        "Melde dich innerhalb von 30 Tagen nach Erhalt (oder erwarteter Lieferung), wenn möglich mit Foto. Wir ersetzen oder erstatten vollständig, inklusive Porto. Deine gesetzlichen Gewährleistungsrechte bleiben unberührt.",
      ] },
      { heading: "Kanada", body: [
        "Nach provinziellem Recht kannst du zusätzlich stornieren, etwa wenn dir vorgeschriebene Informationen fehlten, du innerhalb von 15 Tagen keine Vertragskopie erhalten hast oder die Ware nicht innerhalb von 30 Tagen nach dem zugesagten Termin geliefert wurde.",
      ] },
      { heading: "USA", body: [
        "Diese Richtlinie geht über das US-Recht hinaus. Können wir nicht rechtzeitig versenden, bieten wir dir die Stornierung mit schneller Erstattung an.",
      ] },
      { heading: "Europäische Union – Widerrufsbelehrung", body: [
        "Widerrufsrecht: Du hast das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem du oder ein von dir benannter Dritter, der nicht der Beförderer ist, die Waren in Besitz genommen hast bzw. hat; bei Club-Paketen ab dem Tag des Vertragsschlusses.",
        "Um dein Widerrufsrecht auszuüben, musst du uns (" + BUSINESS.tradeName + ", " + BUSINESS.sellerName + ", " + (BUSINESS.mailingAddress || "Postanschrift auf Anfrage") + ", Tel. " + (BUSINESS.phone || "–") + ", " + BUSINESS.email + ") mittels einer eindeutigen Erklärung (z. B. per E-Mail oder über den Widerrufs-Button) über deinen Entschluss informieren. Zur Wahrung der Frist reicht die rechtzeitige Absendung.",
        "Folgen des Widerrufs: Wir zahlen dir alle Zahlungen, einschließlich der Standard-Lieferkosten, unverzüglich und spätestens binnen vierzehn Tagen ab Eingang deines Widerrufs zurück, über dasselbe Zahlungsmittel. Wir können die Rückzahlung verweigern, bis wir die Waren zurückerhalten haben oder du den Nachweis der Rücksendung erbracht hast. Du trägst die unmittelbaren Kosten der Rücksendung. Für einen Wertverlust musst du nur aufkommen, wenn er auf einen zur Prüfung nicht notwendigen Umgang zurückzuführen ist.",
        "Muster-Widerrufsformular: An " + BUSINESS.tradeName + ", " + BUSINESS.email + ": Hiermit widerrufe(n) ich/wir den von mir/uns abgeschlossenen Vertrag über den Kauf der folgenden Waren: … Bestellt am / erhalten am: … Name: … Anschrift: … Datum: …",
      ] },
      { heading: "Türkei", body: [
        "Nach türkischem Recht (Gesetz Nr. 6502) hast du 14 Tage Widerrufsrecht ohne Angabe von Gründen. Wir erstatten vollständig innerhalb von 14 Tagen und übernehmen die Rücksendekosten.",
      ] },
    ],
  },
};

/* ----------------------------------------------------------- accessibility */

const accessibility: Record<Lang, Omit<LegalDoc, "lang" | "updated">> = {
  en: {
    title: "Accessibility Statement",
    intro: "We want everyone to be able to browse and buy from Chocobanana, including people who use assistive technology.",
    sections: [
      { heading: "Our goal", body: [
        "We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1 at level AA on our website and apps.",
      ] },
      { heading: "What we do", body: [
        "Text alternatives for product and decorative images, readable colour contrast, keyboard navigation with visible focus, page structure with headings and landmarks, text that can be enlarged, reduced motion when your device asks for it, and labelled form fields.",
        "The site is available in ten languages, including English and French.",
      ] },
      { heading: "Known limitations", body: [
        "Some product photos show small printed text that is not fully described in words. The payment page is provided by Stripe and follows Stripe's own accessibility standards.",
      ] },
      { heading: "Need help or another format?", body: [
        "If anything is hard to use, contact us and we will help you place your order another way, by email or phone, or send information in a format that works for you.",
        "Email: " + BUSINESS.email + (BUSINESS.phone ? " · Telephone: " + BUSINESS.phone : ""),
        "We reply to accessibility feedback within 5 business days.",
      ] },
      { heading: "Laws we follow", body: [
        "Canada: the Accessibility for Ontarians with Disabilities Act (AODA) customer service standard and Quebec accessibility expectations. USA: we aim for an accessible experience consistent with the Americans with Disabilities Act. EU: the European Accessibility Act principles. Türkiye: we welcome accessibility feedback in Turkish.",
      ] },
    ],
  },
  tr: {
    title: "Erişilebilirlik Beyanı",
    intro: "Yardımcı teknoloji kullananlar dahil herkesin Chocobanana'da gezinebilmesini ve alışveriş yapabilmesini istiyoruz.",
    sections: [
      { heading: "Hedefimiz", body: ["Web sitemizde ve uygulamalarımızda WCAG 2.1 AA düzeyini karşılamayı hedefliyoruz."] },
      { heading: "Neler yapıyoruz", body: [
        "Görseller için metin açıklamaları, okunaklı renk kontrastı, görünür odakla klavye ile gezinme, başlık ve bölümlerle sayfa yapısı, büyütülebilir yazılar, cihazın isterse azaltılmış hareket ve etiketli form alanları.",
        "Site, Türkçe dahil on dilde kullanılabilir.",
      ] },
      { heading: "Bilinen sınırlamalar", body: [
        "Bazı ürün fotoğraflarındaki küçük yazılar metin olarak tam açıklanmamıştır. Ödeme sayfası Stripe tarafından sağlanır ve Stripe'ın erişilebilirlik standartlarına uyar.",
      ] },
      { heading: "Yardım veya başka bir format", body: [
        "Bir şeyi kullanmak zor gelirse bize yaz; siparişini e-posta veya telefonla vermene yardım eder ya da bilgiyi sana uygun bir formatta göndeririz.",
        "E-posta: " + BUSINESS.email + (BUSINESS.phone ? " · Telefon: " + BUSINESS.phone : ""),
        "Erişilebilirlik geri bildirimlerine 5 iş günü içinde yanıt veririz.",
      ] },
      { heading: "Uyduğumuz kurallar", body: [
        "Kanada: Ontario AODA müşteri hizmetleri standardı. ABD: ADA ile uyumlu erişilebilir bir deneyim hedefliyoruz. AB: Avrupa Erişilebilirlik Yasası ilkeleri. Türkiye: Türkçe erişilebilirlik geri bildirimlerini memnuniyetle alırız.",
      ] },
    ],
  },
  fr: {
    title: "Déclaration d'accessibilité",
    intro: "Nous voulons que chacun puisse naviguer et acheter sur Chocobanana, y compris les personnes qui utilisent des technologies d'assistance.",
    sections: [
      { heading: "Notre objectif", body: ["Nous visons la conformité aux Règles pour l'accessibilité des contenus Web (WCAG) 2.1, niveau AA, sur le site et les applications."] },
      { heading: "Ce que nous faisons", body: [
        "Textes de remplacement pour les images, contraste lisible, navigation au clavier avec focus visible, structure de titres et de régions, texte agrandissable, animations réduites si votre appareil le demande et champs de formulaire étiquetés.",
        "Le site est offert en dix langues, dont le français et l'anglais.",
      ] },
      { heading: "Limites connues", body: [
        "Certaines photos de produits contiennent de petits textes imprimés qui ne sont pas entièrement décrits. La page de paiement est fournie par Stripe et suit ses propres normes d'accessibilité.",
      ] },
      { heading: "Besoin d'aide ou d'un autre format ?", body: [
        "Si quelque chose est difficile à utiliser, écrivez-nous : nous vous aiderons à commander par courriel ou téléphone, ou vous enverrons l'information dans un format adapté.",
        "Courriel : " + BUSINESS.email + (BUSINESS.phone ? " · Téléphone : " + BUSINESS.phone : ""),
        "Nous répondons sous 5 jours ouvrables.",
      ] },
      { heading: "Cadre applicable", body: [
        "Canada : norme de service à la clientèle de la LAPHO (Ontario) et attentes québécoises en matière d'accessibilité. États-Unis : expérience accessible conforme à l'esprit de l'ADA. UE : principes de l'Acte européen sur l'accessibilité.",
      ] },
    ],
  },
  de: {
    title: "Erklärung zur Barrierefreiheit",
    intro: "Alle sollen Chocobanana nutzen und dort einkaufen können, auch mit assistiven Technologien.",
    sections: [
      { heading: "Unser Ziel", body: ["Wir streben die Konformität mit den WCAG 2.1, Stufe AA, auf Website und Apps an."] },
      { heading: "Was wir tun", body: [
        "Alternativtexte für Bilder, gut lesbarer Kontrast, Tastaturbedienung mit sichtbarem Fokus, Überschriften- und Bereichsstruktur, vergrößerbarer Text, reduzierte Bewegung auf Wunsch des Geräts und beschriftete Formularfelder.",
        "Die Website ist in zehn Sprachen verfügbar, darunter Deutsch.",
      ] },
      { heading: "Bekannte Einschränkungen", body: [
        "Manche Produktfotos zeigen kleinen gedruckten Text, der nicht vollständig beschrieben ist. Die Zahlungsseite stellt Stripe bereit; sie folgt Stripes eigenen Standards zur Barrierefreiheit.",
      ] },
      { heading: "Hilfe oder anderes Format", body: [
        "Wenn etwas schwer zu nutzen ist, schreib uns: Wir helfen dir, per E-Mail oder Telefon zu bestellen, oder senden Informationen in einem passenden Format.",
        "E-Mail: " + BUSINESS.email + (BUSINESS.phone ? " · Telefon: " + BUSINESS.phone : ""),
        "Wir antworten innerhalb von 5 Werktagen.",
      ] },
      { heading: "Rechtlicher Rahmen", body: [
        "EU: Grundsätze des European Accessibility Act (in Deutschland: Barrierefreiheitsstärkungsgesetz); als Kleinstunternehmen sind wir von einzelnen Pflichten ausgenommen, wollen aber trotzdem barrierefrei sein. Kanada: AODA-Kundendienststandard. USA: zugängliches Erlebnis im Sinne des ADA.",
      ] },
    ],
  },
};

function build(src: Record<Lang, Omit<LegalDoc, "lang" | "updated">>, locale: string): LegalDoc {
  const lang = pick(locale);
  return { ...src[lang], lang, updated: `${updatedLabel[lang]}: ${UPDATED}` };
}

export const getShippingPolicy = (locale: string) => build(shipping, locale);
export const getRefundPolicy = (locale: string) => build(refund, locale);
export const getAccessibilityStatement = (locale: string) => build(accessibility, locale);
