"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/hooks";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await login(email);
      if (response.success) {
        router.push("/auth/magic-link-sent");
      }
    } catch {
      setError("Failed to send magic link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>
          Enter your email to receive a magic link for sign in
        </CardDescription>

        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
          required
        />
      </CardContent>

      <CardFooter className="flex-col gap-4">
        <Button type="submit" className="w-full" isLoading={isLoading}>
          Send Magic Link
        </Button>

        <p className="text-sm text-center text-slate-600">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-primary hover:underline">
            Contact your organization
          </Link>
        </p>
      </CardFooter>
    </form>
  );
}
