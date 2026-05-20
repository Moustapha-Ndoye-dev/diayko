import { db } from "@workspace/db";
import {
  usersTable,
  itemsTable,
  itemImagesTable,
  conversationsTable,
  messagesTable,
  likesTable,
  ordersTable,
  orderEventsTable,
} from "@workspace/db/schema";

type SeedInsertResult = PromiseLike<unknown> & {
  returning(): Promise<any[]>;
};

type SeedDb = {
  delete(table: unknown): PromiseLike<unknown>;
  insert(table: unknown): {
    values(values: unknown): SeedInsertResult;
  };
};

const seedDb = db as unknown as SeedDb;

const SOPHIE_ID = "seed-sophie";
const EMMA_ID = "seed-emma";
const LUCAS_ID = "seed-lucas";
const CHLOE_ID = "seed-chloe";
const MATHIEU_ID = "seed-mathieu";

async function seed() {
  console.log("🌱 Seeding database...");

  await seedDb.delete(orderEventsTable);
  await seedDb.delete(ordersTable);
  await seedDb.delete(likesTable);
  await seedDb.delete(messagesTable);
  await seedDb.delete(conversationsTable);
  await seedDb.delete(itemImagesTable);
  await seedDb.delete(itemsTable);
  await seedDb.delete(usersTable);
  console.log("✓ Cleared existing data");

  const [sophie, emma, lucas, chloe, mathieu, aminata, omar, fatou, ibra, ndeye] = await seedDb
    .insert(usersTable)
    .values([
      {
        id: SOPHIE_ID,
        name: "Sophie Diop",
        bio: "Amatrice de mode durable, vendeuse vérifiée à Dakar.",
        rating: "4.9",
        reviewCount: 128,
        itemCount: 45,
        followersCount: 320,
        followingCount: 89,
        verified: true,
      },
      {
        id: EMMA_ID,
        name: "Emma Faye",
        bio: "Pièces vintage, dressing minimaliste.",
        rating: "4.7",
        reviewCount: 64,
        itemCount: 23,
        followersCount: 180,
        followingCount: 45,
      },
      {
        id: LUCAS_ID,
        name: "Lucas Ndiaye",
        bio: "Articles de qualité à prix justes.",
        rating: "4.8",
        reviewCount: 92,
        itemCount: 31,
        followersCount: 210,
        followingCount: 120,
      },
      {
        id: CHLOE_ID,
        name: "Chloé Ba",
        bio: "Expédition rapide, descriptions honnêtes !",
        rating: "5.0",
        reviewCount: 47,
        itemCount: 18,
        followersCount: 95,
        followingCount: 37,
        verified: true,
      },
      {
        id: MATHIEU_ID,
        name: "Mathieu Sarr",
        bio: "Je vide mon dressing.",
        rating: "4.6",
        reviewCount: 33,
        itemCount: 12,
        followersCount: 58,
        followingCount: 21,
      },
      {
        id: "seed-aminata",
        name: "Aminata Sow",
        bio: "Créatrice de mode, pièces uniques.",
        rating: "4.9",
        reviewCount: 74,
        itemCount: 28,
        followersCount: 412,
        followingCount: 55,
        verified: true,
      },
      {
        id: "seed-omar",
        name: "Omar Diallo",
        bio: "Sneakers et streetwear — authentiques garantis.",
        rating: "4.8",
        reviewCount: 111,
        itemCount: 36,
        followersCount: 540,
        followingCount: 98,
        verified: true,
      },
      {
        id: "seed-fatou",
        name: "Fatou Mbaye",
        bio: "Mode enfant et maternité, bonne humeur garantie.",
        rating: "4.7",
        reviewCount: 39,
        itemCount: 20,
        followersCount: 130,
        followingCount: 60,
      },
      {
        id: "seed-ibra",
        name: "Ibrahima Cissé",
        bio: "Sport et outdoor — matériel pro d'occasion.",
        rating: "4.9",
        reviewCount: 55,
        itemCount: 16,
        followersCount: 200,
        followingCount: 44,
      },
      {
        id: "seed-ndeye",
        name: "Ndéye Thiam",
        bio: "Bijoux et accessoires artisanaux du Sénégal.",
        rating: "5.0",
        reviewCount: 88,
        itemCount: 42,
        followersCount: 760,
        followingCount: 110,
        verified: true,
      },
    ])
    .returning();

  console.log("✓ Created 10 users");

  // ── Items ────────────────────────────────────────────────────────────────────
  // Images: curated Unsplash URLs per category, 2–3 angles per item.

  const WOMEN_IMGS = [
    // robe wax
    [
      "https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=600&auto=format",
      "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?w=600&auto=format",
    ],
    // chemise wax
    [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format",
      "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&auto=format",
    ],
    // robe longue
    [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&auto=format",
    ],
    // top
    [
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&auto=format",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format",
    ],
    // foulard
    [
      "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=600&auto=format",
      "https://images.unsplash.com/photo-1565462972492-4fb9e36fce87?w=600&auto=format",
    ],
  ];

  const MEN_IMGS = [
    // boubou
    [
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600&auto=format",
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format",
    ],
    // jean slim
    [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format",
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format",
    ],
    // pantalon lin
    [
      "https://images.unsplash.com/photo-1594938298603-c8148c4b4f9b?w=600&auto=format",
      "https://images.unsplash.com/photo-1584865288642-42078afe6942?w=600&auto=format",
    ],
    // chemise coton
    [
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format",
      "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&auto=format",
    ],
  ];

  const SHOES_IMGS = [
    // sneakers blanches
    [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format",
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&auto=format",
    ],
    // baskets sport
    [
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&auto=format",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format",
    ],
    // sandales cuir
    [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format",
      "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=600&auto=format",
    ],
    // mocassins
    [
      "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&auto=format",
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&auto=format",
    ],
  ];

  const BAGS_IMGS = [
    // sac bogolan
    [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format",
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&auto=format",
    ],
    // sac à main
    [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format",
      "https://images.unsplash.com/photo-1594938374182-a57f63a49a69?w=600&auto=format",
    ],
    // sac à dos
    [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&auto=format",
    ],
  ];

  const KIDS_IMGS = [
    [
      "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&auto=format",
      "https://images.unsplash.com/photo-1503944583220-6c1f3d16b3b1?w=600&auto=format",
    ],
    [
      "https://images.unsplash.com/photo-1543051932-6ef9fecfff3c?w=600&auto=format",
      "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=600&auto=format",
    ],
    [
      "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=600&auto=format",
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&auto=format",
    ],
  ];

  const ACC_IMGS = [
    // montre
    [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format",
      "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600&auto=format",
    ],
    // collier
    [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format",
      "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&auto=format",
    ],
    // ceinture
    [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a45?w=600&auto=format",
      "https://images.unsplash.com/photo-1624913503273-5f9c4e980dba?w=600&auto=format",
    ],
  ];

  const SPORT_IMGS = [
    [
      "https://images.unsplash.com/photo-1539794830467-1f1755804d13?w=600&auto=format",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format",
    ],
    [
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format",
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format",
    ],
  ];

  type ItemInsert = {
    title: string;
    brand: string;
    price: string;
    originalPrice: string;
    size: string;
    condition: "New" | "Like new" | "Good" | "Fair";
    category: string;
    description: string;
    color: string;
    sellerId: string;
    likesCount: number;
    viewsCount: number;
    images: string[];
  };

  const itemDefs: ItemInsert[] = [
    // ── Femmes ────────────────────────────────────────────────────────────────
    {
      title: "Robe wax ankara multicolore",
      brand: "Artisan local",
      price: "18000", originalPrice: "32000",
      size: "M", condition: "Like new", category: "women",
      description: "Robe en wax 100% coton, portée une fois pour un mariage. État impeccable, broderies main.",
      color: "Multicolore", sellerId: sophie.id,
      likesCount: 24, viewsCount: 158,
      images: WOMEN_IMGS[0]!,
    },
    {
      title: "Chemise wax cintrée",
      brand: "Massimo Dutti",
      price: "11000", originalPrice: "24000",
      size: "S", condition: "Like new", category: "women",
      description: "Chemise en tissu wax cintrée, motifs géométriques élégants. Comme neuf.",
      color: "Bleu/blanc", sellerId: chloe.id,
      likesCount: 29, viewsCount: 145,
      images: WOMEN_IMGS[1]!,
    },
    {
      title: "Robe longue fluide",
      brand: "Zara",
      price: "14000", originalPrice: "28000",
      size: "S", condition: "Good", category: "women",
      description: "Robe longue légère, parfaite pour les soirées estivales à Dakar.",
      color: "Ivoire", sellerId: aminata.id,
      likesCount: 41, viewsCount: 276,
      images: WOMEN_IMGS[2]!,
    },
    {
      title: "Top en soie imprimé",
      brand: "H&M",
      price: "7500", originalPrice: "15000",
      size: "M", condition: "Good", category: "women",
      description: "Top en soie légère avec imprimé floral. Légèrement porté.",
      color: "Rose poudré", sellerId: emma.id,
      likesCount: 18, viewsCount: 112,
      images: WOMEN_IMGS[3]!,
    },
    {
      title: "Foulard en soie motifs africains",
      brand: "COS",
      price: "8500", originalPrice: "18000",
      size: "Taille unique", condition: "Like new", category: "women",
      description: "Foulard en soie pure aux motifs inspirés du continent. Comme neuf.",
      color: "Or", sellerId: sophie.id,
      likesCount: 56, viewsCount: 389,
      images: WOMEN_IMGS[4]!,
    },

    // ── Hommes ────────────────────────────────────────────────────────────────
    {
      title: "Boubou brodé homme",
      brand: "Atelier Dakar",
      price: "25000", originalPrice: "45000",
      size: "L", condition: "Good", category: "men",
      description: "Boubou traditionnel brodé main, parfait pour les grandes occasions sénégalaises.",
      color: "Blanc cassé", sellerId: emma.id,
      likesCount: 41, viewsCount: 302,
      images: MEN_IMGS[0]!,
    },
    {
      title: "Jean slim délavé",
      brand: "Zara",
      price: "12500", originalPrice: "25000",
      size: "32", condition: "Good", category: "men",
      description: "Jean slim en bon état. Coupe ajustée. Quelques signes d'usage très légers.",
      color: "Bleu délavé", sellerId: mathieu.id,
      likesCount: 33, viewsCount: 210,
      images: MEN_IMGS[1]!,
    },
    {
      title: "Pantalon chino lin",
      brand: "Uniqlo",
      price: "9000", originalPrice: "20000",
      size: "32", condition: "Good", category: "men",
      description: "Pantalon en lin léger, parfait pour le climat dakarois. Entretenu avec soin.",
      color: "Beige", sellerId: lucas.id,
      likesCount: 12, viewsCount: 78,
      images: MEN_IMGS[2]!,
    },
    {
      title: "Chemise coton rayée",
      brand: "Ralph Lauren",
      price: "16000", originalPrice: "35000",
      size: "L", condition: "Like new", category: "men",
      description: "Chemise en coton Oxford rayée. Très légèrement portée, impeccable.",
      color: "Bleu/blanc", sellerId: omar.id,
      likesCount: 22, viewsCount: 165,
      images: MEN_IMGS[3]!,
    },

    // ── Chaussures ────────────────────────────────────────────────────────────
    {
      title: "Sneakers Air Force 1 blanches",
      brand: "Nike",
      price: "25000", originalPrice: "55000",
      size: "42", condition: "Like new", category: "shoes",
      description: "Portées deux fois. Boîte d'origine incluse. Semelle impeccable.",
      color: "Blanc", sellerId: chloe.id,
      likesCount: 87, viewsCount: 534,
      images: SHOES_IMGS[0]!,
    },
    {
      title: "Baskets running légères",
      brand: "Adidas",
      price: "18000", originalPrice: "40000",
      size: "41", condition: "Good", category: "shoes",
      description: "Adidas Ultraboost légèrement utilisées. Amorti toujours en excellent état.",
      color: "Noir/blanc", sellerId: ibra.id,
      likesCount: 44, viewsCount: 318,
      images: SHOES_IMGS[1]!,
    },
    {
      title: "Sandales cuir artisanales",
      brand: "Artisan Saint-Louis",
      price: "8000", originalPrice: "14000",
      size: "39", condition: "Like new", category: "shoes",
      description: "Sandales en cuir véritable faites à Saint-Louis du Sénégal. Confortables.",
      color: "Marron naturel", sellerId: ndeye.id,
      likesCount: 31, viewsCount: 204,
      images: SHOES_IMGS[2]!,
    },
    {
      title: "Mocassins cuir homme",
      brand: "Clarks",
      price: "20000", originalPrice: "42000",
      size: "43", condition: "Good", category: "shoes",
      description: "Mocassins en cuir lisse marron. Légères marques d'usure sur la semelle.",
      color: "Marron", sellerId: omar.id,
      likesCount: 15, viewsCount: 98,
      images: SHOES_IMGS[3]!,
    },

    // ── Sacs ──────────────────────────────────────────────────────────────────
    {
      title: "Sac en cuir bogolan",
      brand: "Maison Teranga",
      price: "15000", originalPrice: "28000",
      size: "Taille unique", condition: "Good", category: "bags",
      description: "Sac bandoulière en cuir avec motifs bogolan tissés. Bandoulière réglable.",
      color: "Marron/ocre", sellerId: lucas.id,
      likesCount: 18, viewsCount: 94,
      images: BAGS_IMGS[0]!,
    },
    {
      title: "Sac à main structuré",
      brand: "Michael Kors",
      price: "35000", originalPrice: "75000",
      size: "Taille unique", condition: "Like new", category: "bags",
      description: "Sac MK en cuir grainé camel. Très peu utilisé, avec sac en tissu d'origine.",
      color: "Camel", sellerId: aminata.id,
      likesCount: 63, viewsCount: 421,
      images: BAGS_IMGS[1]!,
    },
    {
      title: "Sac à dos canvas",
      brand: "Fjällräven",
      price: "22000", originalPrice: "50000",
      size: "Taille unique", condition: "Good", category: "bags",
      description: "Kanken classique en canvas vert forêt. Excellent état, aucune déchirure.",
      color: "Vert forêt", sellerId: mathieu.id,
      likesCount: 27, viewsCount: 193,
      images: BAGS_IMGS[2]!,
    },

    // ── Enfants ───────────────────────────────────────────────────────────────
    {
      title: "Ensemble pagne bébé",
      brand: "Artisan local",
      price: "6500", originalPrice: "12000",
      size: "12 mois", condition: "Like new", category: "kids",
      description: "Ensemble deux pièces en pagne coton pour bébé. Lavé avec soin, parfait état.",
      color: "Multicolore", sellerId: fatou.id,
      likesCount: 22, viewsCount: 134,
      images: KIDS_IMGS[0]!,
    },
    {
      title: "Combinaison enfant été",
      brand: "Zara Kids",
      price: "5000", originalPrice: "10000",
      size: "4 ans", condition: "Good", category: "kids",
      description: "Combinaison légère pour enfant, motifs fruits. Légèrement portée.",
      color: "Jaune", sellerId: fatou.id,
      likesCount: 14, viewsCount: 89,
      images: KIDS_IMGS[1]!,
    },
    {
      title: "Veste enfant mi-saison",
      brand: "H&M Kids",
      price: "7000", originalPrice: "15000",
      size: "6 ans", condition: "Like new", category: "kids",
      description: "Veste légère pour enfant, coupe moderne. Portée une saison.",
      color: "Marine", sellerId: emma.id,
      likesCount: 9, viewsCount: 67,
      images: KIDS_IMGS[2]!,
    },

    // ── Accessoires ───────────────────────────────────────────────────────────
    {
      title: "Montre automatique acier",
      brand: "Seiko",
      price: "45000", originalPrice: "90000",
      size: "Taille unique", condition: "Like new", category: "accessories",
      description: "Seiko 5 automatique en acier inoxydable. Révisée il y a 6 mois.",
      color: "Argent/bleu", sellerId: ibra.id,
      likesCount: 78, viewsCount: 612,
      images: ACC_IMGS[0]!,
    },
    {
      title: "Collier perles de verre",
      brand: "Artisane Ndeye",
      price: "4500", originalPrice: "8000",
      size: "Taille unique", condition: "Like new", category: "accessories",
      description: "Collier artisanal en perles de verre colorées, fait main à Dakar.",
      color: "Multicolore", sellerId: ndeye.id,
      likesCount: 35, viewsCount: 245,
      images: ACC_IMGS[1]!,
    },
    {
      title: "Ceinture cuir tressé",
      brand: "Artisan local",
      price: "5500", originalPrice: "10000",
      size: "M", condition: "Good", category: "accessories",
      description: "Ceinture en cuir tressé faite à la main. Boucle dorée, très solide.",
      color: "Marron", sellerId: lucas.id,
      likesCount: 11, viewsCount: 72,
      images: ACC_IMGS[2]!,
    },

    // ── Sport ─────────────────────────────────────────────────────────────────
    {
      title: "Maillot sport respirant",
      brand: "Nike",
      price: "8000", originalPrice: "18000",
      size: "L", condition: "Good", category: "sport",
      description: "Maillot Dri-FIT léger. Quelques lavages, toujours impeccable.",
      color: "Noir", sellerId: ibra.id,
      likesCount: 17, viewsCount: 142,
      images: SPORT_IMGS[0]!,
    },
    {
      title: "Legging sport femme",
      brand: "Adidas",
      price: "10000", originalPrice: "22000",
      size: "S", condition: "Like new", category: "sport",
      description: "Legging Adidas Techfit, compression légère. Très peu porté.",
      color: "Bleu marine", sellerId: chloe.id,
      likesCount: 38, viewsCount: 289,
      images: SPORT_IMGS[1]!,
    },
  ];

  const insertedItems = await seedDb
    .insert(itemsTable)
    .values(
      itemDefs.map(({ images: _images, ...item }) => item),
    )
    .returning();

  console.log(`✓ Created ${insertedItems.length} items`);

  // Assign images (multiple per item)
  const imageRows = insertedItems.flatMap((item, i) => {
    const urls = itemDefs[i]!.images;
    return urls.map((url, position) => ({ itemId: item.id, url, position }));
  });
  await seedDb.insert(itemImagesTable).values(imageRows);
  console.log(`✓ Assigned ${imageRows.length} images to items`);

  // Likes for Sophie
  const likeTargets = [
    insertedItems[5]!, // boubou
    insertedItems[9]!, // Air Force 1
    insertedItems[6]!, // jean slim
    insertedItems[13]!, // sac bogolan
    insertedItems[19]!, // montre
  ];
  await seedDb.insert(likesTable).values(
    likeTargets.map((item) => ({ userId: sophie.id, itemId: item.id })),
  );
  console.log("✓ Seeded 5 favorites for Sophie");

  // ── Orders ───────────────────────────────────────────────────────────────────
  const STEPS = [
    "Commande confirmée",
    "Prise en charge par le vendeur",
    "En transit",
    "En cours de livraison",
    "Livré",
  ];

  const orderDefs = [
    {
      item: insertedItems[9]!, // Air Force 1
      status: "delivered" as const,
      paymentMethod: "wave",
      carrier: "Wave Express",
      eta: "Livré le 14 mai",
      doneSteps: 5,
    },
    {
      item: insertedItems[6]!, // jean slim
      status: "in_transit" as const,
      paymentMethod: "orange_money",
      carrier: "DHL Sénégal",
      eta: "Demain · 14h-17h",
      doneSteps: 3,
    },
    {
      item: insertedItems[13]!, // sac bogolan
      status: "processing" as const,
      paymentMethod: "free_money",
      carrier: "Sahel Logistique",
      eta: "2-4 jours ouvrés",
      doneSteps: 1,
    },
  ];

  for (const [i, def] of orderDefs.entries()) {
    const [order] = await seedDb
      .insert(ordersTable)
      .values({
        buyerId: sophie.id,
        sellerId: def.item.sellerId,
        itemId: def.item.id,
        totalPrice: def.item.price,
        status: def.status,
        paymentMethod: def.paymentMethod,
        carrier: def.carrier,
        trackingId: `DK-2026-${String(10000 + i).padStart(5, "0")}`,
        eta: def.eta,
      })
      .returning();
    if (!order) continue;
    await seedDb.insert(orderEventsTable).values(
      STEPS.map((label, position) => ({
        orderId: order.id,
        label,
        position,
        done: position < def.doneSteps,
        occurredAt:
          position < def.doneSteps
            ? new Date(Date.now() - (5 - position) * 86400000)
            : null,
      })),
    );
  }
  console.log(`✓ Created ${orderDefs.length} orders with timeline events`);

  // ── Conversations ─────────────────────────────────────────────────────────
  const convDefs = [
    {
      buyer: emma, seller: sophie, item: insertedItems[0]!,
      lastMsg: "La robe est-elle toujours disponible ?",
      messages: [
        { sender: emma, text: "Bonjour ! La robe est encore disponible ?" },
        { sender: sophie, text: "Oui, toujours disponible 😊 Elle est en parfait état." },
        { sender: emma, text: "La robe est-elle toujours disponible ?" },
      ],
    },
    {
      buyer: lucas, seller: omar, item: insertedItems[9]!,
      lastMsg: "Est-ce que vous acceptez les offres ?",
      messages: [
        { sender: lucas, text: "Bonjour, les AF1 sont encore là ?" },
        { sender: omar, text: "Oui ! Comme neuves." },
        { sender: lucas, text: "Est-ce que vous acceptez les offres ?" },
      ],
    },
    {
      buyer: mathieu, seller: aminata, item: insertedItems[2]!,
      lastMsg: "Je la prends ! Comment procéder ?",
      messages: [
        { sender: mathieu, text: "Bonjour, quelle est la taille exacte ?" },
        { sender: aminata, text: "Taille S, correspond plutôt à un 38." },
        { sender: mathieu, text: "Je la prends ! Comment procéder ?" },
      ],
    },
  ];

  for (const def of convDefs) {
    const [conv] = await seedDb
      .insert(conversationsTable)
      .values({
        buyerId: def.buyer.id,
        sellerId: def.seller.id,
        itemId: def.item.id,
        lastMessage: def.lastMsg,
        lastMessageAt: new Date(),
        unreadCount: 1,
      })
      .returning();
    if (!conv) continue;
    await seedDb.insert(messagesTable).values(
      def.messages.map((m) => ({
        conversationId: conv.id,
        senderId: m.sender.id,
        text: m.text,
      })),
    );
  }
  console.log(`✓ Created ${convDefs.length} conversations`);

  console.log("\n✅ Seed complete! 25 articles · 10 vendeurs · 3 commandes · 3 conversations");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
