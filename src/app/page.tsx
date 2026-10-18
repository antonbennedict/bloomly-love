import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Flower2, Gift, Infinity as InfinityIcon, Mail, PackageOpen, Palette, PenLine, QrCode } from 'lucide-react';
import Navbar from '@/components/Navbar';
import IntroGate from '@/components/landing/IntroGate';
import BloomBouquet from '@/components/landing/BloomBouquet';
import FallingPetals from '@/components/landing/FallingPetals';
import Faq, { type FaqItem } from '@/components/landing/Faq';
import ContactForm from '@/components/landing/ContactForm';

const delay = (seconds: number) => ({ '--d': `${seconds}s` }) as CSSProperties;

const STEPS = [
  {
    num: '01',
    title: 'Pick your blooms',
    desc: 'Mix roses, tulips, sunflowers and greenery. Drag, rotate and resize until it looks just right.',
    icon: Flower2,
    tint: 'bg-sage-50 text-sage-700 dark:bg-sage-900/40 dark:text-sage-200',
  },
  {
    num: '02',
    title: 'Write the card',
    desc: 'Add a personal note and choose a card style that fits the moment — a birthday, an apology, or just because.',
    icon: PenLine,
    tint: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300',
  },
  {
    num: '03',
    title: 'Send it their way',
    desc: 'Share a private link, email it directly, or download a QR code to tuck inside a real-world gift.',
    icon: Gift,
    tint: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  },
];

const FEATURES = [
  {
    title: 'A real unboxing moment',
    desc: 'Your bouquet arrives in a gift box. One tap and the wrapping unfolds, the flowers bloom one by one, and your letter appears.',
    icon: PackageOpen,
  },
  {
    title: 'Hand-drawn, never generic',
    desc: 'Every flower, wrap and ribbon is an original illustration — tinted in the colors you choose.',
    icon: Palette,
  },
  {
    title: 'Delivered your way',
    desc: 'A share link for messages, a direct email for surprises, and a printable QR code for cards and gifts.',
    icon: QrCode,
  },
  {
    title: 'Blooms that never wilt',
    desc: 'Unlike a real bouquet, this one still looks perfect next week, next month, and every time they revisit it.',
    icon: InfinityIcon,
  },
];

const FAQS: FaqItem[] = [
  {
    q: 'Do I need an account?',
    a: 'No. You can design, write and send a bouquet without signing up. Bloomly quietly links your creations to this browser so you can come back to them later.',
  },
  {
    q: 'What does the recipient see?',
    a: 'They open your link to a closed gift box. Tapping it unfolds the wrapping, blooms your flowers one by one, and reveals your handwritten-style letter.',
  },
  {
    q: 'Can I edit a bouquet after I share it?',
    a: 'Yes. Open the link in the same browser you used to create it and you can keep editing — the link stays the same.',
  },
  {
    q: 'Can I print it or add it to a physical gift?',
    a: 'Yes. Every bouquet comes with a QR code you can download as a high-resolution PNG — perfect for greeting cards, gift tags or a real bouquet.',
  },
  {
    q: 'Is Bloomly free?',
    a: 'Yes — creating and sending bouquets is free.',
  },
];

export default function HomePage() {
  return (
    <IntroGate className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main id="main" className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#FBF6EF] via-white to-white dark:from-stone-950 dark:via-stone-950 dark:to-stone-900">
          <FallingPetals />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 sm:pt-20 lg:pt-24 lg:pb-28">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              <div className="lg:col-span-6 xl:col-span-7 text-center lg:text-left">
                <p className="reveal inline-flex items-center gap-2 rounded-full border border-sage-200 bg-white/80 dark:bg-stone-900/80 dark:border-stone-700 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-sage-700 dark:text-sage-200 shadow-sm" style={delay(0)}>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" aria-hidden="true" />
                  Free · No sign-up · Ready in a minute
                </p>

                <h1 className="reveal mt-6 font-serif font-bold tracking-tight text-stone-900 dark:text-stone-50 text-[2.6rem] leading-[1.08] sm:text-6xl lg:text-[4.25rem] text-balance" style={delay(0.08)}>
                  Send a bouquet <span className="italic text-sage-600 dark:text-sage-200">that never wilts.</span>
                </h1>

                <p className="reveal mt-6 mx-auto lg:mx-0 max-w-xl text-base sm:text-lg leading-relaxed text-stone-600 dark:text-stone-400 text-pretty" style={delay(0.16)}>
                  Arrange hand-drawn flowers, tuck in a heartfelt letter, and send it with a link, an email, or a QR code. They&apos;ll unwrap it like a real gift.
                </p>

                <div className="reveal mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start" style={delay(0.24)}>
                  <Link
                    href="/create"
                    className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-sage-600 px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-sage-600/20 transition-all hover:bg-sage-700 hover:shadow-xl hover:shadow-sage-600/25 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-600"
                  >
                    Start your bouquet
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                  <Link
                    href="/showcase"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-stone-300 bg-white/70 px-7 py-3.5 text-[15px] font-semibold text-stone-800 transition-colors hover:border-sage-600 hover:text-sage-700 dark:border-stone-700 dark:bg-stone-900/60 dark:text-stone-200 dark:hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-600"
                  >
                    Browse the gallery
                  </Link>
                </div>

                <ul className="reveal mt-8 flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-stone-600 dark:text-stone-400" style={delay(0.32)}>
                  {['Original illustrations', 'Unboxing animation', 'Printable QR code'].map((item) => (
                    <li key={item} className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-sage-600 dark:text-sage-200" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="lg:col-span-6 xl:col-span-5 relative mx-auto w-full max-w-[420px]">
                <BloomBouquet className="w-full h-auto drop-shadow-[0_24px_40px_rgba(74,108,87,0.12)]" />

                <figure className="reveal note-float absolute -bottom-2 left-0 sm:-left-6 w-[62%] max-w-[230px] rotate-[-4deg] rounded-2xl border border-amber-900/10 bg-[#FDFBF7] p-4 shadow-xl dark:bg-stone-900 dark:border-stone-700" style={delay(1.7)}>
                  <figcaption className="text-[11px] font-bold uppercase tracking-[0.14em] text-sage-700 dark:text-sage-200">To Grae</figcaption>
                  <blockquote className="mt-1.5 font-cursive text-2xl leading-tight text-stone-800 dark:text-stone-200">
                    Saw these and thought of you. Happy birthday!
                  </blockquote>
                  <p className="mt-1 text-right text-xs text-stone-500 dark:text-stone-400">— Ton</p>
                </figure>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section aria-labelledby="how-title" className="py-20 sm:py-28 bg-white dark:bg-stone-900 border-y border-stone-100 dark:border-stone-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="scroll-reveal text-center max-w-2xl mx-auto mb-14 sm:mb-16">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sage-600 dark:text-sage-200">How it works</p>
              <h2 id="how-title" className="mt-3 font-serif font-bold text-3xl sm:text-4xl text-stone-900 dark:text-stone-50 text-balance">
                From empty vase to their inbox in three steps
              </h2>
            </div>

            <ol className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <li key={step.num} className="scroll-reveal relative rounded-3xl border border-stone-200/80 bg-stone-50/60 p-7 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-900/5 dark:border-stone-800 dark:bg-stone-950/40">
                    <div className="flex items-center justify-between">
                      <span className={`grid place-items-center w-12 h-12 rounded-2xl ${step.tint}`}>
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </span>
                      <span className="font-serif text-3xl font-bold text-stone-300 dark:text-stone-700" aria-hidden="true">{step.num}</span>
                    </div>
                    <h3 className="mt-6 font-serif font-bold text-xl text-stone-900 dark:text-stone-100">{step.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-stone-600 dark:text-stone-400">{step.desc}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* WHY BLOOMLY */}
        <section aria-labelledby="why-title" className="py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="scroll-reveal lg:col-span-5 lg:sticky lg:top-28">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sage-600 dark:text-sage-200">Why Bloomly</p>
              <h2 id="why-title" className="mt-3 font-serif font-bold text-3xl sm:text-4xl text-stone-900 dark:text-stone-50 text-balance">
                They don&apos;t just get a link. <span className="italic text-sage-600 dark:text-sage-200">They get a moment.</span>
              </h2>
              <p className="mt-5 text-base sm:text-lg leading-relaxed text-stone-600 dark:text-stone-400">
                A text says you remembered. A bouquet says you took the time. Bloomly gives every message the warmth of a hand-delivered gift — without the florist bill.
              </p>
              <Link href="/create" className="mt-7 inline-flex items-center gap-2 text-[15px] font-semibold text-sage-700 dark:text-sage-200 underline-offset-4 hover:underline">
                Make one now <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            <ul className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <li key={feature.title} className="scroll-reveal rounded-3xl border border-stone-200 bg-white p-7 dark:border-stone-800 dark:bg-stone-900">
                    <span className="grid place-items-center w-11 h-11 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 font-serif font-bold text-lg text-stone-900 dark:text-stone-100">{feature.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-stone-600 dark:text-stone-400">{feature.desc}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-title" className="py-20 sm:py-28 bg-white dark:bg-stone-900 border-y border-stone-100 dark:border-stone-800">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="scroll-reveal text-center mb-10 sm:mb-12">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sage-600 dark:text-sage-200">FAQ</p>
              <h2 id="faq-title" className="mt-3 font-serif font-bold text-3xl sm:text-4xl text-stone-900 dark:text-stone-50">Good questions, quick answers</h2>
            </div>
            <Faq items={FAQS} />
          </div>
        </section>

        {/* CONTACT */}
        <section aria-labelledby="contact-title" className="py-20 sm:py-28">
          <div className="max-w-xl mx-auto px-4 sm:px-6">
            <div className="scroll-reveal text-center mb-10">
              <span className="mx-auto grid place-items-center w-12 h-12 rounded-full bg-sage-50 text-sage-700 dark:bg-stone-900 dark:text-sage-200">
                <Mail className="w-5 h-5" aria-hidden="true" />
              </span>
              <h2 id="contact-title" className="mt-4 font-serif font-bold text-3xl sm:text-4xl text-stone-900 dark:text-stone-50">Leave a note for the florist</h2>
              <p className="mt-3 text-base text-stone-600 dark:text-stone-400">Ideas for new flowers, something that didn&apos;t work, or just a kind word — we read every message.</p>
            </div>
            <ContactForm />
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
          <div className="scroll-reveal relative overflow-hidden max-w-7xl mx-auto rounded-[2rem] bg-sage-800 px-6 py-14 sm:px-12 sm:py-20 text-center">
            <svg className="cta-bloom absolute -right-16 -top-16 w-64 h-64 text-sage-700/60" viewBox="-60 -60 120 120" aria-hidden="true">
              {Array.from({ length: 8 }, (_, i) => (
                <path key={i} transform={`rotate(${i * 45})`} d="M0 -6 C-15 -16 -17 -40 0 -55 C17 -40 15 -16 0 -6Z" fill="currentColor" />
              ))}
            </svg>
            <svg className="cta-bloom absolute -left-20 -bottom-20 w-72 h-72 text-sage-700/40" viewBox="-60 -60 120 120" aria-hidden="true">
              {Array.from({ length: 8 }, (_, i) => (
                <path key={i} transform={`rotate(${i * 45})`} d="M0 -6 C-15 -16 -17 -40 0 -55 C17 -40 15 -16 0 -6Z" fill="currentColor" />
              ))}
            </svg>
            <div className="relative">
              <h2 className="font-serif font-bold text-3xl sm:text-5xl text-white text-balance">Someone&apos;s day is about to get better.</h2>
              <p className="mt-4 text-base sm:text-lg text-sage-100 max-w-xl mx-auto">It takes about a minute. They&apos;ll remember it much longer.</p>
              <Link
                href="/create"
                className="group mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-[15px] font-semibold text-sage-800 shadow-lg transition-all hover:bg-sage-50 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Start your bouquet — it&apos;s free
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </IntroGate>
  );
}
