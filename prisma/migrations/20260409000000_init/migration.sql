-- Éclat Auto — Initial schema for Supabase (PostgreSQL)
-- Run this in Supabase Dashboard → SQL Editor

-- CreateTable: Reservation
CREATE TABLE IF NOT EXISTS "Reservation" (
    "id" TEXT NOT NULL,
    "confirmationNumber" TEXT,
    "service" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "vehicleMake" TEXT NOT NULL DEFAULT '',
    "vehicleModel" TEXT NOT NULL DEFAULT '',
    "vehicleYear" TEXT NOT NULL DEFAULT '',
    "vehicleColor" TEXT NOT NULL DEFAULT '',
    "date" TEXT NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "notes" TEXT,
    "internalNote" TEXT,
    "price" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "locale" TEXT NOT NULL DEFAULT 'fr',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Reservation_confirmationNumber_key" ON "Reservation"("confirmationNumber");

-- CreateTable: AdminUser
CREATE TABLE IF NOT EXISTS "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AdminUser_email_key" ON "AdminUser"("email");

-- CreateTable: Service
CREATE TABLE IF NOT EXISTS "Service" (
    "id" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "descriptionFr" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "includesFr" TEXT NOT NULL DEFAULT '',
    "includesEn" TEXT NOT NULL DEFAULT '',
    "basePrice" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "iconName" TEXT NOT NULL DEFAULT 'Sparkles',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Promotion
CREATE TABLE IF NOT EXISTS "Promotion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "discountType" TEXT NOT NULL,
    "discountValue" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PromotionService
CREATE TABLE IF NOT EXISTS "PromotionService" (
    "promotionId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    CONSTRAINT "PromotionService_pkey" PRIMARY KEY ("promotionId", "serviceId")
);

-- CreateTable: Photo
CREATE TABLE IF NOT EXISTS "Photo" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "caption" TEXT,
    "type" TEXT NOT NULL DEFAULT 'result',
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Testimonial
CREATE TABLE IF NOT EXISTS "Testimonial" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL DEFAULT '',
    "text" TEXT NOT NULL,
    "stars" INTEGER NOT NULL DEFAULT 5,
    "photoUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable: FAQ
CREATE TABLE IF NOT EXISTS "FAQ" (
    "id" TEXT NOT NULL,
    "questionFr" TEXT NOT NULL,
    "questionEn" TEXT NOT NULL,
    "answerFr" TEXT NOT NULL,
    "answerEn" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FAQ_pkey" PRIMARY KEY ("id")
);

-- CreateTable: BlockedDate
CREATE TABLE IF NOT EXISTS "BlockedDate" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "timeSlot" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BlockedDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable: SiteSettings
CREATE TABLE IF NOT EXISTS "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "phone" TEXT NOT NULL DEFAULT '514-555-0100',
    "email" TEXT NOT NULL DEFAULT 'info@eclatauto.ca',
    "adminEmail" TEXT NOT NULL DEFAULT 'admin@eclatauto.ca',
    "instagramUrl" TEXT NOT NULL DEFAULT '',
    "facebookUrl" TEXT NOT NULL DEFAULT '',
    "heroBadge" TEXT NOT NULL DEFAULT 'Service à domicile au Québec',
    "heroTitle" TEXT NOT NULL DEFAULT 'L''excellence automobile',
    "heroTitleHighlight" TEXT NOT NULL DEFAULT 'à votre porte',
    "heroSubtitle" TEXT NOT NULL DEFAULT 'Détailing professionnel de luxe — nous venons directement chez vous. Votre véhicule mérite le meilleur.',
    "statClients" TEXT NOT NULL DEFAULT '500+',
    "statYears" TEXT NOT NULL DEFAULT '5+',
    "statRating" TEXT NOT NULL DEFAULT '4.9/5',
    "businessHours" TEXT NOT NULL DEFAULT 'Lun–Sam : 8h00 – 18h00',
    "serviceZone" TEXT NOT NULL DEFAULT 'Grand Montréal & Laval',
    "bookingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "confirmationMessage" TEXT NOT NULL DEFAULT 'Merci pour votre réservation! Notre équipe vous contactera sous 24h pour confirmer votre rendez-vous.',
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- Foreign keys for PromotionService
ALTER TABLE "PromotionService" ADD CONSTRAINT "PromotionService_promotionId_fkey"
    FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PromotionService" ADD CONSTRAINT "PromotionService_serviceId_fkey"
    FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Insert default SiteSettings row
INSERT INTO "SiteSettings" ("id", "updatedAt") VALUES ('singleton', NOW())
    ON CONFLICT ("id") DO NOTHING;

-- Insert default admin user (password: admin123 — CHANGE THIS after first login)
-- bcrypt hash of 'admin123'
INSERT INTO "AdminUser" ("id", "email", "password", "name", "createdAt")
VALUES (
    'admin-default',
    'admin@eclatauto.ca',
    '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0/NA2MBDNIA',
    'Admin',
    NOW()
) ON CONFLICT ("email") DO NOTHING;

-- Prisma migrations table (required for prisma migrate deploy)
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) NOT NULL,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMPTZ,
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMPTZ,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);
