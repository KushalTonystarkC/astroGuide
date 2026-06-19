import { Suspense } from "react"

import { SignupPageClient } from "@/components/auth/auth-forms"

export const metadata = {
  title: "Create account",
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupPageClient />
    </Suspense>
  )
}
