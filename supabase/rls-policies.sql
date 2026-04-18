-- ============================================================
-- Éclat Auto — RLS Security Policies
-- À exécuter dans Supabase > SQL Editor
-- ============================================================
-- IMPORTANT : Prisma (DATABASE_URL) et le client Supabase
-- (SUPABASE_SECRET_KEY = service_role) contournent RLS
-- automatiquement. Le dashboard admin ne sera PAS affecté.
-- ============================================================

-- ─── 1. ACTIVER RLS SUR TOUTES LES TABLES ────────────────────

ALTER TABLE "Reservation"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AdminUser"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Photo"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Testimonial"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FAQ"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BlockedDate"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SiteSettings"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Promotion"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PromotionService" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Service"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VehicleCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Supplement"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Quote"           ENABLE ROW LEVEL SECURITY;

-- ─── 2. TABLES D'AFFICHAGE PUBLIC — lecture seule ────────────
-- (Photos, Témoignages, FAQ, Dates bloquées, Paramètres,
--  Promotions, Services, Catégories, Suppléments)

-- Photo
DROP POLICY IF EXISTS "public_read_photos" ON "Photo";
CREATE POLICY "public_read_photos"
  ON "Photo" FOR SELECT
  USING (true);

-- Testimonial
DROP POLICY IF EXISTS "public_read_testimonials" ON "Testimonial";
CREATE POLICY "public_read_testimonials"
  ON "Testimonial" FOR SELECT
  USING (true);

-- FAQ
DROP POLICY IF EXISTS "public_read_faq" ON "FAQ";
CREATE POLICY "public_read_faq"
  ON "FAQ" FOR SELECT
  USING (true);

-- BlockedDate
DROP POLICY IF EXISTS "public_read_blocked_dates" ON "BlockedDate";
CREATE POLICY "public_read_blocked_dates"
  ON "BlockedDate" FOR SELECT
  USING (true);

-- SiteSettings
DROP POLICY IF EXISTS "public_read_site_settings" ON "SiteSettings";
CREATE POLICY "public_read_site_settings"
  ON "SiteSettings" FOR SELECT
  USING (true);

-- Promotion
DROP POLICY IF EXISTS "public_read_promotions" ON "Promotion";
CREATE POLICY "public_read_promotions"
  ON "Promotion" FOR SELECT
  USING (true);

-- PromotionService
DROP POLICY IF EXISTS "public_read_promotion_services" ON "PromotionService";
CREATE POLICY "public_read_promotion_services"
  ON "PromotionService" FOR SELECT
  USING (true);

-- Service
DROP POLICY IF EXISTS "public_read_services" ON "Service";
CREATE POLICY "public_read_services"
  ON "Service" FOR SELECT
  USING (true);

-- VehicleCategory
DROP POLICY IF EXISTS "public_read_vehicle_categories" ON "VehicleCategory";
CREATE POLICY "public_read_vehicle_categories"
  ON "VehicleCategory" FOR SELECT
  USING (true);

-- Supplement
DROP POLICY IF EXISTS "public_read_supplements" ON "Supplement";
CREATE POLICY "public_read_supplements"
  ON "Supplement" FOR SELECT
  USING (true);

-- ─── 3. RESERVATION — insert public seulement ────────────────
-- Pas de lecture publique (données clients privées)

DROP POLICY IF EXISTS "public_insert_reservation" ON "Reservation";
CREATE POLICY "public_insert_reservation"
  ON "Reservation" FOR INSERT
  WITH CHECK (true);

-- ─── 4. QUOTE — insert public seulement ──────────────────────
-- Pas de lecture publique (données clients privées)

DROP POLICY IF EXISTS "public_insert_quote" ON "Quote";
CREATE POLICY "public_insert_quote"
  ON "Quote" FOR INSERT
  WITH CHECK (true);

-- ─── 5. ADMINUSER — aucun accès public ───────────────────────
-- Aucune policy = aucun accès via clé anon
-- Le login admin utilise Prisma (DATABASE_URL) qui contourne RLS

-- Aucune policy à créer intentionnellement.

-- ─── RÉSUMÉ ──────────────────────────────────────────────────
-- ✅ RLS activé sur les 13 tables
-- ✅ Lecture publique : Photo, Testimonial, FAQ, BlockedDate,
--    SiteSettings, Promotion, PromotionService, Service,
--    VehicleCategory, Supplement
-- ✅ Insert public seulement : Reservation, Quote
-- ✅ Aucun accès public : AdminUser
-- ✅ Dashboard admin : non affecté (Prisma + service_role
--    contournent RLS automatiquement)
-- ============================================================
