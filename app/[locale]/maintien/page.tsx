import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Check, ArrowRight, RotateCcw, Sparkles, CalendarCheck } from 'lucide-react';

export const revalidate = 300;

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params: { locale } }: Props) {
  return {
    title: locale === 'fr' ? 'Forfaits Maintien — Éclat Auto' : 'Maintenance Plans — Éclat Auto',
    description:
      locale === 'fr'
        ? 'Gardez votre véhicule impeccable, sans effort. Découvrez nos forfaits de maintien régulier à domicile.'
        : 'Keep your vehicle spotless, effortlessly. Discover our regular maintenance plans delivered to your door.',
  };
}

async function getPlans() {
  return prisma.maintenancePlan.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
}

const HOW_STEPS = [
  {
    number: '01',
    icon: Sparkles,
    titleFr: 'Réservez un Signature Wash',
    titleEn: 'Book a Signature Wash',
    descFr: "On commence par remettre votre véhicule à son meilleur niveau — un lavage complet de référence.",
    descEn: "We start by bringing your vehicle back to its best — a thorough reference wash.",
  },
  {
    number: '02',
    icon: CalendarCheck,
    titleFr: 'On établit votre route',
    titleEn: 'We set your schedule',
    descFr: "Ensemble, on choisit la fréquence et le créneau qui vous convient. Votre adresse, votre horaire.",
    descEn: "Together we choose the frequency and time that works for you. Your address, your schedule.",
  },
  {
    number: '03',
    icon: RotateCcw,
    titleFr: 'On revient automatiquement',
    titleEn: 'We come back automatically',
    descFr: "Votre technicien revient selon le forfait choisi. Vous n'avez rien à faire — sauf profiter.",
    descEn: "Your technician returns on your plan's schedule. You don't do a thing — just enjoy.",
  },
];

export default async function MaintienPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const isFr = locale === 'fr';
  const plans = await getPlans();

  return (
    <>
      <Header locale={locale} />

      <main className="bg-[#0a0a0a] min-h-screen">

        {/* ── HERO ── */}
        <section className="relative pt-36 pb-24 px-6 sm:px-10 lg:px-16 overflow-hidden">
          {/* Ambient glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#C9A84C]/6 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-brand-blue/4 blur-[100px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-12 bg-[#C9A84C]" />
              <span className="text-[#C9A84C] text-xs uppercase tracking-[0.25em] font-sans">
                {isFr ? 'Forfaits de maintien' : 'Maintenance Plans'}
              </span>
            </div>

            <div className="max-w-3xl">
              <h1 className="font-display text-[clamp(3rem,8vw,7rem)] text-brand-cream leading-none mb-6">
                {isFr ? (
                  <>Gardez votre<br /><span className="text-[#C9A84C]">véhicule propre,</span><br />sans effort.</>
                ) : (
                  <>Keep your<br /><span className="text-[#C9A84C]">vehicle clean,</span><br />effortlessly.</>
                )}
              </h1>
              <p className="text-brand-cream-muted text-base sm:text-lg leading-relaxed font-light max-w-2xl">
                {isFr
                  ? "Commencez avec un Signature Wash — notre lavage de référence — puis on s'occupe du reste. Votre technicien revient régulièrement selon le forfait que vous choisissez."
                  : "Start with a Signature Wash — our reference clean — then we handle the rest. Your technician comes back regularly on the plan you choose."}
              </p>
            </div>
          </div>
        </section>

        {/* ── COMMENT ÇA MARCHE ── */}
        <section className="py-24 px-6 sm:px-10 lg:px-16 border-t border-brand-black-border">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-16">
              <span className="text-[#C9A84C] text-xs uppercase tracking-[0.25em] font-sans">
                {isFr ? 'Comment ça marche' : 'How it works'}
              </span>
              <div className="flex-1 h-px bg-brand-black-border" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 relative">
              {/* Connector line desktop */}
              <div className="absolute top-8 left-[16.5%] right-[16.5%] h-px bg-brand-black-border hidden md:block" />

              {HOW_STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.number} className="relative flex flex-col items-start md:items-center text-left md:text-center p-6 md:px-10">
                    {/* Number square */}
                    <div className="relative mb-8">
                      <div className="w-16 h-16 border border-brand-black-border flex items-center justify-center relative z-10 bg-[#0a0a0a]">
                        <span className="font-display text-3xl text-[#C9A84C] leading-none">{step.number}</span>
                      </div>
                      <Icon className="absolute -bottom-2 -right-2 w-5 h-5 text-[#C9A84C]/40" />
                    </div>
                    <h3 className="font-display text-2xl text-brand-cream mb-3 leading-none">
                      {isFr ? step.titleFr : step.titleEn}
                    </h3>
                    <p className="text-brand-cream-muted text-sm leading-relaxed font-light max-w-xs">
                      {isFr ? step.descFr : step.descEn}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── FORFAITS ── */}
        <section className="py-24 px-6 sm:px-10 lg:px-16 bg-brand-black-soft border-t border-brand-black-border">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-16">
              <span className="text-[#C9A84C] text-xs uppercase tracking-[0.25em] font-sans">
                {isFr ? 'Choisissez votre forfait' : 'Choose your plan'}
              </span>
              <div className="flex-1 h-px bg-brand-black-border" />
            </div>

            {plans.length === 0 ? (
              <p className="text-brand-cream-muted text-center py-12">
                {isFr ? 'Forfaits à venir.' : 'Plans coming soon.'}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan, idx) => {
                  const features = plan.features as string[];
                  const isFeatured = idx === 1; // middle card highlighted

                  return (
                    <div
                      key={plan.id}
                      className={`relative flex flex-col border p-8 transition-all ${
                        isFeatured
                          ? 'border-[#C9A84C] bg-[#C9A84C]/5'
                          : 'border-brand-black-border bg-brand-black hover:border-[#C9A84C]/30'
                      }`}
                    >
                      {isFeatured && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C9A84C] text-brand-black text-[10px] font-bold uppercase tracking-widest px-3 py-1 font-sans">
                          {isFr ? 'Populaire' : 'Popular'}
                        </div>
                      )}

                      {/* Frequency badge */}
                      <div className="inline-flex items-center self-start gap-1.5 border border-[#C9A84C]/30 px-3 py-1 mb-6">
                        <span className="text-[#C9A84C] text-xs font-sans uppercase tracking-widest">
                          {plan.frequency}
                        </span>
                      </div>

                      {/* Name */}
                      <h3 className="font-display text-3xl text-brand-cream leading-none mb-2">
                        {plan.name}
                      </h3>

                      {/* Description */}
                      <p className="text-brand-cream-muted text-sm leading-relaxed font-light mb-8 flex-1">
                        {plan.description}
                      </p>

                      {/* Features */}
                      <ul className="space-y-2.5 mb-8">
                        {features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-brand-cream-muted">
                            <Check className="w-4 h-4 text-[#C9A84C] flex-shrink-0 mt-0.5" />
                            {f}
                          </li>
                        ))}
                      </ul>

                      {/* Price */}
                      <div className="border-t border-brand-black-border pt-6 mb-6">
                        <div className="flex items-end gap-1">
                          <span className="font-display text-5xl text-[#C9A84C] leading-none">
                            {Number(plan.price).toFixed(2)}$
                          </span>
                          <span className="text-brand-cream-muted text-sm mb-1 font-sans">
                            /{isFr ? 'mois' : 'month'}
                          </span>
                        </div>
                      </div>

                      {/* CTA */}
                      <Link
                        href={`/${locale}/reservation`}
                        className={`flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest px-6 py-3.5 transition-colors font-sans ${
                          isFeatured
                            ? 'bg-[#C9A84C] text-brand-black hover:bg-[#F0B429]'
                            : 'border border-[#C9A84C]/40 text-[#C9A84C] hover:bg-[#C9A84C]/10'
                        }`}
                      >
                        {isFr ? 'Débuter' : 'Get started'}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Fine print */}
            <p className="text-brand-cream-muted/40 text-xs text-center mt-8 font-sans">
              {isFr
                ? '* Les forfaits débutent après votre premier Signature Wash. Annulation en tout temps.'
                : '* Plans begin after your first Signature Wash. Cancel anytime.'}
            </p>
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section className="py-24 px-6 sm:px-10 lg:px-16 border-t border-brand-black-border">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] text-brand-cream leading-none mb-6">
              {isFr ? 'Commencez par le' : 'Start with the'}
              <br />
              <span className="text-[#C9A84C]">Signature Wash</span>
            </h2>
            <p className="text-brand-cream-muted text-sm leading-relaxed max-w-md mx-auto mb-10 font-light">
              {isFr
                ? "Le premier lavage de référence est l'étape de départ de tous nos forfaits de maintien."
                : "The first reference wash is the starting point for all our maintenance plans."}
            </p>
            <Link
              href={`/${locale}/reservation`}
              className="group inline-flex items-center gap-3 bg-[#C9A84C] text-brand-black font-bold text-sm uppercase tracking-widest px-10 py-5 hover:bg-[#F0B429] transition-colors font-sans"
            >
              {isFr ? 'Réserver un Signature Wash' : 'Book a Signature Wash'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

      </main>

      <Footer locale={locale} />
    </>
  );
}
