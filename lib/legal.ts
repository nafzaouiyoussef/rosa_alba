import type { Lang, Settings } from "./types";

export type LegalSection = { h: string; p: string[] };
export type LegalPage = { slug: string; title: string; intro?: string; sections: LegalSection[] };

export const LEGAL_SLUGS = ["about", "contact", "shipping", "refund", "terms", "privacy", "data-deletion"] as const;

export const legalLinks = (lang: Lang) => [
  { slug: "about", label: lang === "ar" ? "من نحن" : "À propos" },
  { slug: "contact", label: lang === "ar" ? "اتصل بنا" : "Contact" },
  { slug: "shipping", label: lang === "ar" ? "سياسة التوصيل" : "Livraison" },
  { slug: "refund", label: lang === "ar" ? "الإرجاع والاسترجاع" : "Retours & remboursements" },
  { slug: "terms", label: lang === "ar" ? "شروط البيع" : "Conditions de vente" },
  { slug: "privacy", label: lang === "ar" ? "سياسة الخصوصية" : "Confidentialité" },
  { slug: "data-deletion", label: lang === "ar" ? "حذف البيانات" : "Suppression des données" }
];

/**
 * Standard shop policies (cash on delivery, Morocco). They are templates: the shop owner must read them and
 * make sure every promise (delays, return window…) is one they can keep.
 */
export function getLegalPage(slug: string, lang: Lang, s: Settings): LegalPage | null {
  const ar = lang === "ar";
  const brand = s.business_name || s.store_name || "Rosa Alba";
  const email = s.contact_email;
  const days = s.delivery_days || "24-72h";
  const contactLines = [
    email && (ar ? `البريد الإلكتروني: ${email}` : `Email : ${email}`),
    s.whatsapp && `WhatsApp : ${s.whatsapp}`,
    s.instagram && `Instagram : @${s.instagram}`,
    s.business_address && (ar ? `العنوان: ${s.business_address}` : `Adresse : ${s.business_address}`),
    s.business_id && `ICE / RC : ${s.business_id}`
  ].filter(Boolean) as string[];
  const shipFee = Number(s.shipping_fee) > 0 ? `${s.shipping_fee} MAD` : null;

  const pages: Record<string, LegalPage> = {
    about: ar
      ? {
          slug, title: "من نحن",
          intro: `${brand} علامة مغربية للعناية بالبشرة والجسم بمكونات طبيعية.`,
          sections: [
            { h: "قصتنا", p: ["نؤمن بأن كنوز المغرب الطبيعية، مثل زيت الأركان وزيت التين الشوكي وزيت اللوز الحلو، تستحق أن تكون جزءاً من روتينك اليومي.", "نقدم تشكيلة بسيطة من المنتجات: سيروم، كريم ليلي، ماسك، زيت جاف ومقشر للوجه."] },
            { h: "التزامنا", p: ["مكونات طبيعية مدونة بوضوح على كل منتج.", "توصيل مجاني لجميع مدن المغرب والدفع عند الاستلام، لتطلبي بثقة."] }
          ]
        }
      : {
          slug, title: "À propos",
          intro: `${brand} est une marque marocaine de soins naturels pour le visage et le corps.`,
          sections: [
            { h: "Notre histoire", p: ["Nous croyons que les trésors naturels du Maroc, comme l'huile d'argan, la figue de Barbarie et l'amande douce, méritent une place dans votre routine quotidienne.", "Nous proposons une collection simple : sérum, crème de nuit, masque, huile sèche et gel gommant visage."] },
            { h: "Nos engagements", p: ["Des actifs naturels, listés clairement sur chaque emballage.", "Livraison gratuite partout au Maroc et paiement à la livraison, pour commander en toute confiance."] }
          ]
        },

    contact: ar
      ? {
          slug, title: "اتصل بنا",
          intro: "لأي سؤال حول طلبك أو منتجاتنا، فريقنا في خدمتك.",
          sections: [
            { h: "معلومات التواصل", p: contactLines.length ? contactLines : ["يمكنك التواصل معنا عبر واتساب أو إنستغرام."] },
            { h: "أوقات الرد", p: ["نرد عادةً خلال 24 ساعة في أيام العمل."] }
          ]
        }
      : {
          slug, title: "Contact",
          intro: "Une question sur votre commande ou nos produits ? Notre équipe vous répond.",
          sections: [
            { h: "Nous joindre", p: contactLines.length ? contactLines : ["Contactez-nous via WhatsApp ou Instagram."] },
            { h: "Délai de réponse", p: ["Nous répondons en général sous 24 h les jours ouvrables."] }
          ]
        },

    shipping: ar
      ? {
          slug, title: "سياسة التوصيل والدفع",
          sections: [
            { h: "مناطق التوصيل", p: ["نوصل إلى جميع مدن المغرب."] },
            { h: "الآجال", p: [`بعد تأكيد الطلب هاتفياً، يتم التوصيل عادةً خلال ${days} حسب مدينتك. قد تتأخر المناطق النائية قليلاً.`] },
            { h: "التكلفة", p: [shipFee ? `رسوم التوصيل: ${shipFee}.` : "التوصيل مجاني لجميع الطلبات."] },
            { h: "الدفع", p: ["الدفع نقداً عند الاستلام. لا يتم أي دفع عبر الإنترنت ولا نجمع أي بيانات بنكية."] },
            { h: "تأكيد الطلب", p: ["نتصل بك لتأكيد الطلب قبل الشحن. إذا تعذر الوصول إليك بعد عدة محاولات، قد يتم إلغاء الطلب."] },
            { h: "عند الاستلام", p: ["يرجى فحص الطرد بحضور الموزع. إذا كان المنتج تالفاً، يمكنك رفضه وإبلاغنا فوراً."] }
          ]
        }
      : {
          slug, title: "Livraison & paiement",
          sections: [
            { h: "Zones desservies", p: ["Nous livrons dans toutes les villes du Maroc."] },
            { h: "Délais", p: [`Après confirmation téléphonique de la commande, la livraison se fait généralement sous ${days}, selon votre ville. Les zones éloignées peuvent nécessiter un délai supplémentaire.`] },
            { h: "Frais", p: [shipFee ? `Frais de livraison : ${shipFee}.` : "La livraison est gratuite pour toutes les commandes."] },
            { h: "Paiement", p: ["Le paiement se fait en espèces à la livraison. Aucun paiement en ligne n'est demandé et nous ne collectons aucune donnée bancaire."] },
            { h: "Confirmation de commande", p: ["Nous vous appelons pour confirmer la commande avant l'expédition. Si nous ne parvenons pas à vous joindre après plusieurs tentatives, la commande peut être annulée."] },
            { h: "À la réception", p: ["Merci de vérifier le colis en présence du livreur. Si le produit est abîmé, vous pouvez le refuser et nous prévenir immédiatement."] }
          ]
        },

    refund: ar
      ? {
          slug, title: "سياسة الإرجاع والاسترجاع",
          sections: [
            { h: "مدة الإرجاع", p: ["يمكنك طلب الإرجاع أو الاستبدال خلال 7 أيام من استلام الطلب."] },
            { h: "الشروط", p: ["لأسباب تتعلق بالنظافة والسلامة، تُقبل المنتجات غير المفتوحة وغير المستعملة وبغلافها الأصلي.", "يُقبل المنتج المعيب أو التالف أو الخاطئ في جميع الحالات، بعد التواصل معنا وإرسال صورة."] },
            { h: "كيف تطلبين الإرجاع", p: [`تواصلي معنا${email ? ` على ${email}` : ""}${s.whatsapp ? ` أو عبر واتساب ${s.whatsapp}` : ""} مع رقم الطلب وسبب الإرجاع.`] },
            { h: "الاسترجاع", p: ["بعد استلام المنتج المرتجع وفحصه، نرد لك المبلغ المدفوع أو نرسل لك منتجاً بديلاً حسب اختيارك. يتم الرد نقداً أو بتحويل بنكي خلال 7 أيام عمل."] },
            { h: "حقوقك", p: ["لا تؤثر هذه السياسة على حقوقك القانونية كمستهلك بموجب القانون المغربي رقم 31.08."] }
          ]
        }
      : {
          slug, title: "Retours & remboursements",
          sections: [
            { h: "Délai", p: ["Vous pouvez demander un retour ou un échange dans les 7 jours suivant la réception de votre commande."] },
            { h: "Conditions", p: ["Pour des raisons d'hygiène et de sécurité, les produits doivent être non ouverts, non utilisés et dans leur emballage d'origine.", "Un produit défectueux, abîmé ou erroné est toujours accepté, après contact et envoi d'une photo."] },
            { h: "Comment procéder", p: [`Contactez-nous${email ? ` à ${email}` : ""}${s.whatsapp ? ` ou sur WhatsApp ${s.whatsapp}` : ""} en indiquant votre numéro de commande et le motif du retour.`] },
            { h: "Remboursement", p: ["Après réception et vérification du produit retourné, nous vous remboursons le montant payé ou vous envoyons un produit de remplacement, selon votre choix. Le remboursement est effectué en espèces ou par virement sous 7 jours ouvrables."] },
            { h: "Vos droits", p: ["Cette politique ne limite pas vos droits de consommateur prévus par la loi marocaine n° 31-08."] }
          ]
        },

    terms: ar
      ? {
          slug, title: "شروط البيع",
          sections: [
            { h: "التعريف", p: [`يتم البيع عبر هذا الموقع من طرف ${brand}. بتقديمك لطلب فإنك تقبلين هذه الشروط.`] },
            { h: "المنتجات والأسعار", p: ["الأسعار معروضة بالدرهم المغربي (MAD) وتشمل جميع الرسوم. نحتفظ بالحق في تعديل الأسعار، لكن السعر المعروض وقت الطلب هو المعتمد.", "قد تختلف صور المنتجات قليلاً عن الواقع."] },
            { h: "الطلب", p: ["يعتبر الطلب نهائياً بعد تأكيده عبر الهاتف. نحتفظ بالحق في رفض أو إلغاء أي طلب غير صحيح أو مشبوه أو في حال نفاد المخزون."] },
            { h: "الدفع", p: ["الدفع نقداً عند الاستلام."] },
            { h: "التوصيل والإرجاع", p: ["تطبق سياسة التوصيل وسياسة الإرجاع المنشورتان على هذا الموقع."] },
            { h: "الاستعمال والمسؤولية", p: ["يرجى قراءة المكونات وطريقة الاستعمال قبل الاستخدام وإجراء اختبار صغير على اليد. في حال الحساسية أو الحمل أو أي حالة طبية، استشيري مختصاً. منتجاتنا مستحضرات تجميل وليست أدوية."] },
            { h: "القانون المطبق", p: ["تخضع هذه الشروط للقانون المغربي، وتختص المحاكم المغربية بأي نزاع."] },
            ...(contactLines.length ? [{ h: "البائع", p: [brand, ...contactLines] }] : [])
          ]
        }
      : {
          slug, title: "Conditions de vente",
          sections: [
            { h: "Vendeur", p: [`Les ventes sur ce site sont réalisées par ${brand}. En passant commande, vous acceptez les présentes conditions.`] },
            { h: "Produits et prix", p: ["Les prix sont indiqués en dirhams marocains (MAD), toutes taxes comprises. Nous pouvons modifier nos prix, mais le prix affiché au moment de la commande est celui qui s'applique.", "Les photos sont non contractuelles et peuvent légèrement différer du produit."] },
            { h: "Commande", p: ["La commande est ferme après confirmation téléphonique. Nous nous réservons le droit de refuser ou d'annuler toute commande inexacte, suspecte ou en cas de rupture de stock."] },
            { h: "Paiement", p: ["Le paiement s'effectue en espèces à la livraison."] },
            { h: "Livraison et retours", p: ["Les politiques de livraison et de retours publiées sur ce site s'appliquent."] },
            { h: "Utilisation et responsabilité", p: ["Lisez la liste des ingrédients et le mode d'emploi avant utilisation et faites un test sur une petite zone. En cas de peau sensible, de grossesse ou de condition médicale, demandez conseil à un professionnel. Nos produits sont des cosmétiques et non des médicaments."] },
            { h: "Droit applicable", p: ["Les présentes conditions sont soumises au droit marocain. Tout litige relève des tribunaux marocains compétents."] },
            ...(contactLines.length ? [{ h: "Coordonnées du vendeur", p: [brand, ...contactLines] }] : [])
          ]
        },

    privacy: ar
      ? {
          slug, title: "سياسة الخصوصية",
          intro: `توضح هذه السياسة كيف يجمع ${brand} بياناتك الشخصية ويستخدمها ويحميها، وفقاً للقانون المغربي رقم 09.08.`,
          sections: [
            { h: "البيانات التي نجمعها", p: ["عند تقديم طلب: الاسم، رقم الهاتف، المدينة والعنوان وأي ملاحظة تضيفينها.", "بيانات التصفح: الصفحات التي تزورينها ومصدر الزيارة (مثل إعلان)، عبر ملفات تعريف الارتباط وأدوات القياس."] },
            { h: "كيف نستخدمها", p: ["لمعالجة طلبك وتأكيده وتوصيله والتواصل معك بشأنه.", "لتحسين الموقع وقياس فعالية إعلاناتنا.", "لا نبيع بياناتك لأي طرف ثالث."] },
            { h: "أدوات الإعلان والتحليل", p: ["نستخدم أدوات مثل Meta Pixel وTikTok Pixel وGoogle Analytics لقياس الزيارات والتحويلات وعرض إعلانات ملائمة. قد تقوم هذه الأدوات بوضع ملفات تعريف ارتباط وجمع بيانات تصفح مجهولة أو شبه مجهولة وفق سياسات مزوديها. يمكنك التحكم في ملفات الارتباط من إعدادات متصفحك."] },
            { h: "مشاركة البيانات", p: ["نشارك البيانات الضرورية فقط مع شركات التوصيل لإتمام الطلب، ومع مزودي الاستضافة والتقنية الذين يعالجونها نيابة عنا."] },
            { h: "مدة الاحتفاظ", p: ["نحتفظ ببيانات الطلبات المدة اللازمة لتنفيذها وللالتزامات القانونية والمحاسبية، ثم نحذفها أو نجعلها مجهولة."] },
            { h: "حقوقك", p: [`لك الحق في الاطلاع على بياناتك وتصحيحها وحذفها والاعتراض على معالجتها. للاستفادة من هذه الحقوق${email ? ` راسلينا على ${email}` : " تواصلي معنا"} (انظري أيضاً صفحة حذف البيانات).`] },
            { h: "الأمان", p: ["نعتمد إجراءات تقنية وتنظيمية معقولة لحماية بياناتك. لا نطلب أي بيانات بنكية لأن الدفع يتم عند الاستلام."] },
            { h: "التعديلات", p: ["قد نحدّث هذه السياسة من وقت لآخر، وتُنشر النسخة الحالية دائماً على هذه الصفحة."] }
          ]
        }
      : {
          slug, title: "Politique de confidentialité",
          intro: `Cette politique explique comment ${brand} collecte, utilise et protège vos données personnelles, conformément à la loi marocaine n° 09-08.`,
          sections: [
            { h: "Données collectées", p: ["Lors d'une commande : nom, numéro de téléphone, ville, adresse et toute note que vous ajoutez.", "Données de navigation : pages consultées et source de la visite (par exemple une publicité), via des cookies et des outils de mesure."] },
            { h: "Utilisation", p: ["Traiter, confirmer et livrer votre commande, et vous contacter à ce sujet.", "Améliorer le site et mesurer l'efficacité de nos publicités.", "Nous ne vendons pas vos données à des tiers."] },
            { h: "Publicité et statistiques", p: ["Nous utilisons des outils comme Meta Pixel, TikTok Pixel et Google Analytics pour mesurer les visites et conversions et afficher des publicités pertinentes. Ces outils peuvent déposer des cookies et collecter des données de navigation selon les politiques de leurs éditeurs. Vous pouvez gérer les cookies dans les paramètres de votre navigateur."] },
            { h: "Partage des données", p: ["Nous partageons uniquement les données nécessaires avec les sociétés de livraison pour exécuter la commande, ainsi qu'avec nos prestataires d'hébergement et techniques qui les traitent pour notre compte."] },
            { h: "Durée de conservation", p: ["Nous conservons les données de commande le temps nécessaire à leur exécution et à nos obligations légales et comptables, puis nous les supprimons ou les anonymisons."] },
            { h: "Vos droits", p: [`Vous pouvez accéder à vos données, les rectifier, les supprimer ou vous opposer à leur traitement. Pour cela, écrivez-nous${email ? ` à ${email}` : ""} (voir aussi la page Suppression des données).`] },
            { h: "Sécurité", p: ["Nous appliquons des mesures techniques et organisationnelles raisonnables pour protéger vos données. Nous ne demandons aucune donnée bancaire, le paiement se faisant à la livraison."] },
            { h: "Modifications", p: ["Nous pouvons mettre à jour cette politique ; la version en vigueur est toujours celle publiée sur cette page."] }
          ]
        },

    "data-deletion": ar
      ? {
          slug, title: "حذف البيانات",
          intro: "يمكنك في أي وقت طلب حذف بياناتك الشخصية التي نحتفظ بها.",
          sections: [
            { h: "كيف تطلبين الحذف", p: [`أرسلي رسالة${email ? ` إلى ${email}` : ""}${s.whatsapp ? ` أو عبر واتساب ${s.whatsapp}` : ""} بعنوان «حذف البيانات»، مع الاسم ورقم الهاتف المستعمل في الطلب.`] },
            { h: "ماذا يحدث بعد ذلك", p: ["نتحقق من هويتك ثم نحذف بياناتك أو نجعلها مجهولة خلال 30 يوماً، باستثناء ما يلزمنا القانون بالاحتفاظ به (مثل المعطيات المحاسبية).", "نؤكد لك الحذف بعد إتمامه."] },
            { h: "بيانات الإعلانات", p: ["للتحكم في بيانات الإعلانات المرتبطة بحسابك على فيسبوك أو إنستغرام أو تيك توك، يمكنك استعمال إعدادات الإعلانات والخصوصية في تلك المنصات."] }
          ]
        }
      : {
          slug, title: "Suppression des données",
          intro: "Vous pouvez à tout moment demander la suppression des données personnelles que nous détenons sur vous.",
          sections: [
            { h: "Comment faire", p: [`Envoyez un message${email ? ` à ${email}` : ""}${s.whatsapp ? ` ou sur WhatsApp ${s.whatsapp}` : ""} avec l'objet « Suppression des données », en indiquant le nom et le numéro de téléphone utilisés pour la commande.`] },
            { h: "Ensuite", p: ["Nous vérifions votre identité puis supprimons ou anonymisons vos données sous 30 jours, sauf celles que la loi nous oblige à conserver (par exemple les données comptables).", "Nous vous confirmons la suppression une fois effectuée."] },
            { h: "Données publicitaires", p: ["Pour gérer les données publicitaires liées à votre compte Facebook, Instagram ou TikTok, utilisez les paramètres de publicité et de confidentialité de ces plateformes."] }
          ]
        }
  };
  return pages[slug] || null;
}
