"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function Header() {
  const [imageError, setImageError] = useState(false)

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!imageError ? (
              <img
                src="/sds-logo-blue.png"
                alt="Service Dog Standards Logo"
                className="h-12 w-auto"
                onError={() => {
                  console.log("Logo failed to load")
                  setImageError(true)
                }}
              />
            ) : (
              // Fallback to text logo
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">SDS</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Service Dog Standards</h1>
                  <p className="text-sm text-gray-600">Setting the standard for service dog registration</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}