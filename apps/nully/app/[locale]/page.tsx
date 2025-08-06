import { getTranslations } from "next-intl/server";
import { type Locale } from "next-intl";
import { Check, Database, Infinity as InfinityIcon, Layers, Zap, Upload, Shield, CheckCircle, MapPin } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Link } from "../../i18n/navigation";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'homepage' });

  return (
    <>
      {/* Hero Section - With Gradient Background */}
      <div className="relative overflow-hidden py-20 sm:py-24 lg:py-32">
        <div className="absolute inset-0 gradient-bg-purple-blue"></div>

        <div className="relative z-10 container mx-auto">
          <div className="text-center">
            <h1 className="mb-6 text-5xl font-bold sm:mb-8 sm:text-6xl lg:text-7xl">
              <span className="gradient-purple-blue bg-clip-text text-transparent">
                {t('title')}
              </span>
            </h1>

            <p className="mx-auto mb-8 max-w-3xl text-xl text-neutral-600 sm:mb-10 sm:text-2xl">
              {t('subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/transfer" className="inline-block">
                <Button
                  variant="default"
                  size="lg"
                  className="px-8 py-4 text-lg font-semibold shadow-xl transition-all hover:scale-105"
                >
                  <Upload className="mr-3 h-6 w-6" />
                  {t('transferButton')}
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-4 text-lg font-semibold bg-white/10 border-white/20 text-neutral-700 hover:bg-white/20"
              >
                <Check className="mr-3 h-6 w-6" />
                {t('learnMoreButton')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges Section */}
      <div className="bg-white py-8 sm:py-12">
        <div className="container mx-auto">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <CheckCircle className="h-5 w-5 text-green-600" />
              No Registration Required
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <CheckCircle className="h-5 w-5 text-green-600" />
              End-to-End Encrypted
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <CheckCircle className="h-5 w-5 text-green-600" />
              No Cloud Storage
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <MapPin className="h-5 w-5 text-primary-color" />
              European Privacy Standards
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Redesigned */}
      <div className="bg-neutral-50 py-16 sm:py-20">
        <div className="container mx-auto">
          <div className="mb-12 text-center sm:mb-16">
            <h2 className="mb-4 text-4xl font-bold text-neutral-900 sm:text-5xl">
              {t('features.title')}
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-neutral-600">
              Direct file sharing without compromising your privacy
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 gradient-bg-white-green shadow-lg transition-all hover:scale-105 hover:shadow-xl p-6">
              <CardHeader className="text-center p-0">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full gradient-green-blue">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl text-neutral-900 mb-2">
                  {t('features.p2p')}
                </CardTitle>
                <CardDescription className="text-neutral-600">
                  {t('features.p2pDesc')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 gradient-bg-white-yellow shadow-lg transition-all hover:scale-105 hover:shadow-xl p-6">
              <CardHeader className="text-center p-0">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full gradient-purple-blue">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl text-neutral-900 mb-2">
                  {t('features.noCloud')}
                </CardTitle>
                <CardDescription className="text-neutral-600">
                  {t('features.noCloudDesc')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 gradient-bg-white-green shadow-lg transition-all hover:scale-105 hover:shadow-xl p-6">
              <CardHeader className="text-center p-0">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full gradient-green-blue">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl text-neutral-900 mb-2">
                  {t('features.secure')}
                </CardTitle>
                <CardDescription className="text-neutral-600">
                  {t('features.secureDesc')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 gradient-bg-white-yellow shadow-lg transition-all hover:scale-105 hover:shadow-xl p-6">
              <CardHeader className="text-center p-0">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full gradient-purple-blue">
                  <InfinityIcon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl text-neutral-900 mb-2">
                  {t('features.unlimited')}
                </CardTitle>
                <CardDescription className="text-neutral-600">
                  {t('features.unlimitedDesc')}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 sm:py-20">
        <div className="container mx-auto">
          <div className="mb-12 text-center sm:mb-16">
            <h2 className="mb-4 text-4xl font-bold text-neutral-900 sm:text-5xl">
              How It Works
            </h2>
            <p className="text-xl text-neutral-600">
              Simple, secure file sharing in three easy steps
            </p>
          </div>

          <div className="grid gap-12 md:grid-cols-3 max-w-5xl mx-auto">
            <div className="group text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full gradient-purple-blue shadow-lg transition-transform group-hover:scale-110">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="mb-4 text-2xl font-semibold text-neutral-900">
                Share the Link
              </h3>
              <p className="text-lg text-neutral-600">
                Copy the unique link and send it to your recipient through any messaging app or email.
              </p>
            </div>

            <div className="group text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full gradient-green-blue shadow-lg transition-transform group-hover:scale-110">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="mb-4 text-2xl font-semibold text-neutral-900">
                Select Your Files
              </h3>
              <p className="text-lg text-neutral-600">
                Choose the files you want to send. There's no limit on size or number of files.
              </p>
            </div>

            <div className="group text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full gradient-purple-blue-green shadow-lg transition-transform group-hover:scale-110">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="mb-4 text-2xl font-semibold text-neutral-900">
                Stay Connected
              </h3>
              <p className="text-lg text-neutral-600">
                Keep this page open while the transfer is in progress for a direct peer-to-peer connection.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden gradient-purple-blue-green py-16 sm:py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 container mx-auto text-center">
          <h2 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
            Ready to Share Files Securely?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-white/90 sm:mb-10">
            Start transferring files directly between devices with complete privacy and security.
          </p>
          <div className="inline-block">
            <Link href="/transfer" className="inline-block">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-primary-color shadow-xl transition-all hover:scale-105 hover:bg-neutral-100 px-8 py-4 text-lg font-semibold"
              >
                <Upload className="mr-3 h-6 w-6" />
                {t('transferButton')}
              </Button>
            </Link>
            <p className="mt-2 text-sm text-white/70 text-center">
              No registration required • Completely free
            </p>
          </div>
        </div>
      </div>
    </>
  );
}