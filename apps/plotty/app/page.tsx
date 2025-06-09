import Link from "next/link";

import { Calendar, Users, Shield, Zap, Globe } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

import { Button } from "@workspace/ui/components/button";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <div className="relative overflow-hidden px-4 py-12 sm:py-16 lg:py-20">
        {/* Background gradient */}
        <div className="absolute inset-0 gradient-bg-purple-blue"></div>

        <div className="relative z-10 container mx-auto text-center">
          <h1 className="mb-4 text-4xl font-bold sm:mb-6 sm:text-5xl lg:text-6xl">
            <span className="gradient-purple-blue bg-clip-text text-transparent">
              Schedule Meetings
            </span>
            <br />
            <span className="text-neutral-900">without hassle</span>
          </h1>
          <p className="mx-auto mb-6 max-w-2xl px-4 text-lg text-neutral-600 sm:mb-8 sm:text-xl">
            Create polls to find the perfect time for your meetings. Simple,
            fast, and privacy-focused.
          </p>
          <div className="flex flex-col justify-center gap-3 px-4 sm:flex-row sm:gap-4">
            <Link href="/create" className="w-full sm:w-auto">
              <Button
                variant="default"
                size="lg"
                className="w-full border-0 sm:w-auto"
              >
                <Users className="mr-2 h-5 w-5" />
                <span className="hidden sm:inline">
                  Create a Poll, no login required!
                </span>

                <span className="sm:hidden">Create a Poll</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white px-4 py-12 sm:py-16">
        <div className="container mx-auto">
          <div className="mb-8 text-center sm:mb-12">
            <h2 className="mb-3 text-3xl font-bold text-neutral-900 sm:mb-4 sm:text-4xl">
              Why Choose Plotty?
            </h2>
            <p className="mx-auto max-w-2xl px-4 text-base text-neutral-600 sm:text-lg">
              Built with privacy and simplicity in mind, our scheduling tool
              makes it easy to coordinate with anyone.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-0 gradient-bg-white-orange shadow-lg transition-all hover:scale-105 hover:shadow-xl">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full gradient-orange-red">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl text-neutral-900">
                  Lightning Fast
                </CardTitle>
                <CardDescription className="text-base text-neutral-600">
                  Create polls in seconds. No lengthy forms or complicated setup
                  required.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 gradient-bg-white-green shadow-lg transition-all hover:scale-105 hover:shadow-xl">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full gradient-green-blue">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl text-neutral-900">
                  Privacy First
                </CardTitle>
                <CardDescription className="text-base text-neutral-600">
                  Your data is automatically deleted after 30 days. No tracking,
                  no ads, no data mining.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 gradient-bg-white-yellow shadow-lg transition-all hover:scale-105 hover:shadow-xl">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full gradient-purple-blue">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl text-neutral-900">
                  Share Anywhere
                </CardTitle>
                <CardDescription className="text-base text-neutral-600">
                  Send a simple link to participants. No accounts required for
                  voting.
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
              How It Works
            </h2>
            <p className="px-4 text-base text-neutral-600 sm:text-lg">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="group text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full gradient-purple-blue shadow-lg transition-transform group-hover:scale-110">
                <span className="text-xl font-bold text-white">1</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-neutral-900">
                Create Your Poll
              </h3>
              <p className="px-2 text-base text-neutral-600">
                Add your meeting title, description, and propose multiple dates
                and times.
              </p>
            </div>

            <div className="group text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full gradient-green-yellow shadow-lg transition-transform group-hover:scale-110">
                <span className="text-xl font-bold text-white">2</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-neutral-900">
                Share the Link
              </h3>
              <p className="px-2 text-base text-neutral-600">
                Send the poll link to participants via email, chat, or any
                messaging platform.
              </p>
            </div>

            <div className="group text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full gradient-green-blue shadow-lg transition-transform group-hover:scale-110">
                <span className="text-xl font-bold text-white">3</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-neutral-900">
                Find the Best Time
              </h3>
              <p className="px-2 text-base text-neutral-600">
                View responses in real-time and easily identify the most popular
                time slots.
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
            Ready to Schedule Your Next Meeting?
          </h2>
          <p className="mx-auto mb-6 max-w-2xl px-4 text-base text-white/90 sm:mb-8 sm:text-lg">
            Join thousands of users who trust our platform for their scheduling
            needs.
          </p>
          <div className="px-4">
            <Link href="/create" className="inline-block w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                className="w-full bg-white text-purple-600 shadow-xl transition-all hover:scale-105 hover:bg-neutral-100 sm:w-auto"
              >
                <Users className="mr-2 h-5 w-5" />
                <span className="hidden sm:inline">Create Your First Poll</span>
                <span className="sm:hidden">Get Started</span>
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
            <span className="text-lg font-semibold">Plotty</span>
          </div>
          <p className="text-sm text-gray-400">
            Privacy-focused scheduling made simple. Built with ❤️ for better
            meetings.
          </p>
        </div>
      </footer>
    </>
  );
}
