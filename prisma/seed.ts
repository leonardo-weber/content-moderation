import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();

  const p1 = await prisma.post.create({
    data: {
      authorName: "MIAMI + RWorld",
      authorRole: "Official",
      content:
        "Important update: The new commission transparency rules take effect November 1st. All agents must use the updated disclosure forms for residential transactions. Please review the updated guidelines and download the new forms from the Resources section.\n\nA mandatory compliance webinar will be held on October 20th.",
      category: "announcement",
      contentType: "text",
      likes: 134,
      shares: 67,
      isPinned: true,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
  });

  const p2 = await prisma.post.create({
    data: {
      authorName: "MIAMI + RWorld Events",
      authorRole: "Events Team",
      content:
        "Join us for the Annual Networking Mixer next Thursday! Connect with fellow agents, meet industry partners, and enjoy an evening of great conversation. Light refreshments will be provided.\n\nSpace is limited — register now through the Events tab.",
      category: "event",
      contentType: "event",
      mediaPlaceholder:
        "MIAMI + RWorld Networking Mixer - Thu, Oct 22 at 6:00 PM - The Boca Raton Resort",
      likes: 89,
      shares: 31,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
  });

  const p3 = await prisma.post.create({
    data: {
      authorName: "MIAMI + RWorld Education",
      authorRole: "Education Department",
      content:
        'New CE course available: "Advanced Negotiation Strategies for Luxury Markets" — 3 CE credits. This course covers advanced techniques for handling high-value transactions, international buyer expectations, and multi-offer scenarios. Enroll today and complete at your own pace.',
      category: "training",
      contentType: "video",
      mediaPlaceholder:
        "Advanced Negotiation Strategies for Luxury Markets — 3 CE Credits — 2h 15m",
      likes: 76,
      shares: 24,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
  });

  const p4 = await prisma.post.create({
    data: {
      authorName: "MIAMI + RWorld",
      authorRole: "Official",
      content:
        "Q3 2026 Market Report is here! Key highlights:\n\n- Median home price: $412,300 (up 4.1% YoY)\n- Inventory levels: +18% vs last year\n- Average days on market: 28 days\n- Luxury segment ($2M+): International buyer activity up 22%\n\nDownload the full report in the Resources section.",
      category: "market-report",
      contentType: "image",
      mediaPlaceholder:
        "Q3 2026 South Florida Market Report — Key metrics and trends infographic",
      likes: 112,
      shares: 53,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  });

  const p5 = await prisma.post.create({
    data: {
      authorName: "MIAMI + RWorld",
      authorRole: "Official",
      content:
        "Congratulations to our October Top Producers!\n\n- Sarah Mitchell (Compass Florida) — $12.4M in closings\n- Carlos Mendez (South Beach Realty) — $9.8M in closings\n- Emily Chen (Douglas Elliman) — $8.2M in closings\n\nThank you for your outstanding work and dedication to our community!",
      category: "member-spotlight",
      contentType: "image",
      mediaPlaceholder:
        "October 2026 Top Producers — Sarah Mitchell, Carlos Mendez, Emily Chen",
      likes: 203,
      shares: 18,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  });

  await prisma.post.create({
    data: {
      authorName: "MIAMI + RWorld",
      authorRole: "Official",
      content:
        "We are excited to announce a new partnership with SecureTitle Insurance, offering all MIAMI + RWorld members a 15% discount on title insurance services. This is part of our ongoing effort to bring you valuable benefits that support your business.\n\nDetails and enrollment instructions are available in your member portal.",
      category: "benefits",
      contentType: "text",
      likes: 67,
      shares: 29,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.post.create({
    data: {
      authorName: "MIAMI + RWorld Education",
      authorRole: "Education Department",
      content:
        'Missed the "Future of International Real Estate in South Florida" panel at our annual conference? The full recording is now available! Hear from top industry leaders about emerging trends, international buyer profiles, and cross-border transaction strategies.',
      category: "training",
      contentType: "video",
      mediaPlaceholder:
        "Panel: The Future of International Real Estate in South Florida — 45:32",
      likes: 63,
      shares: 14,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.post.create({
    data: {
      authorName: "MIAMI + RWorld",
      authorRole: "Operations",
      content:
        "Scheduled maintenance notice: The MLS listing platform will undergo system maintenance this Saturday (Oct 18) from 2:00 AM to 6:00 AM EST. During this time, listing search and data entry will be temporarily unavailable. Please plan accordingly.\n\nAll other services, including messaging and member portal, will remain operational.",
      category: "operations",
      contentType: "text",
      likes: 24,
      shares: 11,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  const c1 = await prisma.comment.create({
    data: {
      postId: p1.id,
      authorName: "Sarah Mitchell",
      authorRole: "Licensed Real Estate Agent",
      text: "Thanks for the heads up! Where can we download the updated disclosure forms?",
      likes: 8,
      createdAt: new Date(Date.now() - 45 * 60 * 1000),
    },
  });

  await prisma.comment.create({
    data: {
      postId: p1.id,
      parentId: c1.id,
      authorName: "MIAMI + RWorld",
      authorRole: "Official",
      text: "Hi Sarah! The forms are available under Resources > Forms & Documents. Let us know if you need any help.",
      likes: 12,
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
    },
  });

  await prisma.comment.create({
    data: {
      postId: p1.id,
      authorName: "Michael Thompson",
      authorRole: "Managing Broker",
      text: "Will the compliance webinar be recorded for those who cannot attend live?",
      likes: 15,
      createdAt: new Date(Date.now() - 40 * 60 * 1000),
    },
  });

  await prisma.comment.create({
    data: {
      postId: p2.id,
      authorName: "Emily Chen",
      authorRole: "Realtor",
      text: "Just registered! Looking forward to connecting with everyone.",
      likes: 5,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  });

  await prisma.comment.create({
    data: {
      postId: p2.id,
      authorName: "Carlos Mendez",
      authorRole: "Broker Owner",
      text: "These mixers are always great. See you all there!",
      likes: 3,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
  });

  const c5 = await prisma.comment.create({
    data: {
      postId: p4.id,
      authorName: "Amanda Foster",
      authorRole: "Senior Sales Associate",
      text: "The international buyer data is really interesting. Are there plans for a webinar diving deeper into that segment?",
      likes: 9,
      createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
    },
  });

  await prisma.comment.create({
    data: {
      postId: p4.id,
      parentId: c5.id,
      authorName: "James Rodriguez",
      authorRole: "Broker Associate",
      text: "I would attend that for sure. The Latin American market has been very active in my area.",
      likes: 6,
      createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
    },
  });

  await prisma.comment.create({
    data: {
      postId: p4.id,
      authorName: "Rachel Green",
      authorRole: "Realtor Associate",
      text: "Great to see inventory improving. Hopefully this helps with affordability.",
      likes: 4,
      createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000),
    },
  });

  await prisma.comment.create({
    data: {
      postId: p5.id,
      authorName: "David Park",
      authorRole: "Real Estate Consultant",
      text: "Congrats Sarah, Carlos, and Emily! Well deserved recognition.",
      likes: 11,
      createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
    },
  });

  await prisma.comment.create({
    data: {
      postId: p5.id,
      authorName: "Michael Thompson",
      authorRole: "Managing Broker",
      text: "Amazing numbers! Inspiring to see our members doing so well.",
      likes: 7,
      createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
    },
  });

  console.log("Seed complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
