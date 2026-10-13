import type { Lang } from "./types";

export type Faq = { q: string; a: string };

/**
 * Generic FAQ. REVIEW the answers (delivery times, returns policy…) and adjust
 * them to what you can actually promise before launching ads.
 */
export function faqs(lang: Lang, deliveryDays: string): Faq[] {
  if (lang === "ar") {
    return [
      { q: "كيف أطلب وأدفع؟", a: "املئي استمارة الطلب (الاسم، الهاتف، المدينة والعنوان). سنتصل بك لتأكيد الطلب، وتدفعين عند استلام الطلبية. لا حاجة لبطاقة بنكية." },
      { q: "هل التوصيل مجاني؟", a: "نعم، التوصيل مجاني لجميع مدن المغرب." },
      { q: "كم تستغرق مدة التوصيل؟", a: `عادةً بين ${deliveryDays} بعد تأكيد الطلب، حسب مدينتك.` },
      { q: "هل المنتجات طبيعية؟", a: "منتجات Rosa Alba مصنوعة بمستحضرات طبيعية مثل زيت الأركان وزيت التين الشوكي وزيت اللوز. المكونات الكاملة مكتوبة على كل علبة." },
      { q: "هل تناسب جميع أنواع البشرة؟", a: "صُممت لتناسب معظم أنواع البشرة. نوصي بتجربة صغيرة على اليد قبل أول استعمال، واستشارة طبيب الجلد في حالة بشرة حساسة أو حمل." },
      { q: "ماذا أفعل إذا كانت لدي مشكلة مع طلبيتي؟", a: "تواصلي معنا عبر واتساب وسنجد الحل في أقرب وقت." }
    ];
  }
  return [
    { q: "Comment commander et payer ?", a: "Remplissez le formulaire (nom, téléphone, ville, adresse). Nous vous appelons pour confirmer et vous payez en espèces à la réception. Aucune carte bancaire nécessaire." },
    { q: "La livraison est-elle gratuite ?", a: "Oui, la livraison est gratuite dans toutes les villes du Maroc." },
    { q: "Quel est le délai de livraison ?", a: `En général ${deliveryDays} après confirmation de la commande, selon votre ville.` },
    { q: "Les produits sont-ils naturels ?", a: "Les produits Rosa Alba sont formulés avec des actifs naturels comme l'huile d'argan, la figue de Barbarie et l'amande douce. La liste complète des ingrédients figure sur chaque emballage." },
    { q: "Conviennent-ils à tous les types de peau ?", a: "Ils sont conçus pour la plupart des types de peau. Faites un petit test sur la main avant la première utilisation, et demandez conseil à un professionnel en cas de peau sensible ou de grossesse." },
    { q: "Un souci avec ma commande ?", a: "Écrivez-nous sur WhatsApp, nous trouverons une solution rapidement." }
  ];
}

export const PILLARS = (lang: Lang) =>
  lang === "ar"
    ? [
        { icon: "🌿", t: "مكونات طبيعية", d: "زيت الأركان، التين الشوكي، اللوز الحلو والمقاديميا: كنوز مغربية في كل منتج." },
        { icon: "✨", t: "نتائج ملموسة", d: "تركيبات غنية تمنح البشرة نضارة وليونة وإشراقة يومياً." },
        { icon: "🇲🇦", t: "علامة مغربية", d: "مصنوعة في المغرب بحب، لتناسب بشرتك ومناخك." }
      ]
    : [
        { icon: "🌿", t: "Actifs naturels", d: "Argan, figue de Barbarie, amande douce, macadamia : les trésors du Maroc dans chaque soin." },
        { icon: "✨", t: "Des résultats visibles", d: "Des formules riches qui nourrissent, adoucissent et subliment la peau au quotidien." },
        { icon: "🇲🇦", t: "Marque marocaine", d: "Pensée au Maroc, avec amour, pour votre peau et votre climat." }
      ];

export const INGREDIENTS = (lang: Lang) =>
  lang === "ar"
    ? [
        { n: "زيت الأركان", d: "غني بفيتامين E والأحماض الدهنية، يغذي ويمنح الليونة." },
        { n: "زيت التين الشوكي", d: "من أثمن الزيوت، يعرف بخصائصه المضادة للتقدم في السن." },
        { n: "زيت المقاديميا", d: "قوام خفيف يغذي بعمق دون ثقل." },
        { n: "زيت اللوز الحلو", d: "يطري البشرة ويمنحها نعومة ولمعاناً طبيعياً." },
        { n: "الصبار", d: "ينعش ويرطب ويهدئ البشرة." },
        { n: "الورد", d: "يمنح لمسة عطرية وإشراقة للبشرة." }
      ]
    : [
        { n: "Huile d'argan", d: "Riche en vitamine E et acides gras, elle nourrit et assouplit." },
        { n: "Figue de Barbarie", d: "Un or liquide réputé pour ses vertus anti-âge." },
        { n: "Macadamia", d: "Texture légère qui nourrit en profondeur sans alourdir." },
        { n: "Amande douce", d: "Adoucit la peau et lui donne un éclat naturel." },
        { n: "Aloe vera", d: "Hydrate, rafraîchit et apaise." },
        { n: "Rose", d: "Une touche délicate qui révèle l'éclat du teint." }
      ];
