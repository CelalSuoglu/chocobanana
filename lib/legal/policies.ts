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
        "Usual delivery time after mailing: Canada 2–9 business days, United States 10–20 days, Europe (France, Germany), Türkiye and Australia up to 1 month. Postal delays can happen, especially in December.",
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
        "Postalamadan sonra olağan süre: Kanada 2–9 iş günü, ABD 10–20 gün, Avrupa (Fransa, Almanya), Türkiye ve Avustralya 1 aya kadar. Özellikle Aralık'ta gecikme olabilir.",
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
        "Délai habituel après l'envoi : Canada 2 à 9 jours ouvrables, États-Unis 10 à 20 jours, Europe (France, Allemagne), Turquie et Australie jusqu'à 1 mois. Des retards postaux sont possibles, surtout en décembre.",
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
        "Übliche Laufzeit nach Versand: Kanada 2–9 Werktage, USA 10–20 Tage, Europa (Frankreich, Deutschland), Türkei und Australien bis zu 1 Monat. Postverzögerungen sind möglich, besonders im Dezember.",
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

const refund: Record<Lang, Omit<LegalDoc, "lang" | "updated">> = {
  en: {
    title: "Refund Policy",
    intro: "All sales are final. We do not give refunds if you change your mind, except where the law of your country gives you that right. You are always protected if something goes wrong on our side.",
    sections: [
      { heading: "All sales are final", body: [
        "We do not accept returns or give refunds or exchanges if you change your mind about sticker sheets or a Snail Mail Club package. Please check your items, delivery country and address before paying.",
        "Snail Mail Club packages cannot be cancelled for a refund once paid. They never renew, so you are never charged again.",
      ] },
      { heading: "When we always replace or refund", body: [
        "An item is faulty, damaged in the mail or not what you ordered: tell us within 30 days of receiving it, with a photo if you can.",
        "Your mail has not arrived 30 days after mailing (45 days outside Canada and the USA), or we did not deliver within 30 days of the promised date.",
        "We cannot mail one or more months of your Club package: we refund those months.",
        "In these cases we send a replacement or refund you in full, including postage, to your original payment method within 15 days.",
      ] },
      { heading: "How to contact us", body: [
        "Email " + BUSINESS.email + (BUSINESS.phone ? " or call " + BUSINESS.phone : "") + " with your name and order number. Customers in the EU and Türkiye can also use the \"Withdraw from contract here\" button at the bottom of every page.",
      ] },
      { heading: "Canada", body: [
        "We are based in Quebec. Our final-sale rule does not limit the rights that cannot be waived under the Quebec Consumer Protection Act and similar provincial laws: the legal warranty that goods are fit for use and durable, and your right to cancel a distance contract if the required information was not given before you ordered (within 7 days of receiving your copy), if you did not receive a copy of the contract within 15 days (within 30 days), or if goods were not delivered within 30 days of the promised date. If we do not refund within 15 days of such a cancellation, you can ask your credit card issuer to reverse the charge.",
      ] },
      { heading: "United States", body: [
        "All sales are final. If we cannot ship within the time we stated, we will tell you and let you cancel for a prompt full refund, as the FTC Mail, Internet or Telephone Order Merchandise Rule requires. Your card dispute rights are not affected.",
      ] },
      { heading: "Australia", body: [
        "All sales are final for change of mind. Your rights under the Australian Consumer Law for items that are faulty or not as described are not affected.",
      ] },
      { heading: "European Union: 14-day right of withdrawal", body: [
        "EU law gives you a right to withdraw from this contract within 14 days without giving any reason, and our final-sale rule does not apply to you. The period starts on the day you (or someone you name, other than the carrier) receive the goods; for Club packages, on the day of the contract.",
        "To withdraw, use the \"Withdraw from contract here\" button or send us a clear statement by email. We refund all payments, including standard delivery costs, within 14 days of receiving your notice, to the same payment method. We may wait until we receive the goods or proof that you sent them back. You pay the direct cost of returning the goods and are only liable for loss in value caused by handling beyond what is needed to check them.",
        "Model withdrawal form: To " + BUSINESS.tradeName + ", " + BUSINESS.email + ": I/We hereby give notice that I/We withdraw from my/our contract of sale of the following goods: … Ordered on / received on: … Name: … Address: … Date: …",
      ] },
      { heading: "Türkiye", body: [
        "6502 sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca 14 gün içinde gerekçe göstermeden cayma hakkın vardır; \"iade yok\" kuralımız sana uygulanmaz. Ayrıntılar bu sayfanın Türkçe sürümündedir.",
      ] },
    ],
  },
  tr: {
    title: "İade Politikası",
    intro: "Tüm satışlar kesindir. Fikrini değiştirdiğinde iade yapmıyoruz; yalnızca yaşadığın ülkenin yasası bu hakkı veriyorsa iade ederiz. Bizden kaynaklı bir sorun olursa her zaman korunursun.",
    sections: [
      { heading: "Tüm satışlar kesindir", body: [
        "Sticker sayfaları veya Snail Mail Club paketi için fikrini değiştirirsen iade, değişim veya para iadesi yapmıyoruz. Lütfen ödemeden önce ürünleri, teslimat ülkesini ve adresini kontrol et.",
        "Snail Mail Club paketleri ödendikten sonra iade için iptal edilemez. Hiçbir zaman yenilenmez, tekrar ücret alınmaz.",
      ] },
      { heading: "Her zaman yenisini gönderdiğimiz veya iade ettiğimiz durumlar", body: [
        "Ürün kusurlu, postada hasar görmüş veya sipariş ettiğin ürün değil: teslimden sonraki 30 gün içinde, mümkünse fotoğrafla bildir.",
        "Postan postalamadan 30 gün sonra (Kanada ve ABD dışında 45 gün) ulaşmadı veya söz verdiğimiz tarihten sonraki 30 gün içinde teslim edemedik.",
        "Kulüp paketinin bir veya daha fazla ayını gönderemiyoruz: o ayları iade ederiz.",
        "Bu durumlarda yenisini göndeririz ya da posta dahil tamamını 15 gün içinde ödeme yaptığın yönteme iade ederiz.",
      ] },
      { heading: "Bize nasıl ulaşırsın", body: [
        "Adın ve sipariş numaranla " + BUSINESS.email + (BUSINESS.phone ? " adresine yaz veya " + BUSINESS.phone + " numarasını ara" : " adresine yaz") + ". AB ve Türkiye'deki müşteriler her sayfanın altındaki \"Sözleşmeden cayma\" butonunu da kullanabilir.",
      ] },
      { heading: "Kanada", body: [
        "Quebec merkezliyiz. \"İade yok\" kuralımız, Quebec Tüketiciyi Koruma Yasası ve benzer eyalet yasalarının vazgeçilemeyen haklarını sınırlamaz: ürünün kullanıma uygun ve dayanıklı olacağına dair yasal garanti ve mesafeli sözleşmeyi iptal hakkı (sipariş öncesi gerekli bilgiler verilmediyse kopyanı aldıktan sonra 7 gün içinde, sözleşme kopyası 15 gün içinde gönderilmediyse 30 gün içinde, ürün söz verilen tarihten sonraki 30 gün içinde teslim edilmediyse). Böyle bir iptalden sonra 15 gün içinde iade etmezsek kart şirketinden ödemenin geri alınmasını isteyebilirsin.",
      ] },
      { heading: "ABD", body: [
        "Tüm satışlar kesindir. Belirttiğimiz sürede gönderemezsek sana haber verir ve FTC kuralı gereği iptal edip hızlıca tam iade almana izin veririz. Kart itiraz hakların saklıdır.",
      ] },
      { heading: "Avustralya", body: [
        "Fikir değişikliğinde tüm satışlar kesindir. Kusurlu veya tarif edildiği gibi olmayan ürünler için Avustralya Tüketici Yasası haklarını etkilemez.",
      ] },
      { heading: "Avrupa Birliği: 14 günlük cayma hakkı", body: [
        "AB hukuku sana 14 gün içinde gerekçe göstermeden cayma hakkı verir; \"iade yok\" kuralımız sana uygulanmaz. Süre ürünü teslim aldığın gün, Kulüp paketlerinde sözleşme günü başlar.",
        "Cayma için \"Sözleşmeden cayma\" butonunu kullan veya bize açık bir e-posta gönder. Bildirimini aldıktan sonraki 14 gün içinde standart teslimat dahil tüm ödemeleri aynı yöntemle iade ederiz. Ürünü geri alana veya gönderim belgesini görene kadar bekleyebiliriz. İade postası sana aittir.",
      ] },
      { heading: "Türkiye: 14 günlük cayma hakkı", body: [
        "6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca, ürünü teslim aldığın tarihten (Kulüp paketlerinde sözleşme tarihinden) itibaren 14 gün içinde gerekçe göstermeden ve cezai şart ödemeden cayma hakkın vardır; \"iade yok\" kuralımız sana uygulanmaz.",
        "Cayma için \"Sözleşmeden cayma\" butonunu kullan veya bize yaz. Bildirimin bize ulaştıktan sonraki 14 gün içinde ödemenin tamamını iade ederiz. Ürünü cayma bildiriminden sonraki 10 gün içinde geri göndermelisin; iade posta masrafını biz karşılarız.",
        "Şikâyetlerin için Tüketici Hakem Heyetlerine veya Tüketici Mahkemelerine başvurabilirsin.",
      ] },
    ],
  },
  fr: {
    title: "Politique de remboursement",
    intro: "Toutes les ventes sont finales. Nous ne remboursons pas un changement d'avis, sauf lorsque la loi de votre pays vous en donne le droit. Vous êtes toujours protégé si un problème vient de nous.",
    sections: [
      { heading: "Toutes les ventes sont finales", body: [
        "Nous n'acceptons ni retours, ni échanges, ni remboursements pour un changement d'avis sur les planches de stickers ou un forfait Snail Mail Club. Vérifiez vos articles, le pays et l'adresse de livraison avant de payer.",
        "Les forfaits Snail Mail Club ne peuvent pas être annulés contre remboursement une fois payés. Ils ne se renouvellent jamais.",
      ] },
      { heading: "Quand nous remplaçons ou remboursons toujours", body: [
        "Un article est défectueux, endommagé pendant le transport ou ne correspond pas à votre commande : prévenez-nous dans les 30 jours suivant la réception, avec une photo si possible.",
        "Votre envoi n'est pas arrivé 30 jours après l'expédition (45 jours hors Canada et États-Unis), ou nous n'avons pas livré dans les 30 jours suivant la date promise.",
        "Nous ne pouvons pas poster un ou plusieurs mois de votre forfait : nous remboursons ces mois.",
        "Dans ces cas, nous remplaçons l'article ou remboursons intégralement, port compris, sur votre moyen de paiement d'origine dans les 15 jours.",
      ] },
      { heading: "Nous joindre", body: [
        "Écrivez à " + BUSINESS.email + (BUSINESS.phone ? " ou appelez le " + BUSINESS.phone : "") + " avec votre nom et votre numéro de commande. La clientèle de l'UE et de Turquie peut aussi utiliser le bouton « Se rétracter du contrat ici » en bas de chaque page.",
      ] },
      { heading: "Canada", body: [
        "Nous sommes établis au Québec. Notre règle de vente finale ne limite pas les droits d'ordre public prévus par la Loi sur la protection du consommateur du Québec et les lois provinciales semblables : la garantie légale que le bien sert à l'usage prévu et est durable, et votre droit de résoudre un contrat à distance si les renseignements exigés ne vous ont pas été fournis avant la commande (dans les 7 jours suivant la réception de votre copie), si vous n'avez pas reçu copie du contrat dans les 15 jours (dans les 30 jours), ou si le bien n'a pas été livré dans les 30 jours suivant la date convenue. Si nous ne remboursons pas dans les 15 jours suivant cette résolution, vous pouvez demander à l'émetteur de votre carte d'annuler le paiement.",
      ] },
      { heading: "États-Unis", body: [
        "Toutes les ventes sont finales. Si nous ne pouvons pas expédier dans le délai annoncé, nous vous prévenons et vous permettons d'annuler avec remboursement rapide, conformément à la règle de la FTC.",
      ] },
      { heading: "Australie", body: [
        "Aucun remboursement pour changement d'avis. Vos droits selon l'Australian Consumer Law pour les articles défectueux ne sont pas touchés.",
      ] },
      { heading: "Union européenne : droit de rétractation de 14 jours", body: [
        "Le droit de l'UE vous permet de vous rétracter dans les 14 jours sans motif ; notre règle de vente finale ne s'applique pas à vous. Le délai court à compter de la réception des biens ; pour un forfait, à compter de la conclusion du contrat.",
        "Pour vous rétracter, utilisez le bouton « Se rétracter du contrat ici » ou envoyez-nous une déclaration claire par courriel. Nous remboursons tous les paiements, frais de livraison standard compris, dans les 14 jours suivant votre notification, par le même moyen de paiement. Nous pouvons attendre la réception des biens ou une preuve d'envoi. Les frais de retour sont à votre charge ; vous n'êtes responsable que de la dépréciation due à des manipulations excédant ce qui est nécessaire pour examiner les biens.",
        "Modèle de formulaire de rétractation : À l'attention de " + BUSINESS.tradeName + ", " + BUSINESS.email + " : Je vous notifie par la présente ma rétractation du contrat portant sur la vente du bien ci-dessous : … Commandé le / reçu le : … Nom : … Adresse : … Date : …",
      ] },
      { heading: "Turquie", body: [
        "La loi turque n° 6502 vous donne 14 jours pour vous rétracter sans motif ; notre règle de vente finale ne s'applique pas à vous. Nous remboursons intégralement sous 14 jours et prenons en charge les frais de retour.",
      ] },
    ],
  },
  de: {
    title: "Rückerstattung & Widerruf",
    intro: "Alle Verkäufe sind endgültig. Bei Meinungsänderung erstatten wir nicht, außer das Recht deines Landes gibt dir diesen Anspruch. Liegt ein Fehler bei uns, bist du immer geschützt.",
    sections: [
      { heading: "Alle Verkäufe sind endgültig", body: [
        "Bei Meinungsänderung nehmen wir Stickerbögen oder Snail Mail Club Pakete nicht zurück und erstatten oder tauschen nicht. Bitte prüfe Artikel, Lieferland und Adresse vor der Zahlung.",
        "Club-Pakete können nach der Zahlung nicht gegen Erstattung gekündigt werden. Sie verlängern sich nie automatisch.",
      ] },
      { heading: "Wann wir immer ersetzen oder erstatten", body: [
        "Ein Artikel ist fehlerhaft, beim Versand beschädigt oder nicht das Bestellte: Melde dich innerhalb von 30 Tagen nach Erhalt, wenn möglich mit Foto.",
        "Deine Sendung ist 30 Tage nach Versand (45 Tage außerhalb Kanadas und der USA) nicht angekommen, oder wir haben nicht innerhalb von 30 Tagen nach dem zugesagten Termin geliefert.",
        "Wir können einen oder mehrere Monate deines Pakets nicht verschicken: Wir erstatten diese Monate.",
        "In diesen Fällen senden wir Ersatz oder erstatten vollständig inklusive Porto innerhalb von 15 Tagen über dein ursprüngliches Zahlungsmittel. Deine gesetzlichen Gewährleistungsrechte bleiben unberührt.",
      ] },
      { heading: "Kontakt", body: [
        "Schreib an " + BUSINESS.email + (BUSINESS.phone ? " oder ruf an unter " + BUSINESS.phone : "") + " mit Name und Bestellnummer, oder nutze den Button „Vertrag hier widerrufen“ unten auf jeder Seite.",
      ] },
      { heading: "Europäische Union – Widerrufsbelehrung", body: [
        "Widerrufsrecht: Du hast das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen; unsere Regel „Alle Verkäufe sind endgültig“ gilt für dich nicht. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem du oder ein von dir benannter Dritter, der nicht der Beförderer ist, die Waren in Besitz genommen hast bzw. hat; bei Club-Paketen ab dem Tag des Vertragsschlusses.",
        "Um dein Widerrufsrecht auszuüben, musst du uns (" + BUSINESS.tradeName + ", " + BUSINESS.sellerName + ", " + (BUSINESS.mailingAddress || "Postanschrift auf Anfrage") + ", Tel. " + (BUSINESS.phone || "–") + ", " + BUSINESS.email + ") mittels einer eindeutigen Erklärung (z. B. per E-Mail oder über den Widerrufs-Button) über deinen Entschluss informieren. Zur Wahrung der Frist reicht die rechtzeitige Absendung.",
        "Folgen des Widerrufs: Wir zahlen dir alle Zahlungen, einschließlich der Standard-Lieferkosten, unverzüglich und spätestens binnen vierzehn Tagen ab Eingang deines Widerrufs zurück, über dasselbe Zahlungsmittel. Wir können die Rückzahlung verweigern, bis wir die Waren zurückerhalten haben oder du den Nachweis der Rücksendung erbracht hast. Du trägst die unmittelbaren Kosten der Rücksendung. Für einen Wertverlust musst du nur aufkommen, wenn er auf einen zur Prüfung nicht notwendigen Umgang zurückzuführen ist.",
        "Muster-Widerrufsformular: An " + BUSINESS.tradeName + ", " + BUSINESS.email + ": Hiermit widerrufe(n) ich/wir den von mir/uns abgeschlossenen Vertrag über den Kauf der folgenden Waren: … Bestellt am / erhalten am: … Name: … Anschrift: … Datum: …",
      ] },
      { heading: "Kanada, USA, Australien", body: [
        "Dort sind alle Verkäufe bei Meinungsänderung endgültig. Unberührt bleiben die zwingenden Rechte nach dem Quebecer Verbraucherschutzgesetz, der FTC-Regel zu Lieferverzögerungen in den USA und dem Australian Consumer Law.",
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
        "Canada: we are based in Quebec and follow the spirit of the Accessible Canada Act and Quebec's accessibility principles; Ontario customers are served in line with the AODA customer service standard. USA: we aim for an accessible experience consistent with the Americans with Disabilities Act. EU: the European Accessibility Act principles. Türkiye: we welcome accessibility feedback in Turkish.",
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
        "Kanada: Quebec merkezliyiz; Kanada Erişilebilirlik Yasası ve Quebec ilkelerine, Ontario'daki müşteriler için AODA müşteri hizmetleri standardına uygun davranırız. ABD: ADA ile uyumlu erişilebilir bir deneyim hedefliyoruz. AB: Avrupa Erişilebilirlik Yasası ilkeleri. Türkiye: Türkçe erişilebilirlik geri bildirimlerini memnuniyetle alırız.",
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
        "Canada : nous sommes établis au Québec et suivons l'esprit de la Loi canadienne sur l'accessibilité et les principes québécois d'accessibilité ; la clientèle ontarienne est servie selon la norme de la LAPHO. États-Unis : expérience accessible conforme à l'esprit de l'ADA. UE : principes de l'Acte européen sur l'accessibilité.",
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
