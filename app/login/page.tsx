"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PublicNavbar } from "@/components/layout/public-navbar";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";

function LoginContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const registered = searchParams?.get("registered") === "true";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result?.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }

      const redirectTo = result?.user?.role === "SUPER_ADMIN" ? "/" : "/events";
      window.location.href = redirectTo;
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-80 w-80 rounded-full bg-chart-2/10 blur-3xl" />
      </div>
      <PublicNavbar />
      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl lg:grid-cols-2">
        <section className="hidden border-r border-border/70 p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="space-y-4">
            <Badge variant="secondary" className="w-fit gap-2 px-3 py-1">
              <Sparkles className="h-3.5 w-3.5" />
              orcheo Platform
            </Badge>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight xl:text-5xl">
              Manage events, attendees, and growth from one dashboard.
            </h1>
            <p className="max-w-md text-muted-foreground">
              orcheo gives your team a fast, secure workspace to operate events,
              track sponsors, and streamline check-ins.
            </p>
          </div>

          <div className="space-y-4 rounded-2xl border border-border/80 bg-card/90 p-6 shadow-sm backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-secondary p-2">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  Built for event operations teams
                </p>
                <p className="text-sm text-muted-foreground">
                  Tickets, sponsors, networking, and scanner workflows in one
                  place.
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-secondary p-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Secure role-based access</p>
                <p className="text-sm text-muted-foreground">
                  Separate organizer and participant experiences with protected
                  routes.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-4 sm:p-8">
          <Card className="w-full max-w-md border-border/80 bg-card/95 shadow-lg backdrop-blur">
            <CardHeader className="space-y-2">
              <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                Secure Sign In
              </div>
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>
                Sign in to continue to your orcheo dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    autoComplete="email"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="h-11"
                  />
                </div>

                {registered && !error && (
                  <div className="flex items-center gap-2 rounded-md border border-border bg-secondary/60 p-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4" />
                    Account created successfully. Please sign in.
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  className="h-11 w-full"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex items-center justify-center border-t border-border pt-6">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-medium text-foreground">
                  Create one
                </Link>
              </p>
            </CardFooter>
          </Card>
        </section>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
