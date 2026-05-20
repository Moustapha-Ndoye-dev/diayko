const PROMOTIONS = [
  {
    id: "promo-welcome",
    headline: "Bienvenue sur Diayko",
    body: "Frais de service réduits sur votre première commande.",
    active: true,
  },
  {
    id: "promo-seller",
    headline: "Vendez plus vite",
    body: "Mettez en avant vos articles pendant 7 jours.",
    active: true,
  },
];

const HELP_ARTICLES = [
  {
    slug: "comment-acheter",
    title: "Comment acheter sur Diayko",
    summary: "Parcourir, discuter avec le vendeur et payer en toute sécurité.",
  },
  {
    slug: "devenir-vendeur",
    title: "Devenir vendeur",
    summary: "Demandez l'accès vendeur depuis votre profil.",
  },
];

export function listPromotions() {
  return { promotions: PROMOTIONS.filter((p) => p.active) };
}

export function getPromotion(id: string) {
  const promo = PROMOTIONS.find((p) => p.id === id);
  if (!promo) return null;
  return promo;
}

export function listHelpArticles() {
  return { articles: HELP_ARTICLES };
}
