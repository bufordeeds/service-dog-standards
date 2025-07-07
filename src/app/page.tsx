import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Professional Service Dog Registration & Standards
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join thousands of service dog handlers and trainers who trust SDS for professional 
            registration, documentation, and community standards.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/register">Register Your Service Dog</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/learn-more">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="rounded-2xl hover:shadow-lg transition-shadow overflow-hidden">
            <div className="relative h-48 bg-gradient-to-br from-blue-50 to-blue-100">
              <Image
                src="/assets/images/products/SDSProductPackage.png"
                alt="SDS Registration Kit"
                fill
                className="object-contain p-4"
              />
            </div>
            <CardHeader>
              <CardTitle>Professional Registration Kit</CardTitle>
              <CardDescription>
                Complete registration package with ID cards, certificates, and patches for your service dog team
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="rounded-2xl hover:shadow-lg transition-shadow overflow-hidden">
            <div className="relative h-48 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
              <Image
                src="/assets/images/content/SDSTrainerMobileScreensAsset_11.png"
                alt="Trainer Directory"
                fill
                className="object-contain p-4"
              />
            </div>
            <CardHeader>
              <CardTitle>Trainer Directory</CardTitle>
              <CardDescription>
                Connect with certified trainers, showcase your professional credentials, and build your network
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="rounded-2xl hover:shadow-lg transition-shadow overflow-hidden">
            <div className="relative h-48 bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
              <Image
                src="/assets/images/content/SDSSecureProfileExampleAsset_15.png"
                alt="Standards & Education"
                fill
                className="object-contain p-4"
              />
            </div>
            <CardHeader>
              <CardTitle>Standards & Education</CardTitle>
              <CardDescription>
                Access training resources, maintain compliance with behavior standards, and manage your profile
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Image
                src="/assets/images/logo/service-dog-standards.png"
                alt="Service Dog Standards"
                width={200}
                height={60}
                className="h-8 w-auto"
              />
            </div>
            <p className="text-gray-400 mb-6">
              Setting the standard for service dog registration and certification since 2023
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/about" className="hover:text-blue-400 transition-colors">About</Link>
              <Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-blue-400 transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-blue-400 transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}