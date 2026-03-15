"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/app/actions/user-actions";
import { PublicNavbar } from "@/components/layout/public-navbar";
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
import { AlertCircle, Shield, Sparkles, UserPlus, Users } from "lucide-react";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    try {
      const result = await registerUser(formData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else if (result?.success) {
        router.push("/login?registered=true");
      }
    } catch {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-12 right-0 h-80 w-80 rounded-full bg-chart-3/10 blur-3xl" />
      </div>
      <PublicNavbar />
      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl lg:grid-cols-2">
        <section className="hidden border-r border-border/70 p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="space-y-4">
            <Badge variant="secondary" className="w-fit gap-2 px-3 py-1">
              <Sparkles className="h-3.5 w-3.5" />
              Start with orcheo
            </Badge>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight xl:text-5xl">
              Launch your event operations stack in minutes.
            </h1>
            <p className="max-w-md text-muted-foreground">
              Create your workspace, invite your team, and manage events,
              speakers, sponsors, tickets, and attendee networking from one hub.
            </p>
          </div>

          <div className="space-y-4 rounded-2xl border border-border/80 bg-card/90 p-6 shadow-sm backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-secondary p-2">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Built for growing teams</p>
                <p className="text-sm text-muted-foreground">
                  Collaborate across organizers, sponsors, and support staff.
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-secondary p-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Secure by default</p>
                <p className="text-sm text-muted-foreground">
                  Authentication and role permissions keep your data protected.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-4 sm:p-8">
          <Card className="w-full max-w-md border-border/80 bg-card/95 shadow-lg backdrop-blur">
            <CardHeader className="space-y-2">
              <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                <UserPlus className="h-4 w-4" />
                Create your account
              </div>
              <CardTitle className="text-2xl">Get started</CardTitle>
              <CardDescription>
                Set up your account to access the orcheo platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    required
                    autoComplete="name"
                    className="h-11"
                  />
                </div>
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
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    className="h-11"
                  />
                </div>

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
                  {loading ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex items-center justify-center border-t border-border pt-6">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-foreground">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </section>
      </div>
    </div>
  );
}
