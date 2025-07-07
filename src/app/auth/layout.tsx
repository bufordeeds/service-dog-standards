import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentication | Service Dog Standards",
  description: "Sign in to your Service Dog Standards account",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}