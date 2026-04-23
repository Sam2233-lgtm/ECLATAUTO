import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SERVICES = [
  {
    id: 'exterior-basic',
    nameFr: 'Lavage extérieur de base',
    nameEn: 'Basic Exterior Wash',
    descriptionFr: 'Rinçage haute pression, savonnage complet, séchage, nettoyage des vitres et des roues.',
    descriptionEn: 'High-pressure rinse, full soap wash, drying, exterior window cleaning and wheel cleaning.',
    includesFr: 'Rinçage haute pression\nSavonnage et dégraissage\nSéchage soigneux\nVitres extérieures\nRoues et enjoliveurs',
    includesEn: 'High-pressure rinse\nSoap wash & degreasing\nCareful drying\nExterior windows\nWheels & hubcaps',
    basePrice: 49, duration: 60, order: 0, iconName: 'Droplets',
  },
  {
    id: 'exterior-interior',
    nameFr: 'Lavage extérieur + intérieur',
    nameEn: 'Exterior + Interior Wash',
    descriptionFr: "Tout le lavage extérieur plus aspirateur complet de l'habitacle, essuyage des surfaces et vitres intérieures.",
    descriptionEn: 'Full exterior wash plus complete interior vacuum, surface wipe-down and interior window cleaning.',
    includesFr: 'Tout le lavage extérieur\nAspirateur complet\nEssuyage des surfaces\nVitres intérieures\nDésodorisant inclus',
    includesEn: 'Full exterior wash\nComplete vacuum\nSurface wipe-down\nInterior windows\nDeodorizer included',
    basePrice: 89, duration: 120, order: 1, iconName: 'Sparkles',
  },
  {
    id: 'shampoo',
    nameFr: 'Shampooing sièges et tapis',
    nameEn: 'Seat & Carpet Shampoo',
    descriptionFr: 'Nettoyage en profondeur des sièges (tissu ou cuir), extraction et shampooinage des tapis, désodorisant.',
    descriptionEn: 'Deep cleaning of seats (fabric or leather), carpet extraction and shampooing, deodorizer.',
    includesFr: 'Sièges tissu ou cuir\nTapis extraits et shampooinés\nPlancher nettoyé\nTraitement anti-taches\nDésodorisant professionnel',
    includesEn: 'Fabric or leather seats\nExtracted & shampooed mats\nFloor cleaned\nStain treatment\nProfessional deodorizer',
    basePrice: 149, duration: 150, order: 2, iconName: 'Wind',
  },
  {
    id: 'decontamination',
    nameFr: 'Décontamination',
    nameEn: 'Decontamination',
    descriptionFr: 'Déferrisation, décontamination chimique complète de la carrosserie et protection temporaire.',
    descriptionEn: 'Iron removal, complete chemical decontamination of the bodywork and temporary protection.',
    includesFr: 'Déferrisation complète\nDécontamination chimique\nArgile décontaminante\nRinçage final\nProtection temporaire',
    includesEn: 'Complete iron removal\nChemical decontamination\nClay bar treatment\nFinal rinse\nTemporary protection',
    basePrice: 199, duration: 180, order: 3, iconName: 'Shield',
  },
  {
    id: 'paint-protection',
    nameFr: 'Protection peinture',
    nameEn: 'Paint Protection',
    descriptionFr: 'Application de cire ou sealant professionnel, protection UV longue durée et brillance incomparable.',
    descriptionEn: 'Application of professional wax or sealant, long-lasting UV protection and unmatched shine.',
    includesFr: 'Polish léger\nApplication de cire premium\nProtection UV\nBrillance longue durée\nHydrophobicité améliorée',
    includesEn: 'Light polish\nPremium wax application\nUV protection\nLong-lasting shine\nEnhanced hydrophobicity',
    basePrice: 299, duration: 240, order: 4, iconName: 'Star',
  },
];

const TESTIMONIALS = [
  {
    name: 'Marie Tremblay',
    location: 'Montréal',
    text: "Service exceptionnel! Mon SUV brille comme au premier jour. Le technicien était ponctuel, professionnel et très minutieux. Je recommande sans hésiter.",
    stars: 5,
    order: 0,
  },
  {
    name: 'Jean-François Bergeron',
    location: 'Laval',
    text: "J'ai pris le service de protection peinture et le résultat est impressionnant. L'équipe est vraiment compétente. Un service à domicile très pratique.",
    stars: 5,
    order: 1,
  },
  {
    name: 'Sophie Côté',
    location: 'Longueuil',
    text: "Le shampooing des sièges a complètement transformé mon intérieur. Des taches que je croyais permanentes ont disparu. Excellent rapport qualité-prix.",
    stars: 5,
    order: 2,
  },
  {
    name: 'Marc Gagnon',
    location: 'Brossard',
    text: "Deuxième fois que j'utilise Éclat Auto et je suis encore époustouflé par la qualité du travail. Le service à domicile est vraiment un avantage incroyable.",
    stars: 5,
    order: 3,
  },
];

const FAQS = [
  {
    questionFr: 'Comment fonctionne le service à domicile?',
    questionEn: 'How does the mobile service work?',
    answerFr: "Vous réservez en ligne, notre technicien se présente à l'adresse que vous indiquez à l'heure convenue avec tout l'équipement nécessaire. Vous n'avez rien à faire!",
    answerEn: "You book online, our technician arrives at your address at the agreed time with all necessary equipment. You don't have to do anything!",
    order: 0,
  },
  {
    questionFr: "Dois-je fournir de l'eau ou de l'électricité?",
    questionEn: 'Do I need to provide water or electricity?',
    answerFr: "Non, notre équipement est entièrement autonome. Nous apportons notre propre eau, électricité et tous les produits nécessaires.",
    answerEn: "No, our equipment is completely self-sufficient. We bring our own water, electricity and all necessary products.",
    order: 1,
  },
  {
    questionFr: 'Combien de temps dure un service?',
    questionEn: 'How long does a service take?',
    answerFr: "La durée varie selon le service choisi: 1h pour le lavage extérieur de base, jusqu'à 4h pour la protection peinture. Vous recevrez une estimation lors de la réservation.",
    answerEn: "Duration varies by service: 1h for basic exterior wash, up to 4h for paint protection. You'll receive an estimate at booking.",
    order: 2,
  },
  {
    questionFr: 'Quelle est la zone de service?',
    questionEn: 'What is the service area?',
    answerFr: "Nous desservons le Grand Montréal, Laval, la Rive-Sud et les régions environnantes. Contactez-nous si vous avez un doute sur votre localisation.",
    answerEn: "We serve Greater Montreal, Laval, the South Shore and surrounding areas. Contact us if you're unsure about your location.",
    order: 3,
  },
  {
    questionFr: 'Comment puis-je payer?',
    questionEn: 'How can I pay?',
    answerFr: "Le paiement s'effectue à la fin du service, par carte de crédit, débit ou virement. Aucun paiement requis à la réservation.",
    answerEn: "Payment is made at the end of the service, by credit card, debit or transfer. No payment required at booking.",
    order: 4,
  },
  {
    questionFr: "Que se passe-t-il en cas de mauvaise météo?",
    questionEn: "What happens in bad weather?",
    answerFr: "En cas de conditions météo défavorables (pluie, neige), nous vous contacterons pour reporter votre rendez-vous à une date qui vous convient, sans frais.",
    answerEn: "In case of unfavorable weather conditions (rain, snow), we'll contact you to reschedule at a convenient date, free of charge.",
    order: 5,
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const hashedPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@eclatauto.ca' },
    update: {},
    create: { email: 'admin@eclatauto.ca', password: hashedPassword, name: 'Administrateur' },
  });
  console.log(`✅ Admin: ${admin.email}`);

  // Services
  for (const service of SERVICES) {
    await prisma.service.upsert({
      where: { id: service.id },
      update: service,
      create: service,
    });
  }
  console.log(`✅ ${SERVICES.length} services créés`);

  // Testimonials
  const testimonialsCount = await prisma.testimonial.count();
  if (testimonialsCount === 0) {
    await prisma.testimonial.createMany({ data: TESTIMONIALS });
    console.log(`✅ ${TESTIMONIALS.length} témoignages créés`);
  }

  // FAQs
  const faqCount = await prisma.fAQ.count();
  if (faqCount === 0) {
    await prisma.fAQ.createMany({ data: FAQS });
    console.log(`✅ ${FAQS.length} FAQs créées`);
  }

  // Site settings
  await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      instagramUrl: '',
      facebookUrl: '',
      phone: '514-555-0100',
      email: 'info@eclatauto.ca',
      adminEmail: 'admin@eclatauto.ca',
    },
  });
  console.log('✅ Paramètres du site créés');

  // Sample reservations
  const existing = await prisma.reservation.count();
  if (existing === 0) {
    await prisma.reservation.createMany({
      data: [
        {
          confirmationNumber: 'EA-000001',
          service: 'exterior-interior', vehicleType: 'suv',
          vehicleMake: 'Toyota', vehicleModel: 'RAV4', vehicleYear: '2022', vehicleColor: 'Blanc',
          date: '2026-04-15', timeSlot: '09:00',
          firstName: 'Marie', lastName: 'Tremblay', email: 'marie@example.com', phone: '514-555-0101',
          address: '123 rue Principale', city: 'Montréal', postalCode: 'H2X 1Y3',
          notes: 'Chien à bord', status: 'confirmed', locale: 'fr', price: 107,
        },
        {
          confirmationNumber: 'EA-000002',
          service: 'exterior-basic', vehicleType: 'sedan',
          vehicleMake: 'Honda', vehicleModel: 'Civic', vehicleYear: '2020', vehicleColor: 'Gris',
          date: '2026-04-16', timeSlot: '11:00',
          firstName: 'Jean', lastName: 'Bergeron', email: 'jean@example.com', phone: '450-555-0202',
          address: '456 boul. des Laurentides', city: 'Laval', postalCode: 'H7M 2Z1',
          notes: '', status: 'pending', locale: 'fr', price: 49,
        },
        {
          confirmationNumber: 'EA-000003',
          service: 'shampoo', vehicleType: 'truck',
          vehicleMake: 'Ford', vehicleModel: 'F-150', vehicleYear: '2021', vehicleColor: 'Noir',
          date: '2026-04-17', timeSlot: '14:00',
          firstName: 'Kevin', lastName: 'Martin', email: 'kevin@example.com', phone: '514-555-0303',
          address: '789 avenue du Parc', city: 'Montréal', postalCode: 'H2V 4G7',
          notes: '', status: 'completed', locale: 'en', price: 194,
        },
      ],
    });
    console.log('✅ 3 réservations exemples créées');
  }

  // ServiceCards
  const SERVICE_CARDS = [
    {
      name: 'Signature Wash',
      description:
        'Lavage complet à la main de la carrosserie et des vitres, nettoyage en profondeur des jantes et des pneus, séchage soigné et application de tire shine pour une finition propre et lustrée.',
      imageUrl: null,
      prices: { berline: 169.99, vus: 189.99, pickup: 219.99, fourgonnette: 229.99 },
      isActive: true,
      order: 0,
    },
    {
      name: 'Lavage Extérieur',
      description:
        'Lavage complet à la main de la carrosserie et des vitres, nettoyage en profondeur des jantes et des pneus, séchage soigné et application de tire shine pour une finition propre et lustrée.',
      imageUrl: null,
      prices: { berline: 74.99, vus: 84.99, pickup: 94.99, fourgonnette: 99.99 },
      isActive: true,
      order: 1,
    },
    {
      name: 'Détail Intérieur',
      description:
        'Nettoyage intérieur complet incluant aspirateur, essuyage des surfaces, vitres intérieures et attention aux moindres recoins pour un habitacle frais et impeccable.',
      imageUrl: null,
      prices: { berline: 119.99, vus: 129.99, pickup: 144.99, fourgonnette: 149.99 },
      isActive: true,
      order: 2,
    },
  ];

  for (const card of SERVICE_CARDS) {
    const existing = await prisma.serviceCard.findFirst({ where: { name: card.name } });
    if (!existing) {
      await prisma.serviceCard.create({ data: card });
    }
  }
  console.log(`✅ ${SERVICE_CARDS.length} ServiceCards seedés`);

  // MaintenancePlans
  const MAINTENANCE_PLANS = [
    {
      name: 'Maintien Mensuel',
      frequency: '1x/mois',
      price: 69,
      description: 'Gardez votre véhicule impeccable chaque mois sans lever le petit doigt.',
      features: ['Lavage extérieur complet', 'Nettoyage des jantes et pneus', 'Séchage et tire shine'],
      isActive: true,
      order: 0,
    },
    {
      name: 'Maintien Bi-mensuel',
      frequency: '2x/mois',
      price: 129,
      description: 'Deux passages par mois pour un véhicule toujours prêt à impressionner.',
      features: ['Lavage extérieur complet', 'Nettoyage des jantes et pneus', 'Séchage et tire shine'],
      isActive: true,
      order: 1,
    },
    {
      name: 'Maintien Hebdomadaire',
      frequency: '1x/semaine',
      price: 249,
      description: 'Pour ceux qui exigent la perfection — un véhicule impeccable chaque semaine.',
      features: ['Lavage extérieur complet', 'Nettoyage des jantes et pneus', 'Séchage et tire shine'],
      isActive: true,
      order: 2,
    },
  ];

  for (const plan of MAINTENANCE_PLANS) {
    const existing = await prisma.maintenancePlan.findFirst({ where: { name: plan.name } });
    if (!existing) {
      await prisma.maintenancePlan.create({ data: plan });
    }
  }
  console.log(`✅ ${MAINTENANCE_PLANS.length} MaintenancePlans seedés`);

  console.log('\n📋 Identifiants admin:');
  console.log('   Email:        admin@eclatauto.ca');
  console.log('   Mot de passe: Admin123!');
  console.log('\n✨ Seeding terminé!');
}

main()
  .catch((e) => { console.error('❌', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
