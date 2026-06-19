import { Suspense } from "react"

import { LoginPageClient } from "@/components/auth/auth-forms"

export const metadata = {
  title: "Sign in",
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageClient />
    </Suspense>
  )
}
