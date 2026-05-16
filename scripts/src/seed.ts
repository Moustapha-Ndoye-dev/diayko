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

const SOPHIE_ID = "00000000-0000-0000-0000-000000000001";

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await db.delete(orderEventsTable);
  await db.delete(ordersTable);
  await db.delete(likesTable);
  await db.delete(messagesTable);
  await db.delete(conversationsTable);
  await db.delete(itemImagesTable);
  await db.delete(itemsTable);
  await db.delete(usersTable);
  console.log("✓ Cleared existing data");

  // Create users — Sophie uses a fixed id so the mobile app's "current user" matches.
  const [sophie, emma, lucas, chloe, mathieu] = await db
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
        name: "Emma Faye",
        bio: "Pièces vintage, dressing minimaliste.",
        rating: "4.7",
        reviewCount: 64,
        itemCount: 23,
        followersCount: 180,
        followingCount: 45,
      },
      {
        name: "Lucas Ndiaye",
        bio: "Articles de qualité à prix justes.",
        rating: "4.8",
        reviewCount: 92,
        itemCount: 31,
        followersCount: 210,
        followingCount: 120,
      },
      {
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
        name: "Mathieu Sarr",
        bio: "Je vide mon dressing.",
        rating: "4.6",
        reviewCount: 33,
        itemCount: 12,
        followersCount: 58,
        followingCount: 21,
      },
    ])
    .returning();

  console.log("✓ Created 5 users");

  const items = await db
    .insert(itemsTable)
    .values([
      {
        title: "Robe wax ankara multicolore",
        brand: "Artisan local",
        price: "18000",
        originalPrice: "32000",
        size: "M",
        condition: "Like new",
        category: "women",
        description: "Robe en wax 100% coton, portée une fois pour un mariage. État impeccable.",
        color: "Multicolore",
        sellerId: sophie.id,
        likesCount: 24,
        viewsCount: 158,
      },
      {
        title: "Boubou brodé homme",
        brand: "Atelier Dakar",
        price: "25000",
        originalPrice: "45000",
        size: "L",
        condition: "Good",
        category: "men",
        description: "Boubou traditionnel brodé main, parfait pour les grandes occasions.",
        color: "Blanc cassé",
        sellerId: emma.id,
        likesCount: 41,
        viewsCount: 302,
      },
      {
        title: "Sac en cuir bogolan",
        brand: "Maison Teranga",
        price: "15000",
        originalPrice: "28000",
        size: "Taille unique",
        condition: "Good",
        category: "bags",
        description: "Sac bandoulière en cuir avec motifs bogolan. Bandoulière réglable.",
        color: "Marron",
        sellerId: lucas.id,
        likesCount: 18,
        viewsCount: 94,
      },
      {
        title: "Sneakers blanches cuir",
        brand: "Nike",
        price: "25000",
        originalPrice: "55000",
        size: "42",
        condition: "Like new",
        category: "shoes",
        description: "Sneakers Air Force 1 quasi neuves. Portées deux fois. Boîte d'origine incluse.",
        color: "Blanc",
        sellerId: chloe.id,
        likesCount: 87,
        viewsCount: 534,
      },
      {
        title: "Jean slim délavé homme",
        brand: "Zara",
        price: "12500",
        originalPrice: "25000",
        size: "32",
        condition: "Good",
        category: "men",
        description: "Jean slim en bon état. Coupe ajustée. Quelques signes d'usage très légers.",
        color: "Bleu délavé",
        sellerId: mathieu.id,
        likesCount: 33,
        viewsCount: 210,
      },
      {
        title: "Foulard en soie motifs africains",
        brand: "COS",
        price: "8500",
        originalPrice: "18000",
        size: "Taille unique",
        condition: "Like new",
        category: "women",
        description: "Foulard en soie pure aux motifs inspirés du continent. Comme neuf.",
        color: "Or",
        sellerId: sophie.id,
        likesCount: 56,
        viewsCount: 389,
      },
      {
        title: "Pantalon chino lin",
        brand: "Uniqlo",
        price: "9000",
        originalPrice: "20000",
        size: "32",
        condition: "Good",
        category: "men",
        description: "Pantalon en lin léger, parfait pour le climat dakarois.",
        color: "Beige",
        sellerId: lucas.id,
        likesCount: 12,
        viewsCount: 78,
      },
      {
        title: "Chemise wax femme",
        brand: "Massimo Dutti",
        price: "11000",
        originalPrice: "24000",
        size: "S",
        condition: "Like new",
        category: "women",
        description: "Chemise en tissu wax cintrée, motifs élégants.",
        color: "Bleu/blanc",
        sellerId: chloe.id,
        likesCount: 29,
        viewsCount: 145,
      },
    ])
    .returning();

  console.log(`✓ Created ${items.length} items`);

  const imageUrls = [
    "https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=400",
    "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=400",
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400",
    "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400",
    "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400",
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400",
  ];

  await db.insert(itemImagesTable).values(
    items.map((item, i) => ({
      itemId: item.id,
      url: imageUrls[i] ?? imageUrls[0],
      position: 0,
    }))
  );
  console.log("✓ Assigned images to items");

  // Sophie likes a few items → drives the favorites screen.
  await db.insert(likesTable).values([
    { userId: sophie.id, itemId: items[1]!.id },
    { userId: sophie.id, itemId: items[3]!.id },
    { userId: sophie.id, itemId: items[6]!.id },
  ]);
  console.log("✓ Seeded 3 favorites for Sophie");

  // Sophie's orders → drives my-purchases and deliveries screens.
  const STEPS = [
    "Commande confirmée",
    "Prise en charge par le vendeur",
    "En transit",
    "En cours de livraison",
    "Livré",
  ];

  const orderDefs = [
    {
      item: items[0]!,
      status: "delivered" as const,
      paymentMethod: "wave",
      carrier: "Wave Express",
      eta: "Livré le 14 mai",
      doneSteps: 5,
    },
    {
      item: items[4]!,
      status: "in_transit" as const,
      paymentMethod: "orange_money",
      carrier: "DHL Sénégal",
      eta: "Demain · 14h-17h",
      doneSteps: 3,
    },
    {
      item: items[3]!,
      status: "processing" as const,
      paymentMethod: "free_money",
      carrier: "Sahel Logistique",
      eta: "2-4 jours ouvrés",
      doneSteps: 1,
    },
  ];

  for (const [i, def] of orderDefs.entries()) {
    const [order] = await db
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
    await db.insert(orderEventsTable).values(
      STEPS.map((label, position) => ({
        orderId: order.id,
        label,
        position,
        done: position < def.doneSteps,
        occurredAt: position < def.doneSteps ? new Date(Date.now() - (5 - position) * 86400000) : null,
      })),
    );
  }
  console.log(`✓ Created ${orderDefs.length} orders with timeline events`);

  // Sample conversation
  const [conv] = await db
    .insert(conversationsTable)
    .values({
      buyerId: emma.id,
      sellerId: sophie.id,
      itemId: items[0]!.id,
      lastMessage: "La robe est-elle toujours disponible ?",
      lastMessageAt: new Date(),
      unreadCount: 1,
    })
    .returning();

  await db.insert(messagesTable).values({
    conversationId: conv!.id,
    senderId: emma.id,
    text: "La robe est-elle toujours disponible ?",
  });
  console.log("✓ Created sample conversation");

  console.log("\n✅ Seed complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
