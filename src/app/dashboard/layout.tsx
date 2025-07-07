import type { Metadata } from "next"

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