"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Registration statuses
        pending: "border-yellow-200 bg-yellow-50 text-yellow-800",
        approved: "border-green-200 bg-green-50 text-green-800",
        rejected: "border-red-200 bg-red-50 text-red-800",
        // Training statuses
        "in-training": "border-blue-200 bg-blue-50 text-blue-800",
        "fully-trained": "border-green-200 bg-green-50 text-green-800",
        // Dog statuses
        active: "border-green-200 bg-green-50 text-green-800",
        inactive: "border-gray-200 bg-gray-50 text-gray-800",
        retired: "border-purple-200 bg-purple-50 text-purple-800",
        // Agreement statuses
        draft: "border-gray-200 bg-gray-50 text-gray-800",
        expired: "border-red-200 bg-red-50 text-red-800",
        // Profile completion
        incomplete: "border-yellow-200 bg-yellow-50 text-yellow-800",
        complete: "border-green-200 bg-green-50 text-green-800",
        // Default variants
        default: "border-gray-200 bg-gray-50 text-gray-800",
        success: "border-green-200 bg-green-50 text-green-800",
        warning: "border-yellow-200 bg-yellow-50 text-yellow-800",
        error: "border-red-200 bg-red-50 text-red-800",
        info: "border-blue-200 bg-blue-50 text-blue-800",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  children: React.ReactNode
}

function StatusBadge({ className, variant, size, children, ...props }: StatusBadgeProps) {
  return (
    <div className={cn(statusBadgeVariants({ variant, size }), className)} {...props}>
      {children}
    </div>
  )
}

export { StatusBadge, statusBadgeVariants }