/**
 * Terms of Sale, including shipping, cancellation and refunds.
 * Written to meet Ontario/Canadian consumer law, the EU Consumer Rights
 * Directive (14-day withdrawal) and Turkish distance-sales rules.
 * Not legal advice: have a lawyer review before relying on it.
 * Locales without a translation show English.
 */
import { BUSINESS } from "@/lib/legal/business";

export type LegalSection = { heading: string; body: string[] };
export type LegalDoc = {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
  lang: "en" | "tr" | "fr" | "de";
};

function sellerLines(labels: { address: string; phone: string; email: string; pending: string }): string[] {
  return [
    `${BUSINESS.tradeName} — ${BUSINESS.sellerName}, ${BUSINESS.country}.`,
    `${labels.address}: ${BUSINESS.mailingAddress || labels.pending}`,
    `${labels.phone}: ${BUSINESS.phone || labels.pending}`,
    `${labels.email}: ${BUSINESS.email}`,
  ];
}

function en(): LegalDoc {
  return {
    lang: "en",
    title: "Terms & Conditions",
    updated: `Last updated: ${BUSINESS.termsVersion}`,
    intro:
      "These terms apply when you buy from thechocobananaclub.com or the Chocobanana apps. Please read them before you order. Nothing here takes away rights you have under the consumer laws of the place where you live.",
    sections: [
      {
        heading: "Who sells to you",
        body: sellerLines({ address: "Mailing address", phone: "Telephone", email: "Email", pending: "available on request by email" }),
      },
      {
        heading: "What we sell",
        body: [
          "Sticker sheets: one printed sheet per item, sold once.",
          "Snail Mail Club packages: you prepay for 1 month, 3 months or 1 year. We mail one envelope per paid month to the address you give at checkout. Contents change each month; photos show a sample month and the exact items can differ.",
          "Club packages do not renew and nothing is charged again automatically.",
          "Our products are paper goods for personal use and are not toys for young children.",
        ],
      },
      {
        heading: "Prices, taxes and duties",
        body: [
          "Prices are in Canadian dollars (CAD). Your card is charged in CAD; your bank may show a converted amount and may add its own fees.",
          "Club package prices include standard postage. Sticker sheets ship free within Canada; postage of CA$1 per sheet to the USA and CA$2 per sheet to other countries is added at checkout.",
          "Any sales tax that applies is shown at checkout before you pay. The total you see on the payment page is the total you are charged.",
          "For deliveries outside Canada, the destination country may charge import taxes, duties or handling fees on arrival. We cannot know these in advance; they are paid by the recipient and are not part of our price.",
        ],
      },
      {
        heading: "Your order",
        body: [
          "Before paying you can review and correct your items, delivery address and total, and you can stop at any point.",
          "Your order is accepted when the payment is confirmed. We then email you a confirmation with your order number, items, prices, delivery address and a link to these terms. Please keep it.",
          "If an item is unavailable or a price was shown in error, we will tell you and refund you in full; we will not charge a different price without your agreement.",
        ],
      },
      {
        heading: "Payment",
        body: [
          "Payments are processed securely by Stripe (cards, Apple Pay, Google Pay and other methods shown at checkout). We never see or store your full card number.",
          "Discount and reward codes have no cash value, one code applies per order, and they cannot be combined unless the code says so.",
        ],
      },
      {
        heading: "Delivery",
        body: [
          "We ship to Canada, the United States, Australia, France, Germany and Türkiye by standard letter mail, usually without tracking.",
          "Sticker sheets are mailed within 5 business days of your order.",
          "Snail Mail Club envelopes are mailed during the first 10 days of each month. Orders paid by the 20th join that month's mailing; later orders start with the next month.",
          "Usual delivery time after mailing: Canada 2–9 business days, United States 6–12 business days, other countries 10–25 business days. Postal delays can happen and are outside our control.",
          "If something has not arrived 30 days after mailing (45 days outside Canada and the USA), or arrives damaged, write to us and we will send a replacement or refund you.",
          "Please check your address at checkout; we cannot be responsible for mail sent to an address that was entered incorrectly, but we will help where we can.",
        ],
      },
      {
        heading: "Changing your mind: 14 days for every customer",
        body: [
          "You can cancel any order within 14 days without giving a reason. For sticker sheets the 14 days start when you receive them; for a Club package they start on the day you pay.",
          "To cancel, use the \"Withdraw from contract here\" button at the bottom of every page, or email us with your name and order number. We confirm receipt by email.",
          "Sticker sheets: send them back unused within 14 days of cancelling. Return postage is paid by you unless the item was faulty or wrong, or you live in Türkiye (we pay it).",
          "Club packages: we refund every month that has not been mailed yet. Envelopes already received within the 14 days can be returned unused for a refund of that month.",
          "We refund within 14 days of your cancellation to your original payment method, including the standard postage you paid, at no cost to you. For goods you are sending back, we may wait until we receive them or you show proof of mailing.",
        ],
      },
      {
        heading: "Cancelling a Club package later",
        body: [
          "After the 14 days you can still stop a Club package at any time. We refund the months that have not been mailed yet (package price divided by the number of months).",
        ],
      },
      {
        heading: "Faulty or wrong items",
        body: [
          "If an item is faulty, damaged in the mail or not what you ordered, tell us within 30 days of receiving it, with a photo if you can. We will replace it or refund you, including any postage you paid. This does not limit your legal rights.",
        ],
      },
      {
        heading: "Our designs",
        body: [
          "All artwork, photos and text on the site and on our products belong to Chocobanana or are used with permission. Products are for personal use; please do not copy or resell the designs.",
        ],
      },
      {
        heading: "Responsibility",
        body: [
          "We are responsible for providing what you ordered with reasonable care. We are not responsible for losses that were not foreseeable when you ordered, or for delays caused by events outside our control. Nothing in these terms limits liability that cannot be limited by law, or your statutory consumer rights.",
        ],
      },
      {
        heading: "Law and complaints",
        body: [
          `These terms are governed by the laws of ${BUSINESS.governingLaw}. If you live elsewhere, you keep the protection of the mandatory consumer laws of your country and can bring a claim in your local courts.`,
          "If something goes wrong, please contact us first; we answer within 5 business days.",
        ],
      },
      {
        heading: "Changes",
        body: [
          "We may update these terms. The version shown when you placed your order applies to that order.",
        ],
      },
    ],
  };
}

function tr(): LegalDoc {
  return {
    lang: "tr",
    title: "Satış Koşulları",
    updated: `Son güncelleme: ${BUSINESS.termsVersion}`,
    intro:
      "Bu koşullar thechocobananaclub.com veya Chocobanana uygulamalarından yaptığın alışverişler için geçerlidir. Sipariş vermeden önce lütfen oku. Buradaki hiçbir madde, yaşadığın ülkenin tüketici yasalarından doğan haklarını ortadan kaldırmaz.",
    sections: [
      {
        heading: "Satıcı",
        body: sellerLines({ address: "Posta adresi", phone: "Telefon", email: "E-posta", pending: "e-postayla talep edildiğinde bildirilir" }),
      },
      {
        heading: "Ne satıyoruz",
        body: [
          "Sticker sayfaları: her ürün tek bir baskı sayfasıdır, bir kez satılır.",
          "Snail Mail Club paketleri: 1 ay, 3 ay veya 1 yıl için peşin ödersin. Ödenen her ay için ödeme sırasında verdiğin adrese bir zarf göndeririz. İçerik her ay değişir; fotoğraflar örnek bir ayı gösterir, ürünler farklı olabilir.",
          "Kulüp paketleri yenilenmez ve otomatik olarak tekrar ücret alınmaz.",
          "Ürünlerimiz kişisel kullanım için kâğıt ürünlerdir, küçük çocuklar için oyuncak değildir.",
        ],
      },
      {
        heading: "Fiyatlar, vergiler ve gümrük",
        body: [
          "Fiyatlar Kanada doları (CAD) cinsindendir. Kartından CAD olarak çekilir; bankan dönüştürülmüş tutar gösterebilir ve kendi ücretini ekleyebilir.",
          "Kulüp paketi fiyatlarına standart posta dahildir. Sticker sayfaları Kanada içinde ücretsiz gönderilir; ABD için sayfa başı CA$1, diğer ülkeler için sayfa başı CA$2 posta ücreti ödeme sırasında eklenir.",
          "Geçerli bir satış vergisi varsa ödeme öncesinde gösterilir. Ödeme sayfasında gördüğün toplam, çekilecek toplamdır.",
          "Kanada dışındaki teslimatlarda varış ülkesi ithalat vergisi, gümrük veya işlem ücreti alabilir. Bunları önceden bilemeyiz; alıcı tarafından ödenir ve fiyatımıza dahil değildir.",
        ],
      },
      {
        heading: "Siparişin",
        body: [
          "Ödemeden önce ürünleri, teslimat adresini ve toplamı görüp düzeltebilir, istediğin anda vazgeçebilirsin.",
          "Siparişin ödeme onaylandığında kabul edilir. Ardından sipariş numarası, ürünler, fiyatlar, teslimat adresi ve bu koşulların bağlantısını içeren bir onay e-postası göndeririz. Lütfen sakla.",
          "Bir ürün tükenmişse veya fiyat hatalı gösterildiyse sana haber verir ve tamamını iade ederiz; onayın olmadan farklı bir fiyat almayız.",
        ],
      },
      {
        heading: "Ödeme",
        body: [
          "Ödemeler Stripe tarafından güvenle işlenir (kart, Apple Pay, Google Pay ve ödeme sayfasında görünen diğer yöntemler). Kart numaranın tamamını görmeyiz ve saklamayız.",
          "İndirim ve ödül kodlarının nakit değeri yoktur, siparişte bir kod geçerlidir ve kod aksini söylemedikçe birleştirilemez.",
        ],
      },
      {
        heading: "Teslimat",
        body: [
          "Kanada, ABD, Avustralya, Fransa, Almanya ve Türkiye'ye standart mektup postasıyla, genellikle takip numarasız gönderiyoruz.",
          "Sticker sayfaları siparişten sonraki 5 iş günü içinde postalanır.",
          "Snail Mail Club zarfları her ayın ilk 10 günü içinde postalanır. Ayın 20'sine kadar ödenen siparişler o ayın gönderimine katılır; sonrakiler bir sonraki aydan başlar.",
          "Postalamadan sonra olağan teslim süresi: Kanada 2–9 iş günü, ABD 6–12 iş günü, diğer ülkeler 10–25 iş günü. Postadaki gecikmeler bizim kontrolümüz dışındadır.",
          "Postalamadan 30 gün sonra (Kanada ve ABD dışında 45 gün) ulaşmadıysa veya hasarlı geldiyse bize yaz; yenisini göndeririz veya paranı iade ederiz.",
          "Lütfen adresini ödeme sırasında kontrol et; yanlış girilen adrese giden postadan sorumlu olamayız ama elimizden geldiğince yardım ederiz.",
        ],
      },
      {
        heading: "Fikrini değiştirirsen: herkes için 14 gün",
        body: [
          "Her siparişi gerekçe göstermeden 14 gün içinde iptal edebilirsin. Sticker sayfalarında 14 gün ürünü teslim aldığın gün, Kulüp paketlerinde ödeme yaptığın gün başlar.",
          "İptal için her sayfanın altındaki \"Sözleşmeden cayma\" butonunu kullan ya da adın ve sipariş numaranla bize e-posta gönder. Talebini aldığımızı e-postayla onaylarız.",
          "Sticker sayfaları: cayma bildiriminden sonraki 14 gün içinde kullanılmamış olarak geri gönder. Ürün kusurlu veya yanlış değilse iade postası sana aittir; Türkiye'de yaşıyorsan iade postasını biz karşılarız.",
          "Kulüp paketleri: henüz postalanmamış her ayın ücretini iade ederiz. 14 gün içinde teslim aldığın zarflar kullanılmadan geri gönderilirse o ayın ücreti de iade edilir.",
          "İadeyi cayma bildiriminden itibaren 14 gün içinde, ücretsiz olarak, ödediğin standart posta dahil, ödeme yaptığın yönteme yaparız. Geri gönderilen ürünlerde, ürün bize ulaşana veya gönderim belgesini paylaşana kadar bekleyebiliriz.",
        ],
      },
      {
        heading: "Kulüp paketini daha sonra durdurmak",
        body: [
          "14 gün geçtikten sonra da Kulüp paketini istediğin zaman durdurabilirsin. Henüz postalanmamış ayların ücretini (paket fiyatı ÷ ay sayısı) iade ederiz.",
        ],
      },
      {
        heading: "Kusurlu veya yanlış ürün",
        body: [
          "Ürün kusurluysa, postada hasar gördüyse veya sipariş ettiğin ürün değilse teslimden sonraki 30 gün içinde, mümkünse fotoğrafla bize bildir. Yenisini göndeririz veya ödediğin posta dahil iade ederiz. Bu, yasal haklarını sınırlamaz.",
        ],
      },
      {
        heading: "Tasarımlarımız",
        body: [
          "Sitedeki ve ürünlerdeki tüm çizimler, fotoğraflar ve metinler Chocobanana'ya aittir veya izinle kullanılır. Ürünler kişisel kullanım içindir; lütfen tasarımları kopyalama veya yeniden satma.",
        ],
      },
      {
        heading: "Sorumluluk",
        body: [
          "Sipariş ettiğini makul özenle sağlamaktan sorumluyuz. Sipariş anında öngörülemeyen zararlardan veya kontrolümüz dışındaki olayların yol açtığı gecikmelerden sorumlu değiliz. Bu koşullardaki hiçbir madde, yasayla sınırlanamayan sorumluluğu veya yasal tüketici haklarını sınırlamaz.",
        ],
      },
      {
        heading: "Uygulanacak hukuk ve şikâyetler",
        body: [
          `Bu koşullara ${BUSINESS.governingLaw} hukuku uygulanır. Başka bir ülkede yaşıyorsan, o ülkenin emredici tüketici yasalarının korumasından yararlanmaya ve kendi yerel mahkemelerine başvurmaya devam edersin. Türkiye'de yaşayan tüketiciler Tüketici Hakem Heyetlerine ve Tüketici Mahkemelerine başvurabilir.`,
          "Bir sorun olursa lütfen önce bize yaz; 5 iş günü içinde yanıt veririz.",
        ],
      },
      {
        heading: "Değişiklikler",
        body: [
          "Bu koşulları güncelleyebiliriz. Siparişini verdiğin anda geçerli olan sürüm o sipariş için geçerlidir.",
        ],
      },
    ],
  };
}

function fr(): LegalDoc {
  return {
    lang: "fr",
    title: "Conditions de vente",
    updated: `Dernière mise à jour : ${BUSINESS.termsVersion}`,
    intro:
      "Ces conditions s'appliquent à vos achats sur thechocobananaclub.com ou dans les applications Chocobanana. Merci de les lire avant de commander. Rien ici ne limite les droits que vous accorde le droit de la consommation de votre pays de résidence.",
    sections: [
      {
        heading: "Le vendeur",
        body: sellerLines({ address: "Adresse postale", phone: "Téléphone", email: "Courriel", pending: "communiquée sur demande par courriel" }),
      },
      {
        heading: "Ce que nous vendons",
        body: [
          "Planches de stickers : une planche imprimée par article, vendue une fois.",
          "Forfaits Snail Mail Club : vous payez d'avance pour 1 mois, 3 mois ou 1 an. Nous postons une enveloppe par mois payé à l'adresse indiquée lors du paiement. Le contenu change chaque mois ; les photos montrent un mois exemple et les articles exacts peuvent varier.",
          "Les forfaits ne se renouvellent pas et aucun montant n'est prélevé automatiquement par la suite.",
          "Nos produits sont des articles en papier pour un usage personnel et ne sont pas des jouets pour jeunes enfants.",
        ],
      },
      {
        heading: "Prix, taxes et droits",
        body: [
          "Les prix sont en dollars canadiens (CAD). Votre carte est débitée en CAD ; votre banque peut afficher un montant converti et ajouter ses propres frais.",
          "Les forfaits du Club incluent l'affranchissement standard. Les planches de stickers sont expédiées gratuitement au Canada ; un affranchissement de 1 $ CA par planche vers les États-Unis et de 2 $ CA par planche vers les autres pays est ajouté au paiement.",
          "Toute taxe de vente applicable est affichée avant le paiement. Le total affiché sur la page de paiement est le montant débité.",
          "Pour les livraisons hors du Canada, le pays de destination peut percevoir des taxes à l'importation, des droits de douane ou des frais de traitement à l'arrivée. Nous ne pouvons pas les connaître à l'avance ; ils sont à la charge du destinataire et ne font pas partie de notre prix.",
        ],
      },
      {
        heading: "Votre commande",
        body: [
          "Avant de payer, vous pouvez vérifier et corriger vos articles, votre adresse et le total, et vous arrêter à tout moment.",
          "Votre commande est acceptée lorsque le paiement est confirmé. Nous vous envoyons alors un courriel de confirmation avec le numéro de commande, les articles, les prix, l'adresse de livraison et un lien vers ces conditions. Conservez-le.",
          "Si un article n'est pas disponible ou si un prix a été affiché par erreur, nous vous prévenons et vous remboursons intégralement ; nous n'appliquerons pas un autre prix sans votre accord.",
        ],
      },
      {
        heading: "Paiement",
        body: [
          "Les paiements sont traités de façon sécurisée par Stripe (cartes, Apple Pay, Google Pay et autres moyens affichés). Nous ne voyons ni ne conservons jamais votre numéro de carte complet.",
          "Les codes de réduction et de récompense n'ont pas de valeur monétaire, un seul code s'applique par commande et ils ne se cumulent pas, sauf mention contraire.",
        ],
      },
      {
        heading: "Livraison",
        body: [
          "Nous expédions au Canada, aux États-Unis, en Australie, en France, en Allemagne et en Turquie par courrier standard, généralement sans suivi.",
          "Les planches de stickers sont postées dans les 5 jours ouvrables suivant la commande.",
          "Les enveloppes du Snail Mail Club sont postées pendant les 10 premiers jours de chaque mois. Les commandes payées au plus tard le 20 rejoignent l'envoi du mois ; les suivantes commencent le mois suivant.",
          "Délai habituel après l'envoi : Canada 2 à 9 jours ouvrables, États-Unis 6 à 12 jours ouvrables, autres pays 10 à 25 jours ouvrables. Les retards postaux échappent à notre contrôle.",
          "Si un envoi n'est pas arrivé 30 jours après l'expédition (45 jours hors Canada et États-Unis) ou arrive endommagé, écrivez-nous : nous renverrons l'article ou vous rembourserons.",
          "Vérifiez votre adresse au paiement ; nous ne pouvons être tenus responsables d'un envoi à une adresse mal saisie, mais nous ferons de notre mieux pour aider.",
        ],
      },
      {
        heading: "Droit de rétractation : 14 jours pour tous",
        body: [
          "Vous pouvez annuler toute commande dans un délai de 14 jours sans donner de motif. Pour les planches de stickers, le délai court à partir de leur réception ; pour un forfait du Club, à partir du jour du paiement.",
          "Pour vous rétracter, utilisez le bouton « Se rétracter du contrat ici » en bas de chaque page, ou envoyez-nous un courriel avec votre nom et votre numéro de commande. Nous accusons réception par courriel.",
          "Planches de stickers : renvoyez-les inutilisées dans les 14 jours suivant votre rétractation. Les frais de retour sont à votre charge, sauf si l'article est défectueux ou erroné, ou si vous résidez en Turquie (nous les payons).",
          "Forfaits du Club : nous remboursons chaque mois qui n'a pas encore été posté. Les enveloppes reçues pendant les 14 jours peuvent être renvoyées inutilisées pour obtenir le remboursement du mois concerné.",
          "Nous remboursons dans les 14 jours suivant votre rétractation, sur votre moyen de paiement d'origine, affranchissement standard compris, sans frais. Pour les articles à renvoyer, nous pouvons attendre leur réception ou une preuve d'expédition.",
        ],
      },
      {
        heading: "Arrêter un forfait du Club plus tard",
        body: [
          "Après les 14 jours, vous pouvez toujours arrêter un forfait à tout moment. Nous remboursons les mois non encore postés (prix du forfait divisé par le nombre de mois).",
        ],
      },
      {
        heading: "Article défectueux ou erroné",
        body: [
          "Si un article est défectueux, endommagé pendant le transport ou ne correspond pas à votre commande, prévenez-nous dans les 30 jours suivant la réception, avec une photo si possible. Nous le remplaçons ou vous remboursons, frais de port compris. Cela ne limite pas vos garanties légales.",
        ],
      },
      {
        heading: "Nos créations",
        body: [
          "Les illustrations, photos et textes du site et des produits appartiennent à Chocobanana ou sont utilisés avec autorisation. Les produits sont destinés à un usage personnel ; merci de ne pas copier ni revendre les créations.",
        ],
      },
      {
        heading: "Responsabilité",
        body: [
          "Nous fournissons votre commande avec un soin raisonnable. Nous ne sommes pas responsables des pertes imprévisibles au moment de la commande ni des retards dus à des événements hors de notre contrôle. Rien dans ces conditions ne limite une responsabilité qui ne peut l'être légalement, ni vos droits de consommateur.",
        ],
      },
      {
        heading: "Droit applicable et réclamations",
        body: [
          `Ces conditions sont régies par le droit de ${BUSINESS.governingLaw}. Si vous résidez ailleurs, vous conservez la protection des dispositions impératives du droit de la consommation de votre pays et pouvez saisir les tribunaux de votre lieu de résidence.`,
          "En cas de problème, contactez-nous d'abord ; nous répondons sous 5 jours ouvrables.",
        ],
      },
      {
        heading: "Modifications",
        body: [
          "Nous pouvons mettre à jour ces conditions. La version affichée au moment de votre commande s'applique à cette commande.",
        ],
      },
    ],
  };
}

function de(): LegalDoc {
  return {
    lang: "de",
    title: "Verkaufsbedingungen",
    updated: `Zuletzt aktualisiert: ${BUSINESS.termsVersion}`,
    intro:
      "Diese Bedingungen gelten für Käufe auf thechocobananaclub.com und in den Chocobanana-Apps. Bitte lies sie vor deiner Bestellung. Nichts hier schränkt die Rechte ein, die dir das Verbraucherrecht deines Wohnsitzlandes gibt.",
    sections: [
      {
        heading: "Verkäufer",
        body: sellerLines({ address: "Postanschrift", phone: "Telefon", email: "E-Mail", pending: "auf Anfrage per E-Mail" }),
      },
      {
        heading: "Was wir verkaufen",
        body: [
          "Stickerbögen: ein gedruckter Bogen pro Artikel, einmaliger Kauf.",
          "Snail Mail Club Pakete: Du zahlst im Voraus für 1 Monat, 3 Monate oder 1 Jahr. Wir senden für jeden bezahlten Monat einen Umschlag an die beim Bezahlen angegebene Adresse. Der Inhalt wechselt jeden Monat; Fotos zeigen einen Beispielmonat, die genauen Teile können abweichen.",
          "Pakete verlängern sich nicht und es wird nichts automatisch erneut abgebucht.",
          "Unsere Produkte sind Papierwaren für den persönlichen Gebrauch und kein Spielzeug für kleine Kinder.",
        ],
      },
      {
        heading: "Preise, Steuern und Zölle",
        body: [
          "Die Preise sind in kanadischen Dollar (CAD). Deine Karte wird in CAD belastet; deine Bank kann einen umgerechneten Betrag anzeigen und eigene Gebühren berechnen.",
          "Club-Pakete enthalten Standardporto. Stickerbögen werden innerhalb Kanadas kostenlos versandt; Porto von CA$1 pro Bogen in die USA und CA$2 pro Bogen in andere Länder wird beim Bezahlen hinzugefügt.",
          "Eine anfallende Umsatzsteuer wird vor der Zahlung angezeigt. Der Gesamtbetrag auf der Zahlungsseite ist der abgebuchte Betrag.",
          "Bei Lieferungen außerhalb Kanadas kann das Zielland Einfuhrumsatzsteuer, Zölle oder Bearbeitungsgebühren bei Ankunft erheben. Diese können wir vorab nicht kennen; sie trägt der Empfänger und sie sind nicht Teil unseres Preises.",
        ],
      },
      {
        heading: "Deine Bestellung",
        body: [
          "Vor der Zahlung kannst du Artikel, Lieferadresse und Gesamtbetrag prüfen und korrigieren und jederzeit abbrechen.",
          "Deine Bestellung ist angenommen, sobald die Zahlung bestätigt ist. Wir senden dir dann eine Bestätigung mit Bestellnummer, Artikeln, Preisen, Lieferadresse und einem Link zu diesen Bedingungen. Bitte bewahre sie auf.",
          "Ist ein Artikel nicht verfügbar oder wurde ein Preis irrtümlich angezeigt, informieren wir dich und erstatten den vollen Betrag; einen anderen Preis berechnen wir nicht ohne deine Zustimmung.",
        ],
      },
      {
        heading: "Zahlung",
        body: [
          "Zahlungen werden sicher über Stripe abgewickelt (Karten, Apple Pay, Google Pay und weitere angezeigte Methoden). Wir sehen oder speichern nie deine vollständige Kartennummer.",
          "Rabatt- und Prämiencodes haben keinen Barwert, pro Bestellung gilt ein Code und sie sind nicht kombinierbar, sofern nicht anders angegeben.",
        ],
      },
      {
        heading: "Lieferung",
        body: [
          "Wir versenden nach Kanada, in die USA, nach Australien, Frankreich, Deutschland und in die Türkei als Standardbrief, meist ohne Sendungsverfolgung.",
          "Stickerbögen werden innerhalb von 5 Werktagen nach der Bestellung verschickt.",
          "Snail Mail Club Umschläge werden in den ersten 10 Tagen jedes Monats verschickt. Bis zum 20. bezahlte Bestellungen sind im Versand desselben Monats dabei; spätere beginnen im Folgemonat.",
          "Übliche Laufzeit nach dem Versand: Kanada 2–9 Werktage, USA 6–12 Werktage, andere Länder 10–25 Werktage. Postverzögerungen liegen außerhalb unseres Einflusses.",
          "Ist eine Sendung 30 Tage nach dem Versand (45 Tage außerhalb von Kanada und den USA) nicht angekommen oder beschädigt, schreib uns: Wir senden Ersatz oder erstatten den Betrag.",
          "Bitte prüfe deine Adresse beim Bezahlen; für Sendungen an falsch eingegebene Adressen können wir nicht haften, helfen aber, wo wir können.",
        ],
      },
      {
        heading: "Widerrufsrecht: 14 Tage für alle",
        body: [
          "Du kannst jede Bestellung innerhalb von 14 Tagen ohne Angabe von Gründen widerrufen. Bei Stickerbögen beginnt die Frist mit dem Erhalt der Ware, bei Club-Paketen am Tag der Zahlung.",
          "Zum Widerruf nutze den Button „Vertrag hier widerrufen“ unten auf jeder Seite oder schreib uns eine E-Mail mit deinem Namen und deiner Bestellnummer. Wir bestätigen den Eingang per E-Mail.",
          "Stickerbögen: Sende sie innerhalb von 14 Tagen nach dem Widerruf unbenutzt zurück. Die Rücksendekosten trägst du, außer der Artikel war fehlerhaft oder falsch oder du wohnst in der Türkei (dann zahlen wir).",
          "Club-Pakete: Wir erstatten jeden Monat, der noch nicht verschickt wurde. Innerhalb der 14 Tage erhaltene Umschläge können unbenutzt zurückgesendet werden; dann erstatten wir auch diesen Monat.",
          "Wir erstatten innerhalb von 14 Tagen nach deinem Widerruf über dein ursprüngliches Zahlungsmittel, einschließlich des Standardportos, ohne Kosten für dich. Bei Rücksendungen können wir warten, bis die Ware bei uns ist oder du den Versand nachweist.",
        ],
      },
      {
        heading: "Club-Paket später beenden",
        body: [
          "Auch nach den 14 Tagen kannst du ein Club-Paket jederzeit beenden. Wir erstatten die noch nicht verschickten Monate (Paketpreis geteilt durch die Anzahl der Monate).",
        ],
      },
      {
        heading: "Fehlerhafte oder falsche Artikel",
        body: [
          "Ist ein Artikel fehlerhaft, beim Versand beschädigt oder nicht das Bestellte, melde dich innerhalb von 30 Tagen nach Erhalt, wenn möglich mit Foto. Wir ersetzen ihn oder erstatten den Betrag einschließlich Porto. Deine gesetzlichen Gewährleistungsrechte bleiben unberührt.",
        ],
      },
      {
        heading: "Unsere Designs",
        body: [
          "Alle Illustrationen, Fotos und Texte auf der Website und den Produkten gehören Chocobanana oder werden mit Erlaubnis genutzt. Die Produkte sind für den persönlichen Gebrauch; bitte kopiere oder verkaufe die Designs nicht weiter.",
        ],
      },
      {
        heading: "Haftung",
        body: [
          "Wir liefern deine Bestellung mit angemessener Sorgfalt. Für bei der Bestellung nicht vorhersehbare Schäden und für Verzögerungen durch Ereignisse außerhalb unseres Einflusses haften wir nicht. Nichts in diesen Bedingungen beschränkt eine gesetzlich nicht beschränkbare Haftung oder deine Verbraucherrechte.",
        ],
      },
      {
        heading: "Anwendbares Recht und Beschwerden",
        body: [
          `Für diese Bedingungen gilt das Recht von ${BUSINESS.governingLaw}. Wohnst du anderswo, behältst du den Schutz der zwingenden Verbraucherschutzvorschriften deines Landes und kannst vor den Gerichten deines Wohnorts klagen.`,
          "Bei Problemen melde dich bitte zuerst bei uns; wir antworten innerhalb von 5 Werktagen. Wir nehmen nicht an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teil.",
        ],
      },
      {
        heading: "Änderungen",
        body: [
          "Wir können diese Bedingungen aktualisieren. Für deine Bestellung gilt die Fassung, die bei der Bestellung angezeigt wurde.",
        ],
      },
    ],
  };
}

export function getTerms(locale: string): LegalDoc {
  if (locale === "tr") return tr();
  if (locale === "fr") return fr();
  if (locale === "de") return de();
  return en();
}
