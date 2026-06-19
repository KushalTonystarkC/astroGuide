"use client"

import { LogIn, LogOut } from "lucide-react"

import { useAuth } from "@/components/providers/auth-provider"
import { Button, ButtonLink } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AuthNavProps {
  className?: string
}

export function AuthNav({ className }: AuthNavProps) {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div
        className={cn("h-8 w-full animate-pulse rounded-lg bg-muted", className)}
        aria-hidden="true"
      />
    )
  }

  if (!user) {
    return (
      <ButtonLink
        href="/login"
        variant="outline"
        size="sm"
        className={cn("inline-flex", className)}
      >
        <LogIn className="size-3.5" aria-hidden="true" />
        Sign in
      </ButtonLink>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
        {user.email}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => void signOut()}
        aria-label="Sign out"
      >
        <LogOut className="size-3.5" aria-hidden="true" />
        Sign out
      </Button>
    </div>
  )
}
