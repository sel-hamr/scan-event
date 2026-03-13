"use client";

import { Suspense, useState } from "react";
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
import Link from "next/link";
import { Shield } from "lucide-react";

function LoginContent() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

      const redirectTo = result?.user?.role === "PARTICIPANT" ? "/events" : "/";
      window.location.href = redirectTo;
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white p-4 relative overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-black">
        <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-blue-900/20 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vh] bg-purple-900/20 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2 mix-blend-screen pointer-events-none"></div>
      </div>

      <Card className="w-full max-w-md bg-zinc-950/80 backdrop-blur-xl border-zinc-900 shadow-2xl">
        <CardHeader className="space-y-2 flex flex-col items-center pt-8 pb-4">
          <div className="w-16 h-16 bg-linear-to-tr from-zinc-800 to-zinc-900 rounded-2xl flex items-center justify-center mb-4 border border-zinc-800 shadow-inner">
            <Shield className="w-8 h-8 text-zinc-300" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-white">
            Sign In
          </CardTitle>
          <CardDescription className="text-zinc-400 text-center">
            Welcome back to your event management dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300 ml-1">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600 focus-visible:border-zinc-700 transition-all h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300 ml-1">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600 focus-visible:border-zinc-700 transition-all h-11"
              />
            </div>

            {error && (
              <div className="text-sm font-medium text-red-400 bg-red-950/50 border border-red-900/50 p-3 rounded-lg flex items-center space-x-2 animate-in fade-in slide-in-from-top-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-alert-circle shrink-0"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="8" y2="12" />
                  <line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-white text-black hover:bg-zinc-200 h-11 font-medium transition-colors"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t border-zinc-900/50 pt-6 pb-8">
          <p className="text-sm text-zinc-500">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-zinc-300 hover:text-white transition-colors"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
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
