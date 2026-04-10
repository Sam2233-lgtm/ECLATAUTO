const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  // Seed supplements
  const suppCount = await prisma.supplement.count();
  if (suppCount === 0) {
    await prisma.supplement.createMany({ data: [
      { nameFr: 'Traitement anti-sel', nameEn: 'Anti-salt treatment', price: 19.99, order: 0 },
      { nameFr: 'Protection cire 1 mois', nameEn: 'Wax protection 1 month', price: 29.99, order: 1 },
      { nameFr: 'Protection cire 6 mois', nameEn: 'Wax protection 6 months', price: 59.99, order: 2 },
      { nameFr: 'Correction de peinture', nameEn: 'Paint correction', price: 79.99, order: 3 },
      { nameFr: 'Traitement odeur', nameEn: 'Odor treatment', price: 24.99, order: 4 },
    ]});
    console.log('✅ Supplements created');
  } else {
    console.log('Supplements already exist, skipping');
  }

  // Get vehicle categories
  const cats = await prisma.vehicleCategory.findMany({ orderBy: { order: 'asc' } });
  const catByName = {};
  for (const c of cats) { catByName[c.nameFr] = c.id; }
  console.log('Categories:', Object.keys(catByName));

  const compact = cats.find(c => c.nameFr.toLowerCase().includes('compact'))?.id;
  const berline = cats.find(c => c.nameFr.toLowerCase().includes('berline'))?.id;
  const vus = cats.find(c => c.nameFr.toLowerCase().includes('vus') || c.nameFr.toLowerCase().includes('suv'))?.id;
  const pickup = cats.find(c => c.nameFr.toLowerCase().includes('camion') || c.nameFr.toLowerCase().includes('pick'))?.id;
  const van = cats.find(c => c.nameFr.toLowerCase().includes('fourgon'))?.id;

  console.log('Cat IDs:', { compact, berline, vus, pickup, van });

  const servicesData = [
    {
      id: 'lavage-classique',
      nameFr: 'Lavage Classique',
      nameEn: 'Classic Wash',
      descriptionFr: 'Lavage complet intérieur et extérieur — la valeur parfaite pour un véhicule propre de la tête aux pieds.',
      descriptionEn: 'Complete interior and exterior wash — perfect value for a clean vehicle from top to bottom.',
      includesFr: 'Lavage extérieur complet\nAspirateur intérieur\nEssuyage des surfaces\nVitres intérieures et extérieures\nRoues et pneus nettoyés\nDésodorisant inclus',
      includesEn: 'Full exterior wash\nInterior vacuum\nSurface wipe-down\nInside & outside windows\nWheels & tires cleaned\nDeodorizer included',
      basePrice: 79.99,
      pricing: { [compact]: 79.99, [berline]: 89.99, [vus]: 99.99, [pickup]: 119.99, [van]: 139.99 },
      duration: 90,
      order: 0,
      iconName: 'Sparkles',
    },
    {
      id: 'lavage-interieur',
      nameFr: 'Lavage Intérieur',
      nameEn: 'Interior Wash',
      descriptionFr: "Nettoyage professionnel de l'habitacle complet — sièges, tapis, surfaces, vitres intérieures.",
      descriptionEn: 'Professional complete interior cleaning — seats, mats, surfaces, interior windows.',
      includesFr: 'Aspiration complète\nSièges et tapis\nTableau de bord et surfaces\nVitres intérieures\nJambières et coffre\nDésodorisant',
      includesEn: 'Full vacuuming\nSeats and mats\nDashboard and surfaces\nInterior windows\nSill plates and trunk\nDeodorizer',
      basePrice: 49.99,
      pricing: { [compact]: 49.99, [berline]: 59.99, [vus]: 69.99, [pickup]: 79.99, [van]: 99.99 },
      duration: 60,
      order: 1,
      iconName: 'Wind',
    },
    {
      id: 'lavage-exterieur',
      nameFr: 'Lavage Extérieur',
      nameEn: 'Exterior Wash',
      descriptionFr: 'Lavage haute pression, savonnage, séchage et nettoyage des roues et des vitres extérieures.',
      descriptionEn: 'High-pressure wash, soaping, drying and cleaning of wheels and exterior windows.',
      includesFr: 'Rinçage haute pression\nSavonnage complet\nSéchage soigneux\nVitres extérieures\nRoues et enjoliveurs\nArches de roues',
      includesEn: 'High-pressure rinse\nFull soap wash\nCareful drying\nExterior windows\nWheels & hubcaps\nWheel arches',
      basePrice: 39.99,
      pricing: { [compact]: 39.99, [berline]: 44.99, [vus]: 54.99, [pickup]: 64.99, [van]: 79.99 },
      duration: 45,
      order: 2,
      iconName: 'Droplets',
    },
    {
      id: 'lavage-signature',
      nameFr: 'Lavage Signature',
      nameEn: 'Signature Wash',
      descriptionFr: 'Notre service premium complet — intérieur, extérieur, shampooing, décontamination et protection. Le meilleur pour votre véhicule.',
      descriptionEn: 'Our complete premium service — interior, exterior, shampooing, decontamination and protection. The best for your vehicle.',
      includesFr: 'Tout du Lavage Classique\nShampooing sièges et tapis\nDécontamination extérieure\nArgile décontaminante\nApplication cire premium\nProtection UV',
      includesEn: 'Everything in Classic Wash\nSeat & mat shampooing\nExterior decontamination\nClay bar treatment\nPremium wax application\nUV protection',
      basePrice: 119.99,
      pricing: { [compact]: 119.99, [berline]: 129.99, [vus]: 149.99, [pickup]: 179.99, [van]: 229.99 },
      duration: 180,
      order: 3,
      iconName: 'Star',
    },
  ];

  // Upsert services
  for (const s of servicesData) {
    await prisma.service.upsert({
      where: { id: s.id },
      update: { nameFr: s.nameFr, nameEn: s.nameEn, descriptionFr: s.descriptionFr, descriptionEn: s.descriptionEn, includesFr: s.includesFr, includesEn: s.includesEn, basePrice: s.basePrice, pricing: s.pricing, duration: s.duration, order: s.order, iconName: s.iconName },
      create: { id: s.id, nameFr: s.nameFr, nameEn: s.nameEn, descriptionFr: s.descriptionFr, descriptionEn: s.descriptionEn, includesFr: s.includesFr, includesEn: s.includesEn, basePrice: s.basePrice, pricing: s.pricing, duration: s.duration, order: s.order, iconName: s.iconName },
    });
  }
  console.log('✅ 4 services updated');
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
