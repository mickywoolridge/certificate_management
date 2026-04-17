import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

async function main() {
  await prisma.certificate.deleteMany();

  const today = new Date();
  today.setUTCHours(12, 0, 0, 0);

  await prisma.certificate.createMany({
    data: [
      {
        system: "api.example.com",
        name: "API wildcard TLS",
        startDate: addDays(today, -400),
        endDate: addDays(today, 5),
        description: "Public API — expires soon; inside 30-day notice window.",
        ownerName: "Alex Rivera",
        ownerEmail: "alex@example.com",
        noticeQuantity: 30,
        noticeUnit: "DAYS",
      },
      {
        system: "www.example.com",
        name: "Primary site DV",
        startDate: addDays(today, -300),
        endDate: addDays(today, 120),
        description: "Renewal not urgent yet.",
        ownerName: "Jordan Lee",
        ownerEmail: "jordan@example.com",
        noticeQuantity: 30,
        noticeUnit: "DAYS",
      },
      {
        system: "mail.example.com",
        name: "SMTP submission",
        startDate: addDays(today, -200),
        endDate: addDays(today, -10),
        description: "Expired — remove or renew in your CA.",
        ownerName: "Sam Okonkwo",
        ownerEmail: "sam@example.com",
        noticeQuantity: 14,
        noticeUnit: "DAYS",
      },
      {
        system: "internal.corp",
        name: "Internal CA leaf",
        startDate: addDays(today, -500),
        endDate: addDays(today, 3),
        description: "Short notice period (2 weeks).",
        ownerName: "Casey Kim",
        ownerEmail: "casey@example.com",
        noticeQuantity: 2,
        noticeUnit: "WEEKS",
      },
      {
        system: "cdn.example.com",
        name: "CDN edge cert",
        startDate: addDays(today, -100),
        endDate: addDays(today, 12),
        description: "Notice 1 month before expiry — inside the notice window.",
        ownerName: "Morgan Patel",
        ownerEmail: "morgan@example.com",
        noticeQuantity: 1,
        noticeUnit: "MONTHS",
      },
      {
        system: "staging.example.com",
        name: "Staging wildcard",
        startDate: addDays(today, -90),
        endDate: addDays(today, 200),
        description: "Outside notice window for demo.",
        ownerName: "Riley Chen",
        ownerEmail: "riley@example.com",
        noticeQuantity: 30,
        noticeUnit: "DAYS",
      },
    ],
  });

  const count = await prisma.certificate.count();
  console.log(`Seeded ${count} certificates.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
