import { ArrowRight, Moon, Orbit, Sparkles, Star, Sunrise } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { ButtonLink } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FEATURE_CARDS } from "@/lib/constants"

const iconMap: Record<string, LucideIcon> = {
  Sunrise,
  Moon,
  Star,
  Orbit,
}

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_0%,oklch(0.55_0.18_280/0.2),transparent_70%)]"
          aria-hidden="true"
        />
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
              <Sparkles className="size-4 text-primary" aria-hidden="true" />
              Vedic Astrology · Jyotish MVP
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Discover Your{" "}
              <span className="bg-gradient-to-r from-violet-700 via-purple-600 to-indigo-600 bg-clip-text text-transparent dark:from-violet-400 dark:via-purple-300 dark:to-indigo-400">
                Cosmic Blueprint
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Panchang, birth charts, auspicious timings, and planetary
              transits — accurate, free, and powered by Swiss Ephemeris.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <ButtonLink href="/panchang" size="lg">
                Today&apos;s Panchang
                <ArrowRight className="size-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/chart" size="lg" variant="outline">
                Generate Kundali
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Vedic Astrology Tools
          </h2>
          <p className="mt-3 text-muted-foreground">
            Everything you need for daily Panchang and birth chart analysis
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURE_CARDS.map((feature) => {
            const Icon = iconMap[feature.icon] ?? Sparkles
            return (
              <Card
                key={feature.title}
                className="group border-border bg-card transition-all hover:border-primary/30 hover:shadow-lg"
              >
                <CardHeader>
                  <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 text-primary transition-transform group-hover:scale-105">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription className="leading-relaxed">
                    {feature.description}
                  </CardDescription>
                  <ButtonLink
                    href={feature.href}
                    variant="ghost"
                    size="sm"
                    className="mt-2 w-fit px-0 text-primary"
                  >
                    Open tool
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </ButtonLink>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="border-t border-border/60 bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold">Ready to explore your stars?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Computed with Swiss Ephemeris — the same precision used by
            professional Jyotish practitioners.
          </p>
          <ButtonLink href="/chart" className="mt-8" size="lg">
            Generate Your Kundali
          </ButtonLink>
        </div>
      </section>
    </>
  )
}
