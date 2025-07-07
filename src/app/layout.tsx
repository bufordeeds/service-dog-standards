import "@/styles/globals.css"
import { Inter } from "next/font/google"
import { Providers } from "./providers"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata = {
  title: "Service Dog Standards",
  description: "Setting the standard for service dog registration and certification",
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "icon", url: "/favicon.svg", type: "image/svg+xml" }
  ],
  openGraph: {
    title: "Service Dog Standards",
    description: "Setting the standard for service dog registration and certification",
    images: ["/SDSsocialshareimage.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Service Dog Standards",
    description: "Setting the standard for service dog registration and certification",
    images: ["/SDSsocialshareimage.png"],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}