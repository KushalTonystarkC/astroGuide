import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { Footer } from "@/components/layout/footer"
import { Navbar } from "@/components/layout/navbar"
import { VedicLocationProvider } from "@/components/astrology/vedic-location-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { I18nProvider } from "@/i18n"
import { Toaster } from "@/components/ui/sonner"
import { APP_NAME } from "@/lib/constants"

import "./globals.css"
import "./vedic-compat.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — Vedic Astrology`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Generate your Vedic astrology chart from birth details and explore planetary influences.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <ThemeProvider>
          <I18nProvider>
            <QueryProvider>
              <VedicLocationProvider>
                <div className="relative flex min-h-screen flex-col">
                  <div
                    className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.55_0.15_280/0.15),transparent)]"
                    aria-hidden="true"
                  />
                  <Navbar />
                  <main className="flex-1">{children}</main>
                  <Footer />
                </div>
                <Toaster richColors position="top-right" />
              </VedicLocationProvider>
            </QueryProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
