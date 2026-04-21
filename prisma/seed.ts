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
  await prisma.objectType.deleteMany();

  const sslType = await prisma.objectType.create({
    data: { name: "SSL certificate", slug: "ssl-certificate" },
  });
  const vpnType = await prisma.objectType.create({
    data: { name: "3rd-party VPN access", slug: "3rd-party-vpn-access" },
  });
  const ispType = await prisma.objectType.create({
    data: { name: "ISP contract", slug: "isp-contract" },
  });

  const today = new Date();
  today.setUTCHours(12, 0, 0, 0);

  const seedCertificates = [
      {
        objectTypeId: sslType.id,
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
        objectTypeId: sslType.id,
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
        objectTypeId: sslType.id,
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
        objectTypeId: sslType.id,
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
        objectTypeId: sslType.id,
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
        objectTypeId: vpnType.id,
        system: "partner-gateway.acme.example",
        name: "Partner remote access renewal",
        startDate: addDays(today, -90),
        endDate: addDays(today, 200),
        description: "Annual VPN access contract with 3rd-party support provider.",
        ownerName: "Riley Chen",
        ownerEmail: "riley@example.com",
        noticeQuantity: 30,
        noticeUnit: "DAYS",
      },
      {
        objectTypeId: vpnType.id,
        system: "legacy-vpn.partner.example",
        name: "Legacy vendor VPN agreement",
        startDate: addDays(today, -365),
        endDate: addDays(today, -15),
        description: "Expired VPN access agreement pending contract replacement.",
        ownerName: "Riley Chen",
        ownerEmail: "riley@example.com",
        noticeQuantity: 30,
        noticeUnit: "DAYS",
      },
      {
        objectTypeId: ispType.id,
        system: "Datacenter WAN link",
        name: "Primary MPLS service agreement",
        startDate: addDays(today, -180),
        endDate: addDays(today, 45),
        description: "ISP contract renewal window starts 2 months before end date.",
        ownerName: "Taylor Singh",
        ownerEmail: "taylor@example.com",
        noticeQuantity: 2,
        noticeUnit: "MONTHS",
      },
      {
        objectTypeId: ispType.id,
        system: "Backup internet circuit",
        name: "Regional failover broadband contract",
        startDate: addDays(today, -420),
        endDate: addDays(today, -40),
        description: "Expired ISP contract kept for dashboard testing coverage.",
        ownerName: "Taylor Singh",
        ownerEmail: "taylor@example.com",
        noticeQuantity: 2,
        noticeUnit: "MONTHS",
      },
    ];

  const owners = [
    { name: "Alex Rivera", email: "alex@example.com" },
    { name: "Jordan Lee", email: "jordan@example.com" },
    { name: "Sam Okonkwo", email: "sam@example.com" },
    { name: "Casey Kim", email: "casey@example.com" },
    { name: "Morgan Patel", email: "morgan@example.com" },
    { name: "Riley Chen", email: "riley@example.com" },
    { name: "Taylor Singh", email: "taylor@example.com" },
    { name: "Jamie Fox", email: "jamie@example.com" },
    { name: "Avery Lopez", email: "avery@example.com" },
    { name: "Quinn Davis", email: "quinn@example.com" },
  ];

  const systems = [
    "api",
    "portal",
    "auth",
    "billing",
    "mail",
    "cdn",
    "vpn",
    "analytics",
    "support",
    "internal",
  ];

  const domains = [
    "example.com",
    "corp.example",
    "staging.example",
    "edge.example",
    "partner.example",
  ];

  const objectTypes = [sslType, vpnType, ispType];

  const generatedCertificates = Array.from({ length: 111 }, (_, index) => {
    const owner = owners[index % owners.length];
    const objectType = objectTypes[index % objectTypes.length];
    const system = `${systems[index % systems.length]}-${String(index + 1).padStart(3, "0")}.${domains[index % domains.length]}`;
    const baseOffset = index * 3;
    const startOffset = -540 + baseOffset;
    const endOffset = -40 + baseOffset;

    return {
      objectTypeId: objectType.id,
      system,
      name: `${objectType.name} record ${String(index + 1).padStart(3, "0")}`,
      startDate: addDays(today, startOffset),
      endDate: addDays(today, endOffset),
      description: `Generated seed record ${index + 1} for larger table testing.`,
      ownerName: owner.name,
      ownerEmail: owner.email,
      noticeQuantity: (index % 3) + 1,
      noticeUnit: index % 3 === 0 ? "DAYS" : index % 3 === 1 ? "WEEKS" : "MONTHS",
    };
  });

  await prisma.certificate.createMany({
    data: [...seedCertificates, ...generatedCertificates],
  });

  const count = await prisma.certificate.count();
  const typeCount = await prisma.objectType.count();
  console.log(`Seeded ${count} tracked records across ${typeCount} object types.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
