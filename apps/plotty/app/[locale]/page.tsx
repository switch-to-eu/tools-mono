import { Link } from "@i18n/navigation";

import { Calendar, Users, Shield, Zap, Globe } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

import { Button } from "@workspace/ui/components/button";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations('HomePage');

  return (
    <>
      {/* Hero Section */}
      <div className="relative overflow-hidden px-4 py-12 sm:py-16 lg:py-20">
        {/* Background gradient */}
        <div className="absolute inset-0 gradient-bg-purple-blue"></div>

        <div className="relative z-10 container mx-auto text-center">
          <h1 className="mb-4 text-4xl font-bold sm:mb-6 sm:text-5xl lg:text-6xl">
            <span className="gradient-purple-blue bg-clip-text text-transparent">
              {t('hero.title')}
            </span>
            <br />
            <span className="text-neutral-900">{t('hero.subtitle')}</span>
          </h1>

          <p className="mx-auto mb-6 max-w-2xl px-4 text-lg text-neutral-600 sm:mb-8 sm:text-xl">
            {t('hero.description')}
          </p>
          <Link href="/create" className="flex flex-row justify-center">
            <Button
              variant="default"
              size="lg"
              className="w-full border-0 w-fit flex flex-row justify-center gap-3 px-4 sm:gap-4"
            >
              <Users className="mr-2 h-5 w-5" />
              <span className="hidden sm:inline">
                {t('hero.cta')}
              </span>

              <span className="sm:hidden">{t('hero.ctaMobile')}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white px-4 py-12 sm:py-16">
        <div className="container mx-auto">
          <div className="mb-8 text-center sm:mb-12">
            <h2 className="mb-3 text-3xl font-bold text-neutral-900 sm:mb-4 sm:text-4xl">
              {t('features.title')}
            </h2>
            <p className="mx-auto max-w-2xl px-4 text-base text-neutral-600 sm:text-lg">
              {t('features.description')}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-0 gradient-bg-white-orange shadow-lg transition-all hover:scale-105 hover:shadow-xl">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full gradient-orange-red">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl text-neutral-900">
                  {t('features.fast.title')}
                </CardTitle>
                <CardDescription className="text-base text-neutral-600">
                  {t('features.fast.description')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 gradient-bg-white-green shadow-lg transition-all hover:scale-105 hover:shadow-xl">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full gradient-green-blue">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl text-neutral-900">
                  {t('features.privacy.title')}
                </CardTitle>
                <CardDescription className="text-base text-neutral-600">
                  {t('features.privacy.description')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 gradient-bg-white-yellow shadow-lg transition-all hover:scale-105 hover:shadow-xl">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full gradient-purple-blue">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl text-neutral-900">
                  {t('features.share.title')}
                </CardTitle>
                <CardDescription className="text-base text-neutral-600">
                  {t('features.share.description')}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="px-4 py-12 sm:py-16">
        <div className="container mx-auto">
          <div className="mb-8 text-center sm:mb-12">
            <h2 className="mb-3 text-3xl font-bold text-neutral-900 sm:mb-4 sm:text-4xl">
              {t('howItWorks.title')}
            </h2>
            <p className="px-4 text-base text-neutral-600 sm:text-lg">
              {t('howItWorks.description')}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="group text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full gradient-purple-blue shadow-lg transition-transform group-hover:scale-110">
                <span className="text-xl font-bold text-white">1</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-neutral-900">
                {t('howItWorks.step1.title')}
              </h3>
              <p className="px-2 text-base text-neutral-600">
                {t('howItWorks.step1.description')}
              </p>
            </div>

            <div className="group text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full gradient-green-yellow shadow-lg transition-transform group-hover:scale-110">
                <span className="text-xl font-bold text-white">2</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-neutral-900">
                {t('howItWorks.step2.title')}
              </h3>
              <p className="px-2 text-base text-neutral-600">
                {t('howItWorks.step2.description')}
              </p>
            </div>

            <div className="group text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full gradient-green-blue shadow-lg transition-transform group-hover:scale-110">
                <span className="text-xl font-bold text-white">3</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-neutral-900">
                {t('howItWorks.step3.title')}
              </h3>
              <p className="px-2 text-base text-neutral-600">
                {t('howItWorks.step3.description')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden gradient-purple-blue-green px-4 py-12 sm:py-16">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 container mx-auto text-center">
          <h2 className="mb-3 px-4 text-3xl font-bold text-white sm:mb-4 sm:text-4xl">
            {t('cta.title')}
          </h2>
          <p className="mx-auto mb-6 max-w-2xl px-4 text-base text-white/90 sm:mb-8 sm:text-lg">
            {t('cta.description')}
          </p>
          <div className="px-4">
            <Link href="/create" className="inline-block w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                className="w-full bg-white text-purple-600 shadow-xl transition-all hover:scale-105 hover:bg-neutral-100 sm:w-auto"
              >
                <Users className="mr-2 h-5 w-5" />
                <span className="hidden sm:inline">{t('cta.button')}</span>
                <span className="sm:hidden">{t('cta.buttonMobile')}</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 px-4 py-8 text-white">
        <div className="container mx-auto text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Calendar className="h-6 w-6" />
            <span className="text-lg font-semibold">{t('footer.brand')}</span>
          </div>
          <p className="text-sm text-gray-400">
            {t('footer.tagline')}
          </p>
        </div>
      </footer>
    </>
  );
}
