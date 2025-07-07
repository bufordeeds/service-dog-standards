import type { Metadata } from "next"

// Force dynamic rendering for all dashboard routes
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Dashboard | Service Dog Standards",
  description: "Manage your service dog registrations, training, and certifications with SDS.",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}