import { db } from "@workspace/db";
import {
  usersTable,
  itemsTable,
  itemImagesTable,
  conversationsTable,
  messagesTable,
} from "@workspace/db/schema";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:8080/api";

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await db.delete(messagesTable);
  await db.delete(conversationsTable);
  await db.delete(itemImagesTable);
  await db.delete(itemsTable);
  await db.delete(usersTable);
  console.log("✓ Cleared existing data");

  // Create users
  const [sophie, emma, lucas, chloe, mathieu] = await db
    .insert(usersTable)
    .values([
      {
        name: "Sophie Martin",
        bio: "Fashion lover, sustainable shopper. All items are from my own wardrobe.",
        rating: "4.9",
        reviewCount: 128,
        itemCount: 45,
        followersCount: 320,
        followingCount: 89,
        verified: true,
      },
      {
        name: "Emma Wilson",
        bio: "Minimalist closet, vintage finds.",
        rating: "4.7",
        reviewCount: 64,
        itemCount: 23,
        followersCount: 180,
        followingCount: 45,
      },
      {
        name: "Lucas Petit",
        bio: "Selling quality pieces at fair prices.",
        rating: "4.8",
        reviewCount: 92,
        itemCount: 31,
        followersCount: 210,
        followingCount: 120,
      },
      {
        name: "Chloe Bernard",
        bio: "Fast shipping, honest descriptions!",
        rating: "5.0",
        reviewCount: 47,
        itemCount: 18,
        followersCount: 95,
        followingCount: 37,
        verified: true,
      },
      {
        name: "Mathieu Dupont",
        bio: "Clearing out my wardrobe.",
        rating: "4.6",
        reviewCount: 33,
        itemCount: 12,
        followersCount: 58,
        followingCount: 21,
      },
    ])
    .returning();

  console.log("✓ Created 5 users");

  // Create items
  const items = await db
    .insert(itemsTable)
    .values([
      {
        title: "Classic Denim Jacket",
        brand: "Levi's",
        price: "35.00",
        originalPrice: "120.00",
        size: "M",
        condition: "Like new",
        category: "women",
        description:
          "Barely worn Levi's denim jacket in perfect condition. Great for layering. No stains or damage. Selling because it doesn't fit anymore.",
        color: "Blue",
        sellerId: sophie.id,
        likesCount: 24,
        viewsCount: 158,
      },
      {
        title: "Elegant Camel Coat",
        brand: "Zara",
        price: "55.00",
        originalPrice: "180.00",
        size: "S",
        condition: "Good",
        category: "women",
        description:
          "Beautiful camel coat, very warm and stylish. Worn a few times last winter. Minor pilling on interior but not visible when worn.",
        color: "Camel",
        sellerId: emma.id,
        likesCount: 41,
        viewsCount: 302,
      },
      {
        title: "Leather Crossbody Bag",
        brand: "Mango",
        price: "28.00",
        originalPrice: "79.00",
        size: "One Size",
        condition: "Good",
        category: "bags",
        description:
          "Sleek black leather crossbody bag. Adjustable strap, multiple compartments. Small scratch on the clasp (barely noticeable).",
        color: "Black",
        sellerId: lucas.id,
        likesCount: 18,
        viewsCount: 94,
      },
      {
        title: "Air Force 1 White",
        brand: "Nike",
        price: "65.00",
        originalPrice: "110.00",
        size: "38",
        condition: "Like new",
        category: "shoes",
        description:
          "Nike Air Force 1 in excellent condition. Worn twice. Original box included. Clean and bright white.",
        color: "White",
        sellerId: chloe.id,
        likesCount: 87,
        viewsCount: 534,
      },
      {
        title: "Floral Summer Dress",
        brand: "H&M",
        price: "15.00",
        originalPrice: "40.00",
        size: "XS",
        condition: "Good",
        category: "women",
        description:
          "Light and flowy floral dress, perfect for summer. Machine washable. Very comfortable. Worn a couple of times.",
        color: "Multicolor",
        sellerId: mathieu.id,
        likesCount: 33,
        viewsCount: 210,
      },
      {
        title: "Oversized Knit Sweater",
        brand: "COS",
        price: "42.00",
        originalPrice: "95.00",
        size: "L",
        condition: "Like new",
        category: "women",
        description:
          "COS oversized cream sweater, incredibly soft and cozy. Perfect condition, only worn once. Timeless piece.",
        color: "Cream",
        sellerId: sophie.id,
        likesCount: 56,
        viewsCount: 389,
      },
      {
        title: "Slim Chinos",
        brand: "Uniqlo",
        price: "20.00",
        originalPrice: "50.00",
        size: "32",
        condition: "Good",
        category: "men",
        description:
          "Uniqlo slim fit chinos in olive green. Very versatile, worn regularly but in great shape.",
        color: "Olive",
        sellerId: lucas.id,
        likesCount: 12,
        viewsCount: 78,
      },
      {
        title: "Silk Blouse",
        brand: "Massimo Dutti",
        price: "38.00",
        originalPrice: "99.00",
        size: "S",
        condition: "Like new",
        category: "women",
        description:
          "Elegant ivory silk blouse from Massimo Dutti. Barely worn, perfect for office or evenings.",
        color: "Ivory",
        sellerId: chloe.id,
        likesCount: 29,
        viewsCount: 145,
      },
    ])
    .returning();

  console.log(`✓ Created ${items.length} items`);

  // Assign placeholder image URLs (will be replaced by real ones in production)
  const imageUrls = [
    "https://images.unsplash.com/photo-1544642058-f763c5be6b19?w=400",
    "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=400",
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400",
    "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=400",
    "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400",
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

  // Create a conversation
  const [conv] = await db
    .insert(conversationsTable)
    .values({
      buyerId: emma.id,
      sellerId: sophie.id,
      itemId: items[0]!.id,
      lastMessage: "Is the jacket still available?",
      lastMessageAt: new Date(),
      unreadCount: 1,
    })
    .returning();

  await db.insert(messagesTable).values({
    conversationId: conv.id,
    senderId: emma.id,
    text: "Is the jacket still available?",
  });

  console.log("✓ Created sample conversation");
  console.log("\n✅ Seed complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
